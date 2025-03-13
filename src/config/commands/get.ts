import { createCommand } from "commander";
import {
  getCurrentChannelId,
  getApiBaseUrl,
  getLiffBaseUrl,
} from "../../channel/stores/channels.js";
import { BASE_URL_CONFIG, VALID_CONFIG_KEYS } from "../constants.js";

const getAction = (key: string, { channelId }: { channelId?: string }) => {
  const resolvedChannelId = channelId || getCurrentChannelId();
  if (!resolvedChannelId) {
    throw new Error(
      "Channel ID is required. Either specify --channel-id or set the current channel.",
    );
  }

  switch (key) {
    case BASE_URL_CONFIG.api.configKey:
      console.info(getApiBaseUrl(resolvedChannelId));
      break;
    case BASE_URL_CONFIG.liff.configKey:
      console.info(getLiffBaseUrl(resolvedChannelId));
      break;
    default:
      throw new Error(`Unknown config key: ${key}`);
  }
};

export const makeGetCommand = () => {
  const get = createCommand("get");
  get
    .description("Get a configuration value")
    .argument("<key>", `Configuration key (${VALID_CONFIG_KEYS.join(", ")})`)
    .option(
      "-c, --channel-id [channelId]",
      "Channel ID to get config for (defaults to current channel)",
    )
    .action((key, options) => {
      if (!VALID_CONFIG_KEYS.includes(key)) {
        console.error(`Error: Unknown config key: ${key}`);
        console.error(`Valid keys: ${VALID_CONFIG_KEYS.join(", ")}`);
        process.exit(1);
      }
      getAction(key, options);
    });

  return get;
};
