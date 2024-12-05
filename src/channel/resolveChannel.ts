import {
  ChannelInfo,
  getChannel,
  getCurrentChannelId,
} from "./stores/channels.js";
import { renewAccessToken } from "./renewAccessToken.js";

export const resolveChannel = async (
  channelId?: string,
): Promise<ChannelInfo | undefined> => {
  const currentChannelId = channelId || getCurrentChannelId();
  if (!currentChannelId) {
    return;
  }
  const channel = getChannel(currentChannelId);
  if (!channel) {
    return;
  }

  const { expiresIn, issuedAt } = channel;
  const now = Date.now();
  // If the access token is still valid, return it.
  // Otherwise, renew the access token.
  if (now - issuedAt < expiresIn * 1000) {
    return channel;
  }
  return renewAccessToken(currentChannelId, channel.secret, now);
};
