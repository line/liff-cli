import { Command } from "commander";

import { makeGetCommand } from "./get.js";
import { makeListCommand } from "./list.js";
import { makeSetCommand } from "./set.js";

export const installConfigCommands = (program: Command) => {
  const config = program.command("config");
  config.description("Manage LIFF CLI configuration");

  config.addCommand(makeGetCommand());
  config.addCommand(makeListCommand());
  config.addCommand(makeSetCommand());
};
