import { BASE_URL_CONFIG } from "../config/constants.js";
import { resolveChannel } from "./resolveChannel.js";
import { getChannel, setChannel } from "./stores/channels.js";

export const getApiBaseUrl = async (channelId?: string): Promise<string> => {
  const channelInfo = await resolveChannel(channelId);
  if (!channelInfo) {
    throw new Error(`Channel not found.`);
  }
  return channelInfo.baseUrl?.api || BASE_URL_CONFIG.api.defaultBaseUrl;
};

export const getLiffBaseUrl = async (channelId?: string): Promise<string> => {
  const channelInfo = await resolveChannel(channelId);
  if (!channelInfo) {
    throw new Error(`Channel not found.`);
  }
  return channelInfo.baseUrl?.liff || BASE_URL_CONFIG.liff.defaultBaseUrl;
};

export const setApiBaseUrl = (channelId: string, apiBaseUrl: string): void => {
  const channel = getChannel(channelId);
  if (!channel) {
    throw new Error(`Channel ${channelId} is not added yet.`);
  }

  setChannel(channelId, {
    ...channel,
    baseUrl: {
      ...channel.baseUrl,
      api: apiBaseUrl,
    },
  });
};

export const setLiffBaseUrl = (
  channelId: string,
  liffBaseUrl: string,
): void => {
  const channel = getChannel(channelId);
  if (!channel) {
    throw new Error(`Channel ${channelId} is not added yet.`);
  }

  setChannel(channelId, {
    ...channel,
    baseUrl: {
      ...channel.baseUrl,
      liff: liffBaseUrl,
    },
  });
};
