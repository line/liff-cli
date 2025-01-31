import { Command } from "commander";
import { addAction as addChannelAction } from "../channel/commands/add.js";
import { execSync } from "child_process";
import { CreateAppOptions, createLiffApp } from "../app/commands/create.js";
import inquirer from "inquirer";

const DEFAULT_ENDPOINT_URL = 'https://localhost:9000'

const addAction: (options: CreateAppOptions) => Promise<void> = async (
  options,
) => {
  // collect required information via prompt if not specified via parameter
  const promptItems = []

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

  const promptInputs = await inquirer.prompt<{ [key: string]: string }>(promptItems);

  options.channelId = promptInputs.channelId ?? options.channelId;
  options.name = promptInputs.name ?? options.name;
  options.viewType = promptInputs.viewType ?? options.viewType;
  options.endpointUrl = promptInputs.endpointUrl?.length > 0 ? promptInputs.endpointUrl : DEFAULT_ENDPOINT_URL;

  // 1. add channel
  await addChannelAction(options.channelId);

  // 2. create liff app (@ server)
  const liffId = await createLiffApp(options);

  // 3. create liff app (@ client)
  execSync(`npx @line/create-liff-app ${options.name} -l ${liffId}`, {
    stdio: "inherit",
  });

  // 4. print instructions on how to run locally
  console.info(`App ${liffId} successfully created.

Now do the following:
  1. go to app directory: \`cd ${options.name}\`
  2. create certificate key files (e.g. \`mkcert localhost\`, see: https://developers.line.biz/en/docs/liff/liff-cli/#serve-operating-conditions )
  3. run LIFF app template using command above (e.g. \`npm run dev\` or \`yarn dev\`)
  4. open new terminal window, navigate to \`${options.name}\` directory
  5. run \`liff-cli serve -l ${liffId} -u http://localhost:\${PORT FROM STEP 3.}/\`
  6. open browser and navigate to http://localhost:\${PORT FROM STEP 3.}/
`);
};

export const installInitCommands = (program: Command) => {
  const app = program.command("init");
  app
    .description("Initialize new LIFF app")
    .option(
      "-c, --channel-id [channelId]",
      "The channel ID to use. If it isn't specified, the currentChannelId's will be used.",
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
    .action(addAction);
};
