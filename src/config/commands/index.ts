import { Command } from "commander";
import { makeSetCommand } from "./set.js";

export const installConfigCommands = (program: Command) => {
  const config = program.command("config");
  config.description("Configure common settings");

  config.addCommand(makeSetCommand());
};
