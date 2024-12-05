import { Command } from "commander";

import { makeAddCommand } from "./add.js";
import { makeUseCommand } from "./use.js";

export const installChannelCommands = (program: Command) => {
  const channel = program.command("channel");
  channel.description("Manage LIFF channels");

  channel.addCommand(makeAddCommand());
  channel.addCommand(makeUseCommand());
};
