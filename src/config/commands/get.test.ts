import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { makeGetCommand } from "./get.js";
import {
  getCurrentChannelId
} from "../../channel/stores/channels.js";
import { getApiBaseUrl, getLiffBaseUrl } from "../../channel/baseUrl.js";

vi.mock("../../channel/stores/channels.js");
vi.mock("../../channel/baseUrl.js");

describe("makeGetCommand", () => {
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

  it.only("should get API base URL for the current channel", async () => {
    const apiBaseUrl = "https://custom-api.example.com";

    vi.mocked(getApiBaseUrl).mockResolvedValueOnce(apiBaseUrl);

    const command = makeGetCommand();
    await command.parseAsync(["_", "get", "api-base-url"]);

    expect(getApiBaseUrl).toHaveBeenCalledWith(undefined);
    expect(console.info).toHaveBeenCalledWith(apiBaseUrl);
  });

  it("should get LIFF base URL for a specific channel", async () => {
    const channelId = "456";
    const liffBaseUrl = "https://custom-liff.example.com";

    vi.mocked(getLiffBaseUrl).mockResolvedValueOnce(liffBaseUrl);

    const command = makeGetCommand();
    await command.parseAsync([
      "_",
      "get",
      "liff-base-url",
      "--channel-id",
      channelId,
    ]);

    expect(getCurrentChannelId).not.toHaveBeenCalled();
    expect(getLiffBaseUrl).toHaveBeenCalledWith(channelId);
    expect(console.info).toHaveBeenCalledWith(liffBaseUrl);
  });

  it("should error when no current channel is set and no channel ID provided", async () => {
    vi.mocked(getCurrentChannelId).mockReturnValueOnce(undefined);

    const command = makeGetCommand();

    await expect(
      command.parseAsync(["_", "get", "api-base-url"]),
    ).rejects.toThrow(
      "Channel ID is required. Either specify --channel-id or set the current channel.",
    );

    expect(getApiBaseUrl).not.toHaveBeenCalled();
    expect(getLiffBaseUrl).not.toHaveBeenCalled();
  });

  it("should error with invalid config key", async () => {
    const command = makeGetCommand();

    await expect(
      command.parseAsync(["_", "get", "invalid-key"]),
    ).rejects.toThrow("process.exit called with code 1");

    expect(console.error).toHaveBeenCalledWith(
      "Error: Unknown config key: invalid-key",
    );
    expect(console.error).toHaveBeenCalledWith(
      "Valid keys: api-base-url, liff-base-url",
    );
    expect(getApiBaseUrl).not.toHaveBeenCalled();
    expect(getLiffBaseUrl).not.toHaveBeenCalled();
  });

  it("should propagate errors from base URL getter functions", async () => {
    const channelId = "123";
    const errorMessage = "Failed to get API base URL";

    vi.mocked(getCurrentChannelId).mockReturnValueOnce(channelId);
    vi.mocked(getApiBaseUrl).mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    const command = makeGetCommand();

    await expect(
      command.parseAsync(["_", "get", "api-base-url"]),
    ).rejects.toThrow(errorMessage);

    expect(getApiBaseUrl).toHaveBeenCalledWith(channelId);
  });
});
