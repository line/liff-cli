import { AuthApiClient } from "../api/auth.js";
import { getLineBaseUrl } from "../config/stores/common.js";
import { ChannelInfo, upsertChannel } from "./stores/channels.js";

export const renewAccessToken = async (
  channelId: string,
  channelSecret: string,
  issuedAt: number,
): Promise<ChannelInfo | undefined> => {
  const lineBaseUrl = getLineBaseUrl();
  const client = new AuthApiClient({
    baseUrl: lineBaseUrl,
  });
  const res = await client.fetchStatelessChannelAccessToken({
    channelId: channelId,
    channelSecret: channelSecret,
  });
  if (!res.access_token) {
    throw new Error("Failed to get access token.");
  }
  return upsertChannel(
    channelId,
    channelSecret,
    res.access_token,
    res.expires_in,
    issuedAt,
  );
};
