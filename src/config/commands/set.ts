import { createCommand } from "commander";
import {
  getCurrentChannelId,
  setApiBaseUrl,
  setLiffBaseUrl,
} from "../../channel/stores/channels.js";
import { BASE_URL_CONFIG, VALID_CONFIG_KEYS } from "../constants.js";

type ConfigValue = {
  key: string;
  value: string;
  channelId?: string;
};

const setAction = ({ key, value, channelId }: ConfigValue) => {
  const resolvedChannelId = channelId || getCurrentChannelId();
  if (!resolvedChannelId) {
    throw new Error(
      "Channel ID is required. Either specify --channel-id or set the current channel.",
    );
  }

  switch (key) {
    case BASE_URL_CONFIG.api.configKey:
      setApiBaseUrl(resolvedChannelId, value);
      break;
    case BASE_URL_CONFIG.liff.configKey:
      setLiffBaseUrl(resolvedChannelId, value);
      break;
    default:
      throw new Error(`Unknown config key: ${key}`);
  }

  console.info(`Successfully set ${key} to ${value}`);
};

export const makeSetCommand = () => {
  const set = createCommand("set");
  set
    .description("Set a configuration value")
    .argument("<key>", `Configuration key (${VALID_CONFIG_KEYS.join(", ")})`)
    .argument("<value>", "Value to set")
    .option(
      "-c, --channel-id [channelId]",
      "Channel ID to set config for (defaults to current channel)",
    )
    .action((key, value, options) => {
      if (!VALID_CONFIG_KEYS.includes(key)) {
        console.error(`Error: Unknown config key: ${key}`);
        console.error(`Valid keys: ${VALID_CONFIG_KEYS.join(", ")}`);
        process.exit(1);
      }
      setAction({ key, value, channelId: options.channelId });
    });

  return set;
};
