import { afterEach, describe, expect, it, vi } from "vitest";
import { Command } from "commander";
import { installScaffoldCommands } from "./index.js";
import { scaffoldAction } from "../scaffoldAction.js";

vi.mock("../scaffoldAction.js");

describe("installScaffoldCommands", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call scaffoldAction with correct options", async () => {
    const program = new Command();
    const command = installScaffoldCommands(program);

    const testAppName = "my-liff-app";
    await command.parseAsync(["_", "scaffold", testAppName]);

    expect(scaffoldAction).toHaveBeenCalledWith({
      name: testAppName,
    });
  });

  it("should pass liffId when provided", async () => {
    const program = new Command();
    const command = installScaffoldCommands(program);

    const testAppName = "my-liff-app";
    const testLiffId = "1234-abcd";
    await command.parseAsync([
      "_",
      "scaffold",
      testAppName,
      "--liff-id",
      testLiffId,
    ]);

    expect(scaffoldAction).toHaveBeenCalledWith({
      name: testAppName,
      liffId: testLiffId,
    });
  });
});
