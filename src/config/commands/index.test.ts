import { describe, it, expect, vi } from "vitest";
import { Command } from "commander";

import { installConfigCommands } from "./index.js";
import { makeGetCommand } from "./get.js";
import { makeListCommand } from "./list.js";
import { makeSetCommand } from "./set.js";

vi.mock("./get.js");
vi.mock("./list.js");
vi.mock("./set.js");

describe("installConfigCommands", () => {
  it("should add subcommand to the config command", () => {
    vi.mocked(makeGetCommand).mockReturnValueOnce(new Command("get"));
    vi.mocked(makeListCommand).mockReturnValueOnce(new Command("list"));
    vi.mocked(makeSetCommand).mockReturnValueOnce(new Command("set"));

    const program = new Command();
    installConfigCommands(program);

    const config = program.commands.find((cmd) => cmd.name() === "config");
    expect(config).toBeDefined();
    expect(config?.description()).toBe("Manage LIFF CLI configuration");

    const getCommand = config?.commands.find((cmd) => cmd.name() === "get");
    expect(getCommand).toBeDefined();
    expect(makeGetCommand).toHaveBeenCalled();

    const listCommand = config?.commands.find((cmd) => cmd.name() === "list");
    expect(listCommand).toBeDefined();
    expect(makeListCommand).toHaveBeenCalled();

    const setCommand = config?.commands.find((cmd) => cmd.name() === "set");
    expect(setCommand).toBeDefined();
    expect(makeSetCommand).toHaveBeenCalled();
  });
});
