import { createCommand } from "commander";
import { LiffApiClient } from "../../api/liff.js";
import { resolveChannel } from "../../channel/resolveChannel.js";

export type CreateAppOptions = {
  channelId?: string;
  name: string;
  endpointUrl: string;
  viewType: string;
};

export const createLiffApp = async (options: CreateAppOptions) => {
  const accessToken = (await resolveChannel(options?.channelId))?.accessToken;
  if (!accessToken) {
    throw new Error(`Access token not found.
      Please provide a valid channel ID or set the current channel first.
    `);
  }

  const client = new LiffApiClient({
    token: accessToken,
    baseUrl: "https://api.line.me",
  });
  const { liffId } = await client.addApp({
    view: {
      type: options.viewType,
      url: options.endpointUrl,
    },
    description: options.name,
  });

  return liffId;
};

const createAction = async (options: CreateAppOptions) => {
  const liffId = await createLiffApp(options);

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
      "The endpoint URL of the LIFF app. Must be 'https://'",
    )
    .requiredOption(
      "-v, --view-type <viewType>",
      "The view type of the LIFF app. Must be 'compact', 'tall', or 'full'",
    )
    .action(createAction);

  return create;
};
