#!/usr/bin/env python3
"""裁判：三个辅助用途——扩题库 / 判转人工 / 判模糊题。

主评估不需要裁判（见 run_eval.py）。这里只覆盖精确匹配做不到的部分。
提示词在 prompts/ 下，每条输出都记录提示词的 SHA 和模型 ID，方便追溯是哪一版跑的。

用法见 README.md。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

from run_eval import HERE, load_fields, load_jsonl, remap

DEFAULT_MODEL = "claude-opus-5"
DEFAULT_EFFORT = "low"          # 裁判任务不吃智力，low 足够且便宜
DEFAULT_MAX_TOKENS = 8192       # 思考默认开启，也计入 max_tokens，留足余量

# 结构化输出的 schema。字段顺序即生成顺序——reason 放最前，保证先写理由再下结论。
SCHEMAS = {
    "expand": {
        "type": "object",
        "properties": {"variants": {"type": "array", "items": {"type": "string"}}},
        "required": ["variants"],
        "additionalProperties": False,
    },
    "handoff": {
        "type": "object",
        "properties": {
            "reason": {"type": "string"},
            "verdict": {"type": "string", "enum": ["有", "没有"]},
            "best_candidate": {"type": "integer", "enum": [0, 1, 2, 3, 4, 5]},
            "confidence": {"type": "string", "enum": ["高", "低"]},
        },
        "required": ["reason", "verdict", "best_candidate", "confidence"],
        "additionalProperties": False,
    },
    "grade": {
        "type": "object",
        "properties": {
            "reason": {"type": "string"},
            "verdict": {"type": "string", "enum": ["合格", "勉强", "不合格"]},
            "confidence": {"type": "string", "enum": ["高", "低"]},
        },
        "required": ["reason", "verdict", "confidence"],
        "additionalProperties": False,
    },
}


def render(template: str, **values: object) -> str:
    for key, value in values.items():
        template = template.replace("{{%s}}" % key, str(value))
    return template


def sha8(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:8]


def make_client():
    try:
        import anthropic
    except ImportError:
        sys.exit("需要先安装 SDK： pip install anthropic")
    # 凭据按 SDK 默认顺序解析：ANTHROPIC_API_KEY → ANTHROPIC_AUTH_TOKEN → ant auth login 的 profile
    return anthropic.Anthropic()


def call(client, prompt: str, schema: dict, model: str, effort: str, max_tokens: int) -> dict:
    """调一次模型，返回解析后的 JSON。异常由调用方按行捕获。"""
    import anthropic

    try:
        resp = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            output_config={"effort": effort, "format": {"type": "json_schema", "schema": schema}},
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.RateLimitError as exc:
        raise RuntimeError(f"限流（SDK 已自动重试过）: {exc}") from exc
    except anthropic.APIStatusError as exc:
        raise RuntimeError(f"API {exc.status_code}: {exc.message}") from exc
    except anthropic.APIConnectionError as exc:
        raise RuntimeError(f"网络错误: {exc}") from exc

    if resp.stop_reason == "refusal":
        raise RuntimeError("模型拒答，跳过此条")
    if resp.stop_reason == "max_tokens":
        raise RuntimeError("输出被 max_tokens 截断，调大 --max-tokens 重试")

    text = "".join(b.text for b in resp.content if b.type == "text")
    return json.loads(text)


def run_batch(tasks: list[dict], schema: dict, args, prompt_sha: str) -> list[dict]:
    """tasks 里每项是 {"meta": {...}, "prompt": "..."}。返回带结果的记录。"""
    if args.dry_run:
        print("--- 第一条渲染后的提示词（dry-run，未调用 API）---\n")
        print(tasks[0]["prompt"] if tasks else "(没有可跑的条目)")
        print("\n--- 共 %d 条待跑 ---" % len(tasks))
        return []

    client = make_client()
    meta_common = {
        "model": args.model,
        "effort": args.effort,
        "prompt_file": args.prompt.name,
        "prompt_sha": prompt_sha,
        "run_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }

    def work(task: dict) -> dict:
        record = {**task["meta"], **meta_common}
        try:
            record.update(call(client, task["prompt"], schema, args.model, args.effort, args.max_tokens))
        except Exception as exc:  # 单条失败不打断整批
            record["error"] = str(exc)
        return record

    with ThreadPoolExecutor(max_workers=args.concurrency) as pool:
        records = list(pool.map(work, tasks))

    failed = sum(1 for r in records if "error" in r)
    print(f"完成 {len(records)} 条，失败 {failed} 条。")
    if failed:
        for r in records[:200]:
            if "error" in r:
                print(f"  ✗ {r.get('question_id', '?')}: {r['error']}")
    if failed == len(records):
        print("\n⚠ 全部失败，结果文件里没有可用判定。先按上面的报错排查（多半是凭据或模型 ID）。")
    return records


def build_expand(questions: list[dict], _answers, _preds, args, template: str) -> list[dict]:
    tasks = []
    for q in questions:
        if not q.get("text"):
            continue
        tasks.append(
            {
                "meta": {"question_id": q["id"], "source": q["text"]},
                "prompt": render(template, question=q["text"], n=args.n),
            }
        )
    return tasks


def format_candidates(ids: list[str], answers: dict[str, dict]) -> str:
    lines = []
    for i, aid in enumerate(ids, 1):
        row = answers.get(aid, {})
        title = row.get("title") or aid
        text = row.get("text") or "(答案库中未找到此条)"
        lines.append(f"{i}. 【{title}】{text}")
    return "\n".join(lines)


def build_handoff(questions: list[dict], answers, preds, args, template: str) -> list[dict]:
    pred_by_qid = {p["question_id"]: p for p in preds}
    tasks = []
    for q in questions:
        pred = pred_by_qid.get(q["id"], {})
        ids = pred.get("candidates") or ([pred["predicted"]] if pred.get("predicted") else [])
        if not ids:
            continue
        ids = ids[: args.max_candidates]
        tasks.append(
            {
                "meta": {"question_id": q["id"], "query": q["text"], "candidates": ids},
                "prompt": render(
                    template, query=q["text"], candidates=format_candidates(ids, answers)
                ),
            }
        )
    return tasks


def build_grade(questions: list[dict], answers, preds, args, template: str) -> list[dict]:
    pred_by_qid = {p["question_id"]: p for p in preds}
    tasks = []
    for q in questions:
        pred = pred_by_qid.get(q["id"], {})
        aid = pred.get("predicted")
        if not aid:  # 转了人工，没有可评的回答
            continue
        row = answers.get(aid, {})
        answer = f"【{row.get('title', aid)}】{row.get('text', '(答案库中未找到此条)')}"
        tasks.append(
            {
                "meta": {"question_id": q["id"], "query": q["text"], "predicted": aid},
                "prompt": render(template, query=q["text"], answer=answer),
            }
        )
    return tasks


BUILDERS = {"expand": build_expand, "handoff": build_handoff, "grade": build_grade}


def main() -> None:
    ap = argparse.ArgumentParser(description="裁判：扩题库 / 判转人工 / 判模糊题")
    ap.add_argument("mode", choices=["expand", "handoff", "grade"])
    ap.add_argument("--questions", type=Path, default=HERE / "data/questions.sample.jsonl")
    ap.add_argument("--answers", type=Path, default=HERE / "data/answers.sample.jsonl")
    ap.add_argument("--predictions", type=Path, default=HERE / "data/predictions.sample.jsonl")
    ap.add_argument("--config", type=Path, default=None, help="字段映射，见 config.example.json")
    ap.add_argument("--prompt", type=Path, default=None, help="覆盖默认的 prompts/<mode>.md")
    ap.add_argument("--out", type=Path, default=None, help="结果写到这个 JSONL")
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--effort", default=DEFAULT_EFFORT,
                    choices=["low", "medium", "high", "xhigh", "max"])
    ap.add_argument("--max-tokens", type=int, default=DEFAULT_MAX_TOKENS)
    ap.add_argument("--concurrency", type=int, default=4)
    ap.add_argument("--limit", type=int, default=None, help="只跑前 N 条，调提示词时用")
    ap.add_argument("--n", type=int, default=8, help="expand: 每条扩几个变体")
    ap.add_argument("--max-candidates", type=int, default=5, help="handoff: 最多带几个候选")
    ap.add_argument("--dry-run", action="store_true", help="只打印第一条提示词，不调 API")
    args = ap.parse_args()

    args.prompt = args.prompt or HERE / f"prompts/{args.mode}.md"
    template = args.prompt.read_text(encoding="utf-8")

    fields = load_fields(args.config)
    questions = remap(load_jsonl(args.questions), fields["questions"])
    answers = {a["id"]: a for a in remap(load_jsonl(args.answers), fields["answers"])}
    preds = remap(load_jsonl(args.predictions), fields["predictions"]) if args.predictions.exists() else []

    if args.limit:
        questions = questions[: args.limit]

    tasks = BUILDERS[args.mode](questions, answers, preds, args, template)
    if not tasks:
        sys.exit("没有可跑的条目——检查输入文件和字段映射。")

    records = run_batch(tasks, SCHEMAS[args.mode], args, sha8(template))
    if not records:
        return

    out = args.out or HERE / f"out/{args.mode}.jsonl"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"结果已写入 {out}")

    if args.mode in ("handoff", "grade"):
        low = sum(1 for r in records if r.get("confidence") == "低")
        print(f"其中 {low} 条低置信，建议路由人工复核。")


if __name__ == "__main__":
    main()
