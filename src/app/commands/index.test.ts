import { describe, it, expect, vi } from "vitest";
import { Command } from "commander";

import { installAppCommands } from "./index.js";
import { makeCreateCommand } from "./create.js";
import { makeListCommand } from "./list.js";
import { makeUpdateCommand } from "./update.js";
import { makeDeleteCommand } from "./delete.js";

vi.mock("./create.js");
vi.mock("./list.js");
vi.mock("./update.js");
vi.mock("./delete.js");

describe("installAppCommands", () => {
  it("should add subcommand to the app command", () => {
    vi.mocked(makeCreateCommand).mockReturnValueOnce(new Command("create"));
    vi.mocked(makeListCommand).mockReturnValueOnce(new Command("list"));
    vi.mocked(makeUpdateCommand).mockReturnValueOnce(new Command("update"));
    vi.mocked(makeDeleteCommand).mockReturnValueOnce(new Command("delete"));

    const program = new Command();
    installAppCommands(program);

    const app = program.commands.find((cmd) => cmd.name() === "app");
    expect(app).toBeDefined();
    expect(app?.description()).toBe("Manage LIFF apps");

    const createCommand = app?.commands.find((cmd) => cmd.name() === "create");
    expect(createCommand).toBeDefined();
    expect(makeCreateCommand).toHaveBeenCalled();

    const listCommand = app?.commands.find((cmd) => cmd.name() === "list");
    expect(listCommand).toBeDefined();
    expect(makeListCommand).toHaveBeenCalled();

    const updateCommand = app?.commands.find((cmd) => cmd.name() === "update");
    expect(updateCommand).toBeDefined();
    expect(makeUpdateCommand).toHaveBeenCalled();

    const deleteCommand = app?.commands.find((cmd) => cmd.name() === "delete");
    expect(deleteCommand).toBeDefined();
    expect(makeDeleteCommand).toHaveBeenCalled();
  });
});
