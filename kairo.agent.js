import { icon } from "./icon.js";

// Declarative Agent module: runs in Magpie's moejs sandbox, without Node APIs.
export const agent = {
  id: "kairo",
  name: "Kairo",
  icon,
  dir: "~/Library/Application Support/Kairo",
  config: "~/Library/Application Support/Kairo/Integrations/magpie.json",
  model: "model",
  notice: "Model changes apply to new Kairo conversations. Existing conversations keep their selected model."
};

function positiveInteger(value) {
  return Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

function modelInfo(model) {
  const info = {};
  if (typeof model?.name === "string" && model.name) info.name = model.name;
  const context = positiveInteger(model?.context);
  const output = positiveInteger(model?.output);
  if (context !== undefined) info.contextWindow = context;
  if (output !== undefined) info.maxTokens = output;
  if (typeof model?.images === "boolean") info.supportsImages = model.images;
  if (Array.isArray(model?.efforts) && model.efforts.length > 0) info.reasoning = true;
  return info;
}

export function connect({ gateway, model, models }) {
  // Magpie writes agent.model itself and restores these keys on Disconnect.
  const result = {
    schemaVersion: 1,
    baseURL: gateway.v1,
    apiKey: gateway.key,
    modelInfo: modelInfo(model)
  };
  if (models !== undefined) {
    if (!Array.isArray(models) || models.length > 1000) throw new Error("Invalid Kairo model catalog");
    const seen = new Set();
    result.models = [];
    for (const item of models) {
      const id = item?.id;
      if (typeof id !== "string" || !id || id.trim() !== id || id.length > 1000 || /[\u0000-\u001f\u007f-\u009f]/.test(id)) {
        throw new Error("Invalid Kairo model ID");
      }
      if (seen.has(id)) continue;
      seen.add(id);
      result.models.push({ modelID: id, ...modelInfo(item) });
    }
  }
  return result;
}
