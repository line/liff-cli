import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthApiClient } from "../api/auth.js";
import { upsertChannel } from "./stores/channels.js";
import { renewAccessToken } from "./renewAccessToken.js";

vi.mock("../api/auth.js", () => {
  const fn = vi.fn();
  return {
    AuthApiClient: vi.fn(() => ({
      fetchStatelessChannelAccessToken: fn,
    })),
  };
});

vi.mock("./stores/channels.js");

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
    const apiBaseUrl = "https://api.example.com";

    vi.mocked(mockFetchStatelessChannelAccessToken).mockResolvedValue({
      token_type: "Bearer",
      access_token: accessToken,
      expires_in: expiresIn,
    });
    vi.mocked(upsertChannel).mockReturnValue({
      secret: channelSecret,
      accessToken,
      expiresIn,
      issuedAt,
      apiBaseUrl,
    });

    const result = await renewAccessToken(
      channelId,
      channelSecret,
      issuedAt,
      apiBaseUrl,
    );

    expect(AuthApiClient).toHaveBeenCalledWith({ baseUrl: apiBaseUrl });
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
      apiBaseUrl,
    );
    expect(result).toStrictEqual({
      secret: channelSecret,
      accessToken,
      expiresIn,
      issuedAt,
      apiBaseUrl,
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
