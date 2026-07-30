import { Command } from "commander";
import { LiffApiClient } from "../../api/liff.js";
import { resolveChannel } from "../../channel/resolveChannel.js";

const listAction = async (options: { channelId?: string }) => {
  const channel = await resolveChannel(options?.channelId);
  if (!channel?.accessToken) {
    throw new Error(`Access token not found.
      Please provide a valid channel ID or set the current channel first.
    `);
  }

  const client = new LiffApiClient({
    token: channel.accessToken,
    baseUrl: channel.apiBaseUrl,
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
