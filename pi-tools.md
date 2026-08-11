# 从原始 Pi 恢复当前工具套装

本文用于在一台只有 Node.js/npm 的新机器上，从原始 Pi 恢复当前工具、扩展和非敏感配置。

## 恢复结果

完成后应具备：

- Pi `0.84.1`
- Hashline 文件读取、替换和撤销
- FFF 文件及文本搜索
- CodeGraph 代码理解
- Context7 技术文档查询
- MCP 网关和直接工具
- Web 搜索及内容获取
- 子代理
- RTK Bash 输出压缩
- ast-grep AST 结构搜索
- jq JSON 提取

## 1. 安装原始 Pi

如果 `pi` 已经可以运行，跳过本节。

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent@0.84.1
pi --version
```

预期版本：

```text
0.84.1
```

如果不要求复现当前版本，可以省略 `@0.84.1` 安装最新版。

## 2. 安装外部 CLI

### ast-grep 和 CodeGraph

```bash
npm install -g \
  @ast-grep/cli@0.45.1 \
  @colbymchenry/codegraph@1.5.0
```

### RTK

当前 RTK 安装在 `~/.local/bin/rtk`。Linux/macOS 可使用官方安装器，并固定当前版本：

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh \
  | env RTK_VERSION=v0.45.0 sh
```

确认 `~/.local/bin` 位于 PATH；如未配置，将以下内容加入 shell profile：

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Pi 通过扩展接入 RTK，不需要执行面向其他 Agent 的 `rtk init`。

### jq

Debian/Ubuntu：

```bash
sudo apt-get update
sudo apt-get install -y jq
```

macOS：

```bash
brew install jq
```

### CLI 验证

```bash
rtk --version
ast-grep --version
codegraph --version
jq --version
```

目标基线：

| CLI | 版本 |
|---|---:|
| `rtk` | `0.45.0` |
| `ast-grep` | `0.45.1` |
| `codegraph` | `1.5.0` |
| `jq` | `1.7` |

## 3. 安装 Pi 扩展

使用固定版本恢复当前功能：

```bash
pi install npm:pi-mcp-adapter@2.21.2
pi install npm:pi-hashline-edit-pro@2.5.0
pi install npm:@ff-labs/pi-fff@0.10.3
pi install npm:@tintinweb/pi-subagents@0.15.0
pi install npm:pi-web-access@0.21.0
pi install npm:@bacnh85/pi-rtk@0.1.12
```

扩展职责：

| 包 | 职责 |
|---|---|
| `pi-hashline-edit-pro` | `read`、`replace`、`undo_last_replace`；禁用原生 `edit` |
| `@ff-labs/pi-fff` | `fffind`、`ffgrep` |
| `pi-mcp-adapter` | MCP 连接、直接工具、`mcp`、`mcpScript` |
| `@tintinweb/pi-subagents` | `Agent`、`get_subagent_result`、`steer_subagent` |
| `pi-web-access` | `web_search`、`fetch_content`、`get_search_content` |
| `@bacnh85/pi-rtk` | 自动改写并压缩受支持的 Bash 命令 |

上面的固定版本命令保证首次恢复可复现。当前日常配置使用不带版本号的 package source，以便后续执行扩展更新。

## 4. 恢复全局 settings.json

Pi 全局配置位于：

```text
~/.pi/agent/settings.json
```

如果该文件已有需要保留的内容，先备份：

```bash
cp ~/.pi/agent/settings.json ~/.pi/agent/settings.json.before-tools
```

在新安装环境中，将其设置为以下非敏感配置。`packages` 故意恢复为当前的不固定版本形式；第 3 节已经安装了目标版本。

```json
{
  "defaultProvider": "openai-codex",
  "defaultModel": "gpt-5.6-sol",
  "defaultThinkingLevel": "high",
  "theme": "dark",
  "packages": [
    "npm:pi-mcp-adapter",
    "npm:pi-hashline-edit-pro",
    "npm:@ff-labs/pi-fff",
    "npm:@tintinweb/pi-subagents",
    "npm:pi-web-access",
    "npm:@bacnh85/pi-rtk"
  ],
  "subagents": {
    "agentOverrides": {
      "advisor": {
        "tools": [
          "read", "grep", "find", "ls", "bash", "intercom", "compress", "decompress", "search_context", "acp_status"
        ]
      },
      "context-builder": {
        "tools": [
          "read", "grep", "find", "ls", "bash", "write", "web_search", "intercom", "compress", "decompress", "search_context", "acp_status"
        ]
      },
      "delegate": {
        "tools": [
          "read", "grep", "find", "ls", "bash", "edit", "write", "contact_supervisor", "compress", "decompress", "search_context", "acp_status"
        ]
      },
      "oracle": {
        "tools": [
          "read", "grep", "find", "ls", "bash", "intercom", "compress", "decompress", "search_context", "acp_status"
        ]
      },
      "planner": {
        "tools": [
          "read", "grep", "find", "ls", "intercom", "compress", "decompress", "search_context", "acp_status"
        ]
      },
      "researcher": {
        "tools": [
          "read", "write", "web_search", "fetch_content", "get_search_content", "intercom", "compress", "decompress", "search_context", "acp_status"
        ]
      },
      "reviewer": {
        "tools": [
          "read", "grep", "find", "ls", "bash", "edit", "write", "intercom", "compress", "decompress", "search_context", "acp_status"
        ]
      },
      "scout": {
        "tools": [
          "read", "grep", "find", "ls", "bash", "write", "intercom", "compress", "decompress", "search_context", "acp_status"
        ]
      },
      "worker": {
        "tools": [
          "read", "grep", "find", "ls", "bash", "edit", "write", "contact_supervisor", "compress", "decompress", "search_context", "acp_status"
        ]
      }
    }
  }
}
```

注意：

- `lastChangelogVersion` 是运行时状态，不需要手工恢复。
- 当前机器使用 `httpProxy`，但其值包含私密认证信息，因此不在模板中。
- 如新机器仍需代理，通过私密配置重新添加 `httpProxy`，或在启动 Pi 前设置 `HTTP_PROXY` 和 `HTTPS_PROXY`。
- 子代理列表中的原生 `edit` 会在 hashline 扩展加载后被禁用，由 `replace` 工作流取代。

## 5. 配置 MCP

创建 `~/.pi/agent/mcp.json`：

```json
{
  "mcpServers": {
    "codegraph": {
      "command": "codegraph",
      "args": ["serve", "--mcp"],
      "directTools": true,
      "toolPrefix": "none"
    },
    "context7": {
      "url": "https://mcp.context7.com/mcp",
      "directTools": true,
      "toolPrefix": "none"
    }
  }
}
```

## 6. 为代码仓库初始化 CodeGraph

CodeGraph 的 CLI 和 MCP 服务是全局的，但索引是每个仓库独立的。进入目标仓库后执行：

```bash
codegraph init .
codegraph status .
```

已有 `.codegraph/` 时可使用：

```bash
codegraph sync .
```

没有索引时，其它工具仍可用，但 `codegraph_explore` 无法提供该仓库的完整符号关系。

## 7. Reload 与验收

启动或返回 Pi 后执行：

```text
/reload
/rtk status
/mcp
/mcp tools
```

终端验收：

```bash
pi --version
pi list
pi --list-models gpt-5.6-sol
rtk --version
rtk gain
ast-grep --version
codegraph --version
jq --version
```

`pi list` 应包含：

```text
npm:pi-mcp-adapter
npm:pi-hashline-edit-pro
npm:@ff-labs/pi-fff
npm:@tintinweb/pi-subagents
npm:pi-web-access
npm:@bacnh85/pi-rtk
```