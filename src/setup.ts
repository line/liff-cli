import { Command } from "commander";
import { installChannelCommands } from "./channel/commands/index.js";
import { installAppCommands } from "./app/commands/index.js";
import { installServeCommands } from "./serve/commands/index.js";
import { installConfigCommands } from "./config/commands/index.js";

export const setupCLI = (program: Command) => {
  installChannelCommands(program);
  installAppCommands(program);
  installServeCommands(program);
  installConfigCommands(program);
  // TODO .version?
  return {
    run: (argv = process.argv) => {
      program.parse(argv);
    },
  };
};
