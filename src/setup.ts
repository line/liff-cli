import { Command } from "commander";
import { installChannelCommands } from "./channel/commands/index.js";
import { installAppCommands } from "./app/commands/index.js";
import { serveCommands } from "./serve/index.js";

export const setupCLI = (program: Command) => {
  installChannelCommands(program);
  installAppCommands(program);
  serveCommands(program);
  // TODO .version?
  return {
    run: (argv = process.argv) => {
      program.parse(argv);
    },
  };
};
