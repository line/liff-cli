import { Command } from "commander";
import { installChannelCommands } from "./channel/commands/index.js";
import { installAppCommands } from "./app/commands/index.js";
import { installInitCommands } from "./init/index.js";
import { installServeCommands } from "./serve/commands/index.js";

export const setupCLI = (program: Command) => {
  installChannelCommands(program);
  installAppCommands(program);
  installInitCommands(program);
  installServeCommands(program);
  // TODO .version?
  return {
    run: (argv = process.argv) => {
      program.parse(argv);
    },
  };
};
