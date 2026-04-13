# PDF → 题库 JSON（阶段 A：半自动）操作说明

本项目在 GitHub Pages 上运行，不依赖后端，因此题库需要以**静态文件**形式存在（推荐：`public/data/*.json`）。

你当前的题库来源是 **PDF**，建议先采用“半自动抽取 + 人工校对”的阶段 A，确保能稳定推进。

## 目标产物
- **最终题库 JSON**：放到 `public/data/questions.json`
- **字段规范**：见 `src/app/types.ts` 的 `Question` 类型（含 `source.file/page` 溯源字段）

## 推荐中间格式（更好维护）
建议先用 **CSV** 或 **JSON** 做“中间文件”，把从 PDF 抽取的内容规范化，再转换成最终题库 JSON。

### 方案 1：CSV（最适合从表格整理）
CSV 表头建议：
- `id`：如 `diag-001`
- `domain`：如 `diagnosis`
- `difficulty`：1/2/3
- `tags`：用 `;` 分隔，如 `four_exams;documentation`
- `prompt`：题干
- `keyPoints`：用 `|` 分隔要点，如 `要点1|要点2|要点3`
- `sourceFile`：PDF 文件名
- `sourcePage`：页码（数字）
- `followUps`：可选，用 `;` 分隔 id

示例（概念展示）：

```csv
id,domain,difficulty,tags,prompt,keyPoints,sourceFile,sourcePage,followUps
safety-001,safety,1,red_flags;documentation,遇到红旗征象你如何处理？,"立即停止操作|建议急诊/呼叫急救|完整记录与转诊",DHA_TCM_Interview_Bank.pdf,12,
```

### 方案 2：JSON（适合保留结构/多行文本）
用 `questions.raw.json` 维护原始抽取结果（可包含 `rawText` 字段），再由脚本生成最终 `questions.json`。

## 从 PDF 抽取内容（建议步骤）
- **1）获取文本**
  - 如果 PDF 可复制：直接复制出“题干/答案要点/页码”
  - 如果是扫描件：先用 OCR（系统预览/第三方工具均可），后续再考虑脚本化
- **2）按页码切块**：以“每题”或“每小节”为单位建立记录，确保能填写 `sourcePage`
- **3）录入中间格式**：补齐 `domain/tags/difficulty`（先粗分即可）
- **4）校对**：重点检查
  - 题干是否清晰、避免同义重复
  - 要点是否适合口试表达（短句、可背诵）
  - 溯源页码是否正确

## 转换成最终题库 JSON
后续代码里会提供一个简单转换脚本（读 CSV/JSON → 输出 `public/data/questions.json`）。

## 小建议（维护策略）
- 每次导入都保留 PDF 溯源：`source.file` + `source.page`
- 不追求一次性全量：先导入 50 题验证体验，再逐步扩充

