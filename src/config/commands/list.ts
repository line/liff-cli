import { createCommand } from "commander";
import {
  getChannel,
  getCurrentChannelId,
} from "../../channel/stores/channels.js";
import { BASE_URL_CONFIG } from "../constants.js";
import { getApiBaseUrl, getLiffBaseUrl } from "../../channel/baseUrl.js";

const listAction = async ({ channelId }: { channelId?: string }) => {
  const resolvedChannelId = channelId || getCurrentChannelId();
  if (!resolvedChannelId) {
    throw new Error(
      "Channel ID is required. Either specify --channel-id or set the current channel.",
    );
  }

  const channel = getChannel(resolvedChannelId);
  if (!channel) {
    throw new Error(`Channel ${resolvedChannelId} is not found.`);
  }

  console.info(`Configuration for channel ${resolvedChannelId}:`);

  const apiBaseUrl = await getApiBaseUrl(resolvedChannelId);
  const liffBaseUrl = await getLiffBaseUrl(resolvedChannelId);

  // api-base-url = https://api.line.me (default)
  console.info(
    `${BASE_URL_CONFIG.api.configKey} = ${apiBaseUrl} ${apiBaseUrl === BASE_URL_CONFIG.api.defaultBaseUrl ? "(default)" : ""}`,
  );
  // liff-base-url = https://liff.line.me (default)
  console.info(
    `${BASE_URL_CONFIG.liff.configKey} = ${liffBaseUrl} ${liffBaseUrl === BASE_URL_CONFIG.liff.defaultBaseUrl ? "(default)" : ""}`,
  );
};

export const makeListCommand = () => {
  const list = createCommand("list");
  list
    .description("List all configuration values")
    .option(
      "-c, --channel-id [channelId]",
      "Channel ID to list config for (defaults to current channel)",
    )
    .action(listAction);

  return list;
};
