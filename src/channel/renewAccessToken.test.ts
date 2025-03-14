import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthApiClient } from "../api/auth.js";
import { upsertChannel } from "./stores/channels.js";
import { renewAccessToken } from "./renewAccessToken.js";
import {getApiBaseUrl} from "./baseUrl.js"

vi.mock("../api/auth.js", () => {
  const fn = vi.fn();
  return {
    AuthApiClient: vi.fn(() => ({
      fetchStatelessChannelAccessToken: fn,
    })),
  };
});

vi.mock("./stores/channels.js");
vi.mock("./baseUrl.js");

describe("renewAccessToken", () => {
  let mockFetchStatelessChannelAccessToken: AuthApiClient["fetchStatelessChannelAccessToken"];

  beforeEach(() => {
    const authApiClientInstance = new AuthApiClient({
      baseUrl: "",
    });
    mockFetchStatelessChannelAccessToken =
      authApiClientInstance.fetchStatelessChannelAccessToken;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should renew and upsert the access token successfully", async () => {
    const channelId = "123";
    const channelSecret = "secret";
    const accessToken = "new_access_token";
    const expiresIn = 3600;
    const issuedAt = Date.now();

    vi.mocked(getApiBaseUrl).mockResolvedValueOnce("https://api.line.me");
    vi.mocked(mockFetchStatelessChannelAccessToken).mockResolvedValue({
      token_type: "Bearer",
      access_token: accessToken,
      expires_in: expiresIn,
    });
    vi.mocked(upsertChannel).mockResolvedValue({
      secret: channelSecret,
      accessToken,
      expiresIn,
      issuedAt,
    });

    const result = await renewAccessToken(channelId, channelSecret, issuedAt);

    expect(
      vi.mocked(mockFetchStatelessChannelAccessToken),
    ).toHaveBeenCalledWith({
      channelId: channelId,
      channelSecret: channelSecret,
    });
    expect(upsertChannel).toHaveBeenCalledWith(
      channelId,
      channelSecret,
      accessToken,
      expiresIn,
      issuedAt,
    );
    expect(result).toStrictEqual({
      secret: channelSecret,
      accessToken,
      expiresIn,
      issuedAt,
    });
  });

  it("should throw an error if the access token is not retrieved", async () => {
    vi.mocked(mockFetchStatelessChannelAccessToken).mockResolvedValue(
      {} as Awaited<
        ReturnType<AuthApiClient["fetchStatelessChannelAccessToken"]>
      >,
    );

    await expect(renewAccessToken("123", "secret", 10)).rejects.toThrow(
      "Failed to get access token.",
    );
  });
});
