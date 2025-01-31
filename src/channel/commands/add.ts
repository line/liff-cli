import { createCommand } from "commander";
import inquirer from "inquirer";

import { renewAccessToken } from "../renewAccessToken.js";

export const addAction: (channelId?: string) => Promise<void> = async (
  channelId,
) => {
  if (!channelId) {
    throw new Error("Channel ID is required.");
  }

  const { channelSecret } = await inquirer.prompt<{ channelSecret: string }>([
    {
      type: "password",
      name: "channelSecret",
      message: "Channel Secret?:",
      mask: "*",
    },
  ]);

  await renewAccessToken(channelId, channelSecret, Date.now());

  console.info(`Channel ${channelId} is now added.`);
};

export const makeAddCommand = () => {
  const add = createCommand("add");
  add
    .description("Register a LIFF channel that you want to manage")
    .argument("[channelId]", "The channel ID to add")
    .action(addAction);
  return add;
};
