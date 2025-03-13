import { afterEach, describe, expect, it, vi } from "vitest";
import inquire from "inquirer";
import { Command } from "commander";
import { installInitCommands, makeOptions } from "./index.js";
import { initAction } from "../initAction.js";

vi.mock("../initAction.js");
vi.mock("inquirer");

const TEST_OPTIONS = {
  channelId: "123",
  name: "My App",
  viewType: "compact",
  endpointUrl: "https://example.com",
};

describe("makeOptions", () => {
  // 1
  it("should return parameters as is when all parameters are given", async () => {
    // prompt input will be ignored
    vi.mocked(inquire.prompt).mockResolvedValue({
      channelId: "789",
      name: "hoge",
      viewType: "tall",
      endpointUrl: "https://example.com/this-will-be-ignored",
    });

    const result = await makeOptions(TEST_OPTIONS);

    expect(result).toEqual(TEST_OPTIONS);
  });

  // 2
  it("should prompt for all missing parameters", async () => {
    vi.mocked(inquire.prompt).mockResolvedValue(TEST_OPTIONS);

    const result = await makeOptions({});

    expect(result).toEqual(TEST_OPTIONS);
  });

  // 3
  it("should prompt for partly missing parameters", async () => {
    vi.mocked(inquire.prompt).mockResolvedValue({
      viewType: "compact",
      endpointUrl: "https://example.com",
    });

    const result = await makeOptions({
      channelId: "123",
      name: "My App",
    });

    expect(result).toEqual(TEST_OPTIONS);
  });

  // 4
  it("should prompt use default endpointUrl when empty", async () => {
    vi.mocked(inquire.prompt).mockResolvedValue({
      viewType: "compact",
      endpointUrl: "",
    });

    const result = await makeOptions({
      channelId: "123",
      name: "My App",
    });

    expect(result).toEqual({
      channelId: "123",
      name: "My App",
      viewType: "compact",
      endpointUrl: "https://localhost:9000",
    });
  });

  it("should return channelId as undefined when not specified", async () => {
    vi.mocked(inquire.prompt).mockResolvedValue({
      channelId: "",
      name: "My App",
      viewType: "compact",
      endpointUrl: "https://example.com",
    });

    const result = await makeOptions({});

    expect(result).toEqual({
      ...TEST_OPTIONS,
      channelId: undefined,
    });
  });
});

describe("installInitCommands", async () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call init with correct options", () => {
    const program = new Command();

    const command = installInitCommands(program);
    command.parseAsync([
      "_",
      "init",
      "--channel-id",
      TEST_OPTIONS.channelId,
      "--name",
      TEST_OPTIONS.name,
      "--view-type",
      TEST_OPTIONS.viewType,
      "--endpoint-url",
      TEST_OPTIONS.endpointUrl,
    ]);

    expect(initAction).toHaveBeenCalledWith(TEST_OPTIONS);
  });
});
