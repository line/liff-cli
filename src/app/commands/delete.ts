import { Command } from "commander";
import { resolveChannel } from "../../channel/resolveChannel.js";
import { LiffApiClient } from "../../api/liff.js";
import inquirer from "inquirer";
import { getLiffBaseUrl } from "../../channel/baseUrl.js";

const deleteAction = async (options: {
  channelId?: string;
  liffId: string;
}) => {
  const channelInfo = await resolveChannel(options?.channelId);
  if (!channelInfo) {
    throw new Error(`Access token not found.
      Please provide a valid channel ID or set the current channel first.
    `);
  }
  const liffBaseUrl = await getLiffBaseUrl(options?.channelId);

  const { confirmDelete } = await inquirer.prompt<{ confirmDelete: boolean }>([
    {
      type: "confirm",
      name: "confirmDelete",
      message: "Are you sure you want to delete this?",
      default: false,
    },
  ]);
  if (!confirmDelete) return;

  const client = new LiffApiClient({
    token: channelInfo.accessToken,
    baseUrl: liffBaseUrl,
  });

  console.info(`Deleting LIFF app...`);
  await client.deleteApp(options.liffId);

  console.info(`Successfully deleted LIFF app: ${options.liffId}`);
};

export const makeDeleteCommand = () => {
  const deleteCommand = new Command("delete");
  deleteCommand
    .description("Delete a LIFF app")
    .option("-c, --channel-id <channelId>", "Channel ID")
    .requiredOption("-l, --liff-id <liffId>", "LIFF app ID to delete")
    .action(deleteAction);

  return deleteCommand;
};
