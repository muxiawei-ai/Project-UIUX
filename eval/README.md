# 客服 Agent 评估工具

配套文档：[`docs/llm-judge-playbook.md`](../docs/llm-judge-playbook.md)

两个脚本，分工明确：

| 脚本 | 用途 | 是否调模型 |
|---|---|---|
| `run_eval.py` | **主评估**。精确匹配打分，出三个数 + 混淆对 + 置信区间 | ❌ 不调 |
| `judge.py` | 三个辅助用途：扩题库 / 判转人工 / 判模糊题 | ✅ 调 |

主评估不需要裁判，所以它免费、秒出、跑一百遍结果一样。先用它，`judge.py` 是补充。

---

## 快速开始

```bash
cd eval

# 1. 主评估（用自带样例数据，可直接跑）
python3 run_eval.py

# 2. 对比两次跑的结果，看波动有多大
python3 run_eval.py --predictions data/predictions.sample.jsonl \
                    --baseline    data/predictions.sample.jsonl
```

`run_eval.py` 只用标准库，无依赖。`judge.py` 需要：

```bash
pip install anthropic
export ANTHROPIC_API_KEY=...     # 或 ant auth login
```

---

## 数据格式

三个 JSONL 文件。字段名可以通过 `config.json` 映射成你自己的（见下）。

### `answers.jsonl` — 答案库

```json
{"id": "A012", "title": "人脸识别失败", "text": "请确认光线充足、正脸对准取景框……"}
```

### `questions.jsonl` — 题库（评估的核心资产）

```json
{"id": "Q001", "text": "人脸识别老是失败", "expected": ["A012"]}
{"id": "Q007", "text": "你们贷款利率多少", "expected": [], "expect_handoff": true}
```

- `expected`：可接受的答案 ID 列表。**允许多个**——模糊题就填多个，命中任意一个算对。
- `expect_handoff`：`true` 表示库里没有合适答案，正确行为是转人工。此时 `expected` 应为空。

### `predictions.jsonl` — 你的系统跑出来的结果

```json
{"question_id": "Q001", "predicted": "A012", "candidates": ["A012", "A031"]}
{"question_id": "Q007", "predicted": null}
```

- `predicted`：选中的答案 ID；`null` 表示系统转了人工。
- `candidates`：可选，召回的候选 ID 列表。给了的话 `judge.py handoff` 会用它，否则只看 `predicted`。

### 字段映射

如果你的实际字段名不一样，复制 `config.example.json` 为 `config.json` 改键名即可，不用改数据：

```json
{ "questions": { "id": "qid", "text": "query", "expected": "gold_answer_ids" } }
```

然后 `python3 run_eval.py --config config.json`。

---

## `run_eval.py` 输出的三个数

```
选对率            88.0%  (44/50)   95% CI [76.2%, 94.4%]
该转人工却硬答     2/5              ← 最大风险，优先看这个
误转人工           1/45

最易混淆的答案对
  12 次  A012 人脸识别失败  →  A031 APP 闪退
   4 次  A007 还款日查询    →  A009 额度查询
```

**混淆对是最有行动价值的一栏**，它直接告诉你该改答案库的哪两条：内容太接近就合并，一条盖了两种情况就拆开，说法没覆盖就补进去。

**置信区间是防自欺的**。50 条样本上的 88% 真实区间是 76%–94%，所以"从 82% 涨到 85%"多半是噪声。跑 `--baseline` 会自动提示两次结果的区间是否重叠。

---

## `judge.py` 三个子命令

三个提示词都放在 `prompts/` 下，是纯 Markdown，可以直接改。每条输出都会记录提示词文件的 SHA 和模型 ID，改了提示词一眼能看出来是哪一版跑的。

### 1. 扩题库（先做这个，收益最高）

```bash
python3 judge.py expand --questions data/questions.sample.jsonl \
                        --out out/variants.jsonl --n 8
```

把每条标准问法扩成 8 条口语说法。拿扩出来的题重跑一遍系统，看是不是都落到同一条答案——落错的，就是答案库该补说法的地方。

### 2. 判该不该转人工（最重要的边界）

```bash
python3 judge.py handoff --questions data/questions.sample.jsonl \
                         --answers   data/answers.sample.jsonl \
                         --predictions data/predictions.sample.jsonl \
                         --out out/handoff.jsonl
```

对每条问题判断"库里到底有没有合适答案"。`verdict=没有` 却被系统答了的，就是该转人工没转的案例。`confidence=低` 的全部路由人工复核。

### 3. 判模糊题

```bash
python3 judge.py grade --questions data/questions.sample.jsonl \
                       --answers   data/answers.sample.jsonl \
                       --predictions data/predictions.sample.jsonl \
                       --out out/grades.jsonl
```

三档判定：合格 / 勉强 / 不合格。用于精确匹配失效的题（多个答案都说得通），以及抽查场景错配。

### 通用参数

| 参数 | 说明 |
|---|---|
| `--model` | 默认 `claude-opus-5` |
| `--effort` | `low`/`medium`/`high`/`xhigh`/`max`，默认 `low`（裁判任务够用） |
| `--concurrency` | 并发数，默认 4 |
| `--limit` | 只跑前 N 条，调提示词时用 |

模型不接受 `temperature` 参数（当前模型已移除，传了会 400）。裁判的稳定性靠**粗分档 + 结构化输出 + 锚点样例**保证，不靠采样参数。

---

## 建议的落地顺序

1. 从线上真实提问抽 100–200 条，标注正确答案编号 → `questions.jsonl`
2. 系统跑两遍，`run_eval.py --baseline` 看波动范围（这是后面所有对比的基准）
3. 看三个数，重点是"该转人工却硬答"
4. `judge.py expand` 扩说法，测同题不同问法稳不稳
5. **按混淆对改答案库**——这一步收益最大
6. `judge.py handoff` 专测转人工边界
7. 只有当判定要驱动自动化动作时，才做人工校准（见 playbook 第五节）
