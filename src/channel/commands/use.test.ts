import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { makeUseCommand } from "./use.js";
import { getChannel, setCurrentChannel } from "../stores/channels.js";

vi.mock("../stores/channels.js");

describe("makeUseCommand", () => {
  beforeEach(() => {
    vi.stubGlobal("console", {
      ...console,
      info: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should require channelId", async () => {
    const command = makeUseCommand();

    await expect(command.parseAsync(["_", "use"])).rejects.toThrowError(
      "Channel ID is required.",
    );
  });

  it("should error if channel does not exist", async () => {
    const channelId = 123;

    vi.mocked(getChannel).mockReturnValueOnce(undefined);

    const command = makeUseCommand();

    await expect(
      command.parseAsync(["_", "use", channelId.toString()]),
    ).rejects.toThrowError(`Channel ${channelId} is not added yet.`);
    expect(getChannel).toHaveBeenCalledWith(channelId.toString());
  });

  it("should set the current channel if it exists", async () => {
    const channelId = 123;

    vi.mocked(getChannel).mockReturnValueOnce({
      accessToken: "token",
      expiresIn: 3600,
      secret: "secret",
      issuedAt: 1000,
    });

    const command = makeUseCommand();
    await command.parseAsync(["_", "use", channelId.toString()]);

    expect(getChannel).toHaveBeenCalledWith(channelId.toString());
    expect(setCurrentChannel).toHaveBeenCalledWith("123");
    expect(console.info).toHaveBeenCalledWith(
      `Channel ${channelId} is now selected.`,
    );
  });
});
