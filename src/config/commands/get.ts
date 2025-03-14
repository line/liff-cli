import { createCommand } from "commander";
import { BASE_URL_CONFIG, VALID_CONFIG_KEYS } from "../constants.js";
import { getApiBaseUrl, getLiffBaseUrl } from "../../channel/baseUrl.js";

const getAction = async (key: string, { channelId }: { channelId?: string }) => {
  switch (key) {
    case BASE_URL_CONFIG.api.configKey:
      console.info(await getApiBaseUrl(channelId));
      break;
    case BASE_URL_CONFIG.liff.configKey:
      console.info(await getLiffBaseUrl(channelId));
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
    .action(async (key, options) => {
      if (!VALID_CONFIG_KEYS.includes(key)) {
        console.error(`Error: Unknown config key: ${key}`);
        console.error(`Valid keys: ${VALID_CONFIG_KEYS.join(", ")}`);
        process.exit(1);
      }
      await getAction(key, options);
    });

  return get;
};
