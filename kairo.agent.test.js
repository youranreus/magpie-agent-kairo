import assert from "node:assert/strict";
import test from "node:test";
import { agent, connect } from "./kairo.agent.js";

test("gateway and reliable model capabilities map to the bridge schema", () => {
  const result = connect({
    gateway: { v1: "http://127.0.0.1:3425/v1", key: "test-agent-key" },
    model: { id: "group/coding", name: "Coding", context: 200000, output: 8192, images: true, efforts: ["low", "high"] }
  });
  assert.equal(agent.model, "model");
  assert.deepEqual(result, {
    schemaVersion: 1, baseURL: "http://127.0.0.1:3425/v1", apiKey: "test-agent-key",
    modelInfo: { name: "Coding", contextWindow: 200000, maxTokens: 8192, supportsImages: true, reasoning: true }
  });
  assert.equal(Object.hasOwn(result, "model"), false); // the host owns model selection
});

test("unknown and invalid capacities stay unknown rather than becoming zero or invented limits", () => {
  const gateway = { v1: "http://localhost:3425/v1", key: "test-key" };
  for (const value of [undefined, null, 0, -1, 1.5, Infinity, "8192"]) {
    const result = connect({ gateway, model: { context: value, output: value, efforts: [] } });
    assert.deepEqual(result.modelInfo, {});
  }
  assert.deepEqual(connect({ gateway, model: { images: false } }).modelInfo, { supportsImages: false });
});


test("all agent-visible models and groups are exported independently of the default", () => {
  const gateway = { v1: "http://localhost:3425/v1", key: "test-key" };
  const models = [
    { id: "codex/sol", name: "Sol", context: 500000, output: 128000, images: true, efforts: ["low"] },
    { id: "tokenlink/hy4", name: "HY4", context: 1048576, output: 65536, images: false, efforts: ["none", "high"] },
    { id: "group/coding", name: "Coding" }
  ];
  const first = connect({ gateway, model: models[0], models });
  const second = connect({ gateway, model: models[1], models });
  assert.deepEqual(first.models, [
    { modelID: "codex/sol", name: "Sol", contextWindow: 500000, maxTokens: 128000, supportsImages: true, reasoning: true },
    { modelID: "tokenlink/hy4", name: "HY4", contextWindow: 1048576, maxTokens: 65536, supportsImages: false, reasoning: true },
    { modelID: "group/coding", name: "Coding" }
  ]);
  assert.deepEqual(first.models, second.models);
  assert.notDeepEqual(first.modelInfo, second.modelInfo);
});

test("duplicate catalog IDs are stable and malformed or oversized catalogs fail without truncation", () => {
  const gateway = { v1: "http://localhost:3425/v1", key: "test-key" };
  const model = { id: "provider/default" };
  assert.deepEqual(connect({ gateway, model, models: [{ id: "provider/m" }, { id: "provider/m" }] }).models, [{ modelID: "provider/m" }]);
  for (const models of [[{ id: "" }], [{ id: " provider/m" }], [null], Array.from({ length: 1001 }, (_, i) => ({ id: "p/" + i }))]) {
    assert.throws(() => connect({ gateway, model, models }));
  }
});
