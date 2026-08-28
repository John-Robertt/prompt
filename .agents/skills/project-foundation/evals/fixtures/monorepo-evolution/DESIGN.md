# CSV 报告系统 v2 设计

系统读取本地 CSV 并生成文本报告。Ingest 包负责把 CSV 转换成项目自己的 `RecordBatch`，Report 包只接收 `RecordBatch` 并生成报告。无效 CSV 返回错误，不生成部分报告。

Ingest 和 Report 独立发布、独立验证、独立推进，但共享仓库级文档与结构规则。当前 v1 代码仍在包之间传递字符串数组；v2 的 `RecordBatch` 和迁移目标已经确认。
