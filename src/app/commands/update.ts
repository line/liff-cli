import { createCommand } from "commander";
import { LiffApiClient } from "../../api/liff.js";
import { resolveChannel } from "../../channel/resolveChannel.js";
import { getLineBaseUrl } from "../../config/stores/common.js";

const updateAction = async (options: {
  liffId: string;
  channelId?: string;
  name?: string;
  endpointUrl?: string;
  viewType?: string;
}) => {
  const accessToken = (await resolveChannel(options?.channelId))?.accessToken;
  if (!accessToken) {
    throw new Error(`Access token not found.
      Please provide a valid channel ID or set the current channel first.
    `);
  }

  const lineBaseUrl = getLineBaseUrl();
  const client = new LiffApiClient({
    token: accessToken,
    baseUrl: lineBaseUrl,
  });
  await client.updateApp(options.liffId, {
    view: {
      type: options.viewType,
      url: options.endpointUrl,
    },
    description: options.name,
  });

  console.info(`Successfully updated LIFF app: ${options.liffId}`);
};

export const makeUpdateCommand = () => {
  const update = createCommand("update");
  update
    .description("Update the configuration of the existing LIFF app")
    .requiredOption("-l, --liff-id <liffId>", "The LIFF ID to update")
    .option(
      "-c, --channel-id [channelId]",
      "The channel ID to use. If it isn't specified, the currentChannelId's will be used.",
    )
    .option("-n, --name [name]", "The name of the LIFF app")
    .option(
      "-e, --endpoint-url [endpointUrl]",
      "The endpoint URL of the LIFF app",
    )
    .option("-v, --view-type [viewType]", "The view type of the LIFF app")
    .action(updateAction);

  return update;
};
