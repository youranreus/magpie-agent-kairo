# Kairo · Magpie Agent 插件

在 Magpie 中为 **新建 Kairo 会话**选择模型或路由组。已有会话保留原来的网关模型 ID；Magpie 内部修改同一路由组的成员或规则仍会影响该组的请求。

## 安装

需要包含此接入能力的 Kairo 构建，以及支持声明型 Agent 插件的 Magpie。本机核查版本为 0.1.4009；尚未确定更早版本的兼容下限。

1. 先运行一次 Kairo，建立应用数据目录。
2. 安装公开插件：

   ```sh
   magpie plugin add github:youranreus/magpie-agent-kairo
   ```

   Magpie CLI 也可使用 `/Applications/magpie.app/Contents/MacOS/magpie`。
3. 在 Magpie 的 Agent 页找到 Kairo，选择具体模型或路由组。
4. 在 Kairo 新建会话。接入使用 OpenAI Responses 协议，模型、工具和流式响应通过本机 Magpie 网关发送。

Magpie 的连接状态表示配置文件已连接；Kairo 读取并校验配置后才应用。网关需要保持运行。不支持远程网关或从 Magpie 调整 Kairo 推理强度。插件自动传递 Magpie 为 Kairo 开放的全部模型和路由组，Kairo 自动入列，无需手动同步或勾选。需要支持全量目录的 Kairo 构建。

## 配置契约

宿主写入 `~/Library/Application Support/Kairo/Integrations/magpie.json`。协议版本为 1：

```json
{
  "schemaVersion": 1,
  "model": "group/coding",
  "baseURL": "http://127.0.0.1:3425/v1",
  "apiKey": "<Magpie 提供的 Kairo 网关凭据>",
  "modelInfo": {
    "name": "Coding",
    "contextWindow": 200000,
    "maxTokens": 8192,
    "supportsImages": true,
    "reasoning": true
  }
}
```

`model` 由宿主按 `agent.model` 写入，其余字段由纯 `connect` 映射返回。`modelInfo` 仅携带 Magpie 提供的能力，未知字段省略。模型 ID 原样传递，包括 `provider/model`、`group/id` 和 `auto/id`，无需额外的 `magpie/` 前缀。

该文件包含网关凭据，应限制为本用户可读，不要提交到版本控制或粘贴到诊断日志。Kairo 在原生配置层管理导入后的凭据；插件不访问 Kairo Keychain 或上游订阅登录信息。

## 断开

在 Magpie 中对 Kairo 选择 Disconnect（或运行 `magpie kairo default`），由宿主恢复原先配置键。Kairo 随后在新建会话时撤销托管默认；只有当前默认仍属于该集成时，才恢复接入前的默认。已有会话保留选择，断开后可能显示不可用，不自动改投其它模型。

建议先断开再移除插件：`magpie plugin rm magpie-agent-kairo`。不需要删除 Kairo 的其它模型配置或 Pi 全局文件。

## 验证

```sh
npm test
```

自动测试只使用测试网关凭据，不连接真实供应商。真实宿主安装、配置写入恢复与网关连通性仍需实机验证；参数映射测试不代表端到端验收通过。

协议依据：[Magpie Agent plugins](https://github.com/yetone/magpie/blob/main/docs/reference.md#agent-plugins)。

## 本地开发

```sh
git clone https://github.com/youranreus/magpie-agent-kairo.git
cd magpie-agent-kairo
npm test
magpie plugin add .
```

此仓库独立分发插件；使用前需要已包含 Magpie 配置桥的 Kairo 构建。插件公开不代表该功能已经随 Kairo 正式版发布。

## 全量模型目录（0.2.0）

配置新增可选 `models` 数组，每项包含 `modelID` 和已知的 `name/contextWindow/maxTokens/supportsImages/reasoning`。顶层 `model` 仍只指定新建会话的默认模型。目录最多1000项，重复ID按首次出现去重，非法或超限目录报错，不静默截断。Magpie更新开放目录时会重新调用connect；Kairo在新建会话或打开模型列表/供应商管理时自动导入。旧bridge缺少数组时兼容单模型；已有模型身份和历史会话保留，目录缩减不自动删除历史模型。

插件卡片和 Kairo Agent 行使用 Kairo 原应用图标，内嵌 SVG 可离线显示，以连续曲率圆角裁切原图，四角透明；原图保存在 `assets/kairo.png`，裁切资产为 `assets/kairo-rounded.svg`。
