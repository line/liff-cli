import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

import { resolveChannel } from "./resolveChannel.js";
import { getChannel, getCurrentChannelId } from "./stores/channels.js";
import { renewAccessToken } from "./renewAccessToken.js";

vi.mock("./stores/channels.ts");
vi.mock("./renewAccessToken.ts");

describe("resolveChannel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should return undefined if there is no current channel", async () => {
    vi.mocked(getCurrentChannelId).mockReturnValueOnce(undefined);

    const result = await resolveChannel();

    expect(result).toBeUndefined();
    expect(getChannel).not.toHaveBeenCalled();
    expect(renewAccessToken).not.toHaveBeenCalled();
  });

  it("should return undefined if the specified channel does not exist", async () => {
    const channelId = "123";
    vi.mocked(getChannel).mockReturnValueOnce(undefined);

    const result = await resolveChannel(channelId);

    expect(result).toBeUndefined();
  });

  it("should return the current channel", async () => {
    const currentChannelId = "123";
    const channelData = {
      secret: "secret",
      accessToken: "access_token",
      expiresIn: 3600,
      issuedAt: Date.now(),
    };
    vi.mocked(getCurrentChannelId).mockReturnValueOnce(currentChannelId);
    vi.mocked(getChannel).mockReturnValueOnce(channelData);

    const result = await resolveChannel();

    expect(result).toStrictEqual(channelData);
    expect(renewAccessToken).not.toHaveBeenCalled();
  });

  it("should return the specified channel", async () => {
    const channelId = "123";
    const channelData = {
      secret: "secret",
      accessToken: "access_token",
      expiresIn: 3600,
      issuedAt: Date.now(),
    };
    vi.mocked(getChannel).mockReturnValueOnce(channelData);

    const result = await resolveChannel(channelId);

    expect(result).toStrictEqual(channelData);
    expect(renewAccessToken).not.toHaveBeenCalled();
  });

  it("should renew the access token if it has expired", async () => {
    const channelId = "123";
    const now = Date.now();
    vi.setSystemTime(now);
    const channelData = {
      secret: "secret",
      accessToken: "access_token",
      expiresIn: 3600,
      issuedAt: now - 3600 * 1000 - 1,
    };

    vi.mocked(getChannel).mockReturnValueOnce(channelData);
    vi.mocked(getCurrentChannelId).mockReturnValueOnce(channelId);
    vi.mocked(renewAccessToken).mockResolvedValueOnce({
      secret: "secret",
      accessToken: "new_access_token",
      expiresIn: 3600,
      issuedAt: now,
    });

    const result = await resolveChannel();

    expect(result).not.toStrictEqual(channelData);
    expect(renewAccessToken).toHaveBeenCalledWith(channelId, "secret", now);
  });
});
