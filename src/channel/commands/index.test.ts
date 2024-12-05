import { describe, it, expect, vi } from "vitest";
import { Command } from "commander";

import { installChannelCommands } from "./index.js";
import { makeAddCommand } from "./add.js";

vi.mock("./add.js", () => ({
  makeAddCommand: vi.fn(() => new Command("add")),
}));

describe("installChannelCommands", () => {
  it("should add subcommand to the channel command", () => {
    const program = new Command();
    installChannelCommands(program);

    const channel = program.commands.find((cmd) => cmd.name() === "channel");

    expect(channel).toBeDefined();
    expect(channel?.description()).toBe("Manage LIFF channels");

    const addCommand = channel?.commands.find((cmd) => cmd.name() === "add");

    expect(addCommand).toBeDefined();

    expect(makeAddCommand).toHaveBeenCalled();
  });
});
