import { Command } from "commander";
import { scaffoldAction, ScaffoldOptions } from "../scaffoldAction.js";

export const installScaffoldCommands = (program: Command) => {
  const scaffold = program.command("scaffold");
  scaffold
    .description("Create a new LIFF app template using @line/create-liff-app")
    .argument("<name>", "The name of the app to create")
    .option("-l, --liff-id [liffId]", "Optional LIFF ID to use")
    .action((name: string, options: Omit<ScaffoldOptions, "name">) => {
      return scaffoldAction({
        name,
        ...options,
      });
    });
  return scaffold;
};
