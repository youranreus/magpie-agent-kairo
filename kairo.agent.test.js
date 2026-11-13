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
