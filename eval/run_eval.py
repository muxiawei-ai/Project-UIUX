#!/usr/bin/env python3
"""主评估：精确匹配打分，不调用任何模型。

输出三个数（选对率 / 该转人工却硬答 / 最易混淆的答案对）加置信区间。
结果确定、免费、跑一百遍一样。用法见 README.md。
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent

DEFAULT_FIELDS = {
    "answers": {"id": "id", "title": "title", "text": "text"},
    "questions": {
        "id": "id",
        "text": "text",
        "expected": "expected",
        "expect_handoff": "expect_handoff",
    },
    "predictions": {
        "question_id": "question_id",
        "predicted": "predicted",
        "candidates": "candidates",
    },
}


def load_jsonl(path: Path) -> list[dict]:
    rows = []
    with path.open(encoding="utf-8") as f:
        for lineno, line in enumerate(f, 1):
            line = line.strip()
            if not line or line.startswith("//"):
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError as exc:
                sys.exit(f"{path}:{lineno} JSON 解析失败: {exc}")
    return rows


def load_fields(config_path: Path | None) -> dict:
    fields = {k: dict(v) for k, v in DEFAULT_FIELDS.items()}
    if config_path is None:
        return fields
    raw = json.loads(config_path.read_text(encoding="utf-8"))
    for section, mapping in raw.items():
        if section in fields and isinstance(mapping, dict):
            fields[section].update(mapping)
    return fields


def remap(rows: list[dict], mapping: dict) -> list[dict]:
    """把用户自己的字段名翻译成脚本内部用的名字。"""
    out = []
    for row in rows:
        out.append({internal: row.get(external) for internal, external in mapping.items()})
    return out


def wilson(hits: int, total: int, z: float = 1.96) -> tuple[float, float]:
    """Wilson 区间。小样本下比正态近似靠谱，且不会算出负数或超过 1。"""
    if total == 0:
        return (0.0, 0.0)
    p = hits / total
    denom = 1 + z * z / total
    center = (p + z * z / (2 * total)) / denom
    margin = z * math.sqrt(p * (1 - p) / total + z * z / (4 * total * total)) / denom
    return (max(0.0, center - margin), min(1.0, center + margin))


def evaluate(questions: list[dict], predictions: list[dict]) -> dict:
    pred_by_qid = {p["question_id"]: p for p in predictions}

    hits = 0
    answerable = 0            # 库里有答案、系统也答了的题（选对率的分母）
    handoff_expected = 0      # 该转人工的题
    handoff_missed = 0        # 该转人工却硬答了
    over_handoff = 0          # 库里有答案却转了人工
    missing = []              # 题库里有、预测里没有
    confusion: Counter = Counter()
    wrong_ids: list[str] = []

    for q in questions:
        pred = pred_by_qid.get(q["id"])
        if pred is None:
            missing.append(q["id"])
            continue

        expected = q.get("expected") or []
        predicted = pred.get("predicted")

        if q.get("expect_handoff"):
            handoff_expected += 1
            if predicted is not None:
                handoff_missed += 1
                wrong_ids.append(q["id"])
            continue

        if predicted is None:
            over_handoff += 1
            wrong_ids.append(q["id"])
            continue

        answerable += 1
        if predicted in expected:
            hits += 1
        else:
            wrong_ids.append(q["id"])
            gold = expected[0] if expected else "?"
            confusion[(gold, predicted)] += 1

    return {
        "hits": hits,
        "answerable": answerable,
        "hit_rate": hits / answerable if answerable else 0.0,
        "ci": wilson(hits, answerable),
        "handoff_expected": handoff_expected,
        "handoff_missed": handoff_missed,
        "answerable_total": answerable + over_handoff,
        "over_handoff": over_handoff,
        "confusion": confusion,
        "missing": missing,
        "wrong_ids": wrong_ids,
    }


def label(answers: dict[str, dict], aid: str) -> str:
    row = answers.get(aid)
    return f"{aid} {row['title']}" if row and row.get("title") else str(aid)


def pct(x: float) -> str:
    return f"{x * 100:.1f}%"


def report(result: dict, answers: dict[str, dict], top: int) -> None:
    lo, hi = result["ci"]
    print()
    print("=" * 62)
    print("  主评估结果")
    print("=" * 62)
    print()
    print(
        f"  选对率          {pct(result['hit_rate']):>7}"
        f"  ({result['hits']}/{result['answerable']})"
        f"   95% CI [{pct(lo)}, {pct(hi)}]"
    )

    missed = result["handoff_missed"]
    expected = result["handoff_expected"]
    flag = "   ← 最大风险" if missed else ""
    print(f"  该转人工却硬答  {missed:>4}/{expected}{flag}")
    print(f"  误转人工        {result['over_handoff']:>4}/{result['answerable_total']}")

    if result["missing"]:
        n = len(result["missing"])
        sample = ", ".join(result["missing"][:5])
        print(f"\n  ⚠ 有 {n} 道题没有对应预测，未计入: {sample}{' …' if n > 5 else ''}")

    if result["confusion"]:
        print()
        print("-" * 62)
        print("  最易混淆的答案对（改答案库就从这里下手）")
        print("-" * 62)
        for (gold, pred), count in result["confusion"].most_common(top):
            print(f"  {count:>3} 次   {label(answers, gold)}  →  {label(answers, pred)}")

    print()
    span = hi - lo
    print(f"  提示：当前样本量下，选对率的不确定区间约 ±{pct(span / 2)}。")
    print(f"        小于这个幅度的变化不要当成改进。")
    print()


def compare(current: dict, baseline: dict) -> None:
    c_lo, c_hi = current["ci"]
    b_lo, b_hi = baseline["ci"]
    delta = current["hit_rate"] - baseline["hit_rate"]
    overlap = c_lo <= b_hi and b_lo <= c_hi

    print("-" * 62)
    print("  与基准对比")
    print("-" * 62)
    print(f"  基准选对率      {pct(baseline['hit_rate'])}  ({baseline['hits']}/{baseline['answerable']})")
    print(f"  本次选对率      {pct(current['hit_rate'])}  ({current['hits']}/{current['answerable']})")
    print(f"  差值            {delta * 100:+.1f} 个百分点")
    print()
    if overlap:
        print("  ⚠ 两次的置信区间重叠——这个差异在噪声范围内，不能当成改进或退步。")
        print("    要么加样本量，要么承认这次改动没有可测的效果。")
    else:
        print("  ✓ 置信区间不重叠，差异超出了噪声范围。")
    print()


def main() -> None:
    ap = argparse.ArgumentParser(description="客服 Agent 主评估（精确匹配，不调模型）")
    ap.add_argument("--questions", type=Path, default=HERE / "data/questions.sample.jsonl")
    ap.add_argument("--predictions", type=Path, default=HERE / "data/predictions.sample.jsonl")
    ap.add_argument("--answers", type=Path, default=HERE / "data/answers.sample.jsonl")
    ap.add_argument("--config", type=Path, default=None, help="字段映射，见 config.example.json")
    ap.add_argument("--baseline", type=Path, default=None, help="另一份预测，用于对比两次结果")
    ap.add_argument("--top", type=int, default=10, help="展示多少组混淆对")
    ap.add_argument("--json", type=Path, default=None, help="把结果另存为 JSON")
    args = ap.parse_args()

    fields = load_fields(args.config)

    questions = remap(load_jsonl(args.questions), fields["questions"])
    predictions = remap(load_jsonl(args.predictions), fields["predictions"])
    answers = {a["id"]: a for a in remap(load_jsonl(args.answers), fields["answers"])}

    result = evaluate(questions, predictions)
    report(result, answers, args.top)

    if args.baseline:
        base = remap(load_jsonl(args.baseline), fields["predictions"])
        compare(result, evaluate(questions, base))

    if args.json:
        payload = {
            k: v for k, v in result.items() if k not in {"confusion", "ci"}
        }
        payload["ci"] = list(result["ci"])
        payload["confusion"] = [
            {"expected": g, "predicted": p, "count": c}
            for (g, p), c in result["confusion"].most_common()
        ]
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"  结果已写入 {args.json}\n")


if __name__ == "__main__":
    main()
