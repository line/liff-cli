import { Command } from "commander";
import { makeCreateCommand } from "./create.js";
import { makeListCommand } from "./list.js";
import { makeUpdateCommand } from "./update.js";
import { makeDeleteCommand } from "./delete.js";

export const installAppCommands = (program: Command) => {
  const app = program.command("app");
  app.description("Manage LIFF apps");

  app.addCommand(makeCreateCommand());
  app.addCommand(makeListCommand());
  app.addCommand(makeUpdateCommand());
  app.addCommand(makeDeleteCommand());
};
