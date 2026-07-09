import { createCommand } from "commander";
import inquirer from "inquirer";

import { renewAccessToken } from "../renewAccessToken.js";
import { DEFAULT_API_BASE_URL, getChannel } from "../stores/channels.js";

export const addAction: (
  channelId: string | undefined,
  options?: { apiBaseUrl?: string },
) => Promise<void> = async (channelId, options = {}) => {
  if (!channelId) {
    throw new Error("Channel ID is required.");
  }

  // When --api-base-url is omitted, keep the URL already registered for the
  // channel so that re-running `channel add` doesn't silently reset it.
  const apiBaseUrl =
    options.apiBaseUrl ??
    getChannel(channelId)?.apiBaseUrl ??
    DEFAULT_API_BASE_URL;

  try {
    new URL(apiBaseUrl);
  } catch {
    throw new Error(`Invalid API base URL: ${apiBaseUrl}`);
  }

  const { channelSecret } = await inquirer.prompt<{ channelSecret: string }>([
    {
      type: "password",
      name: "channelSecret",
      message: "Channel Secret?:",
      mask: "*",
    },
  ]);

  await renewAccessToken(channelId, channelSecret, Date.now(), apiBaseUrl);

  console.info(`Channel ${channelId} is now added.`);
};

export const makeAddCommand = () => {
  const add = createCommand("add");
  add
    .description("Register a LIFF channel that you want to manage")
    .argument("[channelId]", "The channel ID to add")
    .option(
      "--api-base-url <url>",
      "The base URL of the LIFF and auth API. This option is intended for LINE internal use only.",
    )
    .action(addAction);
  return add;
};
