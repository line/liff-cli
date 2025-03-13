import { Command } from "commander";
import { LiffApiClient } from "../../api/liff.js";
import { resolveChannel } from "../../channel/resolveChannel.js";
import {
  getCurrentChannelId,
  getLiffBaseUrl,
} from "../../channel/stores/channels.js";

const listAction = async (options: { channelId?: string }) => {
  const channelInfo = await resolveChannel(options?.channelId);
  if (!channelInfo) {
    throw new Error(`Access token not found.
      Please provide a valid channel ID or set the current channel first.
    `);
  }

  const channelId = options?.channelId || getCurrentChannelId();
  if (!channelId) {
    throw new Error("Channel ID is required.");
  }

  const liffBaseUrl = getLiffBaseUrl(channelId);

  const client = new LiffApiClient({
    token: channelInfo.accessToken,
    baseUrl: liffBaseUrl,
  });

  const { apps } = await client.fetchApps();

  console.info("LIFF apps:");
  apps.forEach((app) => {
    console.info(`${app.liffId}: ${app.description}`);
  });
};

export const makeListCommand = () => {
  const list = new Command("list");
  list
    .description("List all LIFF apps")
    .option("-c, --channel-id [channelId]", "The channel ID to use")
    .action(listAction);

  return list;
};
