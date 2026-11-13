// Declarative Agent module: runs in Magpie's moejs sandbox, without Node APIs.
export const agent = {
  id: "kairo",
  name: "Kairo",
  dir: "~/Library/Application Support/Kairo",
  config: "~/Library/Application Support/Kairo/Integrations/magpie.json",
  model: "model",
  notice: "Model changes apply to new Kairo conversations. Existing conversations keep their selected model."
};

function positiveInteger(value) {
  return Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

export function connect({ gateway, model }) {
  // Magpie writes agent.model itself and restores these keys on Disconnect.
  const info = {};
  if (typeof model?.name === "string" && model.name) info.name = model.name;
  const context = positiveInteger(model?.context);
  const output = positiveInteger(model?.output);
  if (context !== undefined) info.contextWindow = context;
  if (output !== undefined) info.maxTokens = output;
  if (typeof model?.images === "boolean") info.supportsImages = model.images;
  if (Array.isArray(model?.efforts) && model.efforts.length > 0) info.reasoning = true;
  return {
    schemaVersion: 1,
    baseURL: gateway.v1,
    apiKey: gateway.key,
    modelInfo: info
  };
}
