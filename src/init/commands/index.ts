import { Command } from "commander";
import inquirer from "inquirer";
import { initAction } from "../initAction.js";

const DEFAULT_ENDPOINT_URL = "https://localhost:9000";

export type InitOptions = {
  channelId?: string;
  name?: string;
  endpointUrl?: string;
  viewType?: string;
};

export async function makeOptions(
  options: InitOptions,
): Promise<Required<InitOptions>> {
  const promptItems = [];

  if (!options.channelId) {
    promptItems.push({
      type: "input",
      name: "channelId",
      message: "Channel ID?",
    });
  }

  if (!options.name) {
    promptItems.push({
      type: "input",
      name: "name",
      message: "App name?",
    });
  }

  if (!options.viewType) {
    promptItems.push({
      type: "list",
      name: "viewType",
      message: "View type?",
      choices: ["compact", "tall", "full"],
    });
  }

  if (!options.endpointUrl) {
    promptItems.push({
      type: "input",
      name: "endpointUrl",
      message: `Endpoint URL? (leave empty for default '${DEFAULT_ENDPOINT_URL}')`,
    });
  }

  const promptInputs = await inquirer.prompt<{ [key: string]: string }>(
    promptItems,
  );

  return {
    channelId: options.channelId ?? promptInputs.channelId,
    name: options.name ?? promptInputs.name,
    viewType: options.viewType ?? promptInputs.viewType,
    endpointUrl:
      options.endpointUrl ??
      (promptInputs.endpointUrl?.length > 0
        ? promptInputs.endpointUrl
        : DEFAULT_ENDPOINT_URL),
  };
}

export const installInitCommands = (program: Command) => {
  const init = program.command("init");
  init
    .description("Initialize new LIFF app")
    .option(
      "-c, --channel-id [channelId]",
      "The channel ID to use. If it isn't specified, the currentChannelId will be used.",
    )
    .option("-n, --name <name>", "The name of the LIFF app")
    .option(
      "-v, --view-type <viewType>",
      "The view type of the LIFF app. Must be 'compact', 'tall', or 'full'",
    )
    .option(
      "-e, --endpoint-url <endpointUrl>",
      "The endpoint URL of the LIFF app. Must be 'https://'",
    )
    .action(options => initAction(options));
  return init;
};
