import { createCommand } from "commander";
import { LiffApiClient } from "../../api/liff.js";
import { resolveChannel } from "../../channel/resolveChannel.js";
import { getLiffBaseUrl } from "../../channel/baseUrl.js";

const createAction = async (options: {
  channelId?: string;
  name: string;
  endpointUrl: string;
  viewType: string;
}) => {
  const channelInfo = await resolveChannel(options?.channelId);
  if (!channelInfo) {
    throw new Error(`Access token not found.
      Please provide a valid channel ID or set the current channel first.
    `);
  }
  const liffBaseUrl = await getLiffBaseUrl(options?.channelId);
  const client = new LiffApiClient({
    token: channelInfo.accessToken,
    baseUrl: liffBaseUrl,
  });
  const { liffId } = await client.addApp({
    view: {
      type: options.viewType,
      url: options.endpointUrl,
    },
    description: options.name,
  });

  console.info(`Successfully created LIFF app: ${liffId}`);
};

export const makeCreateCommand = () => {
  const create = createCommand("create");
  create
    .description("Create a new LIFF app")
    .option(
      "-c, --channel-id [channelId]",
      "The channel ID to use. If it isn't specified, the currentChannelId's will be used.",
    )
    .requiredOption("-n, --name <name>", "The name of the LIFF app")
    .requiredOption(
      "-e, --endpoint-url <endpointUrl>",
      "The endpoint URL of the LIFF app",
    )
    .requiredOption(
      "-v, --view-type <viewType>",
      "The view type of the LIFF app",
    )
    .action(createAction);

  return create;
};
