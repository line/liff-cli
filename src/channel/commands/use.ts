import { createCommand } from "commander";

import { getChannel, setCurrentChannel } from "../stores/channels.js";

const useAction = (channelId?: string): void => {
  if (!channelId) {
    throw new Error("Channel ID is required.");
  }
  if (!getChannel(channelId)) {
    throw new Error(`Channel ${channelId} is not added yet.`);
  }
  setCurrentChannel(channelId);
  console.info(`Channel ${channelId} is now selected.`);
};

export const makeUseCommand = () => {
  const use = createCommand("use");
  use
    .description("Set the default LIFF channel to use")
    .argument("[channelId]", "The channel ID to use")
    .action(useAction);

  return use;
};
