import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { makeListCommand } from "./list.js";
import {
  getChannel,
  getCurrentChannelId,
} from "../../channel/stores/channels.js";
import { getApiBaseUrl, getLiffBaseUrl } from "../../channel/baseUrl.js";

vi.mock("../../channel/stores/channels.js");
vi.mock("../../channel/baseUrl.js");

describe("makeListCommand", () => {
  beforeEach(() => {
    vi.stubGlobal("console", {
      ...console,
      info: vi.fn(),
      error: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list all configuration values for the current channel", async () => {
    const channelId = "123";
    const apiBaseUrl = "https://custom-api.example.com";
    const liffBaseUrl = "https://api.line.me";

    vi.mocked(getCurrentChannelId).mockReturnValueOnce(channelId);
    vi.mocked(getChannel).mockReturnValueOnce({
      accessToken: "token",
      expiresIn: 3600,
      secret: "secret",
      issuedAt: 1000,
      baseUrl: {
        api: apiBaseUrl,
      },
    });
    vi.mocked(getApiBaseUrl).mockResolvedValueOnce(apiBaseUrl);
    vi.mocked(getLiffBaseUrl).mockResolvedValueOnce(liffBaseUrl);

    const command = makeListCommand();
    await command.parseAsync(["_", "list"]);

    expect(getCurrentChannelId).toHaveBeenCalled();
    expect(getChannel).toHaveBeenCalledWith(channelId);
    expect(getApiBaseUrl).toHaveBeenCalledWith(channelId);
    expect(getLiffBaseUrl).toHaveBeenCalledWith(channelId);

    expect(console.info).toHaveBeenCalledTimes(3);
    expect(console.info).toHaveBeenNthCalledWith(
      1,
      `Configuration for channel ${channelId}:`,
    );
    expect(console.info).toHaveBeenNthCalledWith(
      2,
      `api-base-url = ${apiBaseUrl} `,
    );
    expect(console.info).toHaveBeenNthCalledWith(
      3,
      `liff-base-url = ${liffBaseUrl} `,
    );
  });

  it("should list all configuration values for a specific channel", async () => {
    const channelId = "456";
    const apiBaseUrl = "https://api.line.me";
    const liffBaseUrl = "https://custom-liff.example.com";

    vi.mocked(getChannel).mockReturnValueOnce({
      accessToken: "token",
      expiresIn: 3600,
      secret: "secret",
      issuedAt: 1000,
      baseUrl: {
        liff: liffBaseUrl,
      },
    });
    vi.mocked(getApiBaseUrl).mockResolvedValueOnce(apiBaseUrl);
    vi.mocked(getLiffBaseUrl).mockResolvedValueOnce(liffBaseUrl);

    const command = makeListCommand();
    await command.parseAsync(["_", "list", "--channel-id", channelId]);

    expect(getCurrentChannelId).not.toHaveBeenCalled();
    expect(getChannel).toHaveBeenCalledWith(channelId);
    expect(getApiBaseUrl).toHaveBeenCalledWith(channelId);
    expect(getLiffBaseUrl).toHaveBeenCalledWith(channelId);

    expect(console.info).toHaveBeenCalledTimes(3);
    expect(console.info).toHaveBeenNthCalledWith(
      1,
      `Configuration for channel ${channelId}:`,
    );
    expect(console.info).toHaveBeenNthCalledWith(
      2,
      `api-base-url = ${apiBaseUrl} (default)`,
    );
    expect(console.info).toHaveBeenNthCalledWith(
      3,
      `liff-base-url = ${liffBaseUrl} `,
    );
  });

  it("should error when no current channel is set and no channel ID provided", async () => {
    vi.mocked(getCurrentChannelId).mockReturnValueOnce(undefined);

    const command = makeListCommand();

    await expect(command.parseAsync(["_", "list"])).rejects.toThrow(
      "Channel ID is required. Either specify --channel-id or set the current channel.",
    );

    expect(getChannel).not.toHaveBeenCalled();
    expect(getApiBaseUrl).not.toHaveBeenCalled();
    expect(getLiffBaseUrl).not.toHaveBeenCalled();
  });

  it("should error when channel does not exist", async () => {
    const channelId = "nonexistent";

    vi.mocked(getCurrentChannelId).mockReturnValueOnce(channelId);
    vi.mocked(getChannel).mockReturnValueOnce(undefined);

    const command = makeListCommand();

    await expect(command.parseAsync(["_", "list"])).rejects.toThrow(
      `Channel ${channelId} is not found.`,
    );

    expect(getChannel).toHaveBeenCalledWith(channelId);
    expect(getApiBaseUrl).not.toHaveBeenCalled();
    expect(getLiffBaseUrl).not.toHaveBeenCalled();
  });

  it("should propagate errors from base URL getter functions", async () => {
    const channelId = "123";
    const errorMessage = "Failed to get API base URL";

    vi.mocked(getCurrentChannelId).mockReturnValueOnce(channelId);
    vi.mocked(getChannel).mockReturnValueOnce({
      accessToken: "token",
      expiresIn: 3600,
      secret: "secret",
      issuedAt: 1000,
    });
    vi.mocked(getApiBaseUrl).mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    const command = makeListCommand();

    await expect(command.parseAsync(["_", "list"])).rejects.toThrow(
      errorMessage,
    );

    expect(getChannel).toHaveBeenCalledWith(channelId);
    expect(getApiBaseUrl).toHaveBeenCalledWith(channelId);
  });
});
