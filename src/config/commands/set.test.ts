import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { makeSetCommand } from "./set.js";
import {
  getCurrentChannelId,
} from "../../channel/stores/channels.js";
import { setApiBaseUrl, setLiffBaseUrl } from "../../channel/baseUrl.js";


vi.mock("../../channel/stores/channels.js");
vi.mock("../../channel/baseUrl.js");

describe("makeSetCommand", () => {
  beforeEach(() => {
    vi.stubGlobal("console", {
      ...console,
      info: vi.fn(),
      error: vi.fn(),
    });
    vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit called with code ${code}`);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should set API base URL for the current channel", async () => {
    const channelId = "123";
    const apiBaseUrl = "https://custom-api.example.com";

    vi.mocked(getCurrentChannelId).mockReturnValueOnce(channelId);
    vi.mocked(setApiBaseUrl).mockImplementationOnce(() => {});

    const command = makeSetCommand();
    await command.parseAsync(["_", "set", "api-base-url", apiBaseUrl]);

    expect(getCurrentChannelId).toHaveBeenCalled();
    expect(setApiBaseUrl).toHaveBeenCalledWith(channelId, apiBaseUrl);
    expect(console.info).toHaveBeenCalledWith(
      `Successfully set api-base-url to ${apiBaseUrl}`,
    );
  });

  it("should set LIFF base URL for a specific channel", async () => {
    const channelId = "456";
    const liffBaseUrl = "https://custom-liff.example.com";

    vi.mocked(getCurrentChannelId).mockImplementationOnce(() => undefined);
    vi.mocked(setLiffBaseUrl).mockImplementationOnce(() => {});

    const command = makeSetCommand();
    await command.parseAsync([
      "_",
      "set",
      "liff-base-url",
      liffBaseUrl,
      "--channel-id",
      channelId,
    ]);

    expect(setLiffBaseUrl).toHaveBeenCalledWith(channelId, liffBaseUrl);
    expect(console.info).toHaveBeenCalledWith(
      `Successfully set liff-base-url to ${liffBaseUrl}`,
    );
  });

  it("should error when no current channel is set and no channel ID provided", async () => {
    vi.mocked(getCurrentChannelId).mockReturnValueOnce(undefined);

    const command = makeSetCommand();

    await expect(
      command.parseAsync(["_", "set", "api-base-url", "https://example.com"]),
    ).rejects.toThrow(
      "Channel ID is required. Either specify --channel-id or set the current channel.",
    );

    expect(setApiBaseUrl).not.toHaveBeenCalled();
    expect(setLiffBaseUrl).not.toHaveBeenCalled();
  });

  it("should error with invalid config key", async () => {
    const command = makeSetCommand();

    await expect(
      command.parseAsync(["_", "set", "invalid-key", "value"]),
    ).rejects.toThrow("process.exit called with code 1");

    expect(console.error).toHaveBeenCalledWith(
      "Error: Unknown config key: invalid-key",
    );
    expect(console.error).toHaveBeenCalledWith(
      "Valid keys: api-base-url, liff-base-url",
    );
    expect(setApiBaseUrl).not.toHaveBeenCalled();
    expect(setLiffBaseUrl).not.toHaveBeenCalled();
  });
});
