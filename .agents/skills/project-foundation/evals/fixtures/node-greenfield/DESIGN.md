# Alert Digest 产品设计

本项目读取一批 JSON 告警，按服务和严重级别整理后生成 Markdown 摘要。

系统交付三个结果：

1. Alert Reader 从调用方给出的文件读取告警；
2. Digest Builder 把告警整理成按服务分组的摘要；
3. Markdown Exporter 输出 Markdown 文本。

模块通过项目自己的 `Alert` 和 `Digest` 数据交接。读取失败必须返回明确错误，不能输出部分摘要。当前版本只处理本地文件，不负责网络采集、告警存储和用户认证。
