import Conf from "conf";

import { promises as fs } from "fs";
import { BASE_URL_CONFIG } from "../../config/constants.js";

const packageJson: {
  name: string;
  version: string;
} = JSON.parse(
  await fs.readFile(new URL("../../../package.json", import.meta.url), "utf8"),
);

const channelsSchema = {
  currentChannelId: {
    type: "string",
  },
  channels: {
    type: "object",
    properties: {
      secret: {
        type: "string",
        description: "The secret for the channel",
      },
      accessToken: {
        type: "string",
        description: "The access token for the channel",
      },
      expiresIn: {
        type: "number",
        description: "The number of seconds the access token is valid for",
      },
      issuedAt: {
        type: "number",
        description:
          "The milliseconds timestamp when the access token was issued",
      },
    },
  },
};

export type ChannelInfo = {
  secret: string;
  accessToken: string;
  expiresIn: number;
  issuedAt: number;
  baseUrl?: {
    api?: string;
    liff?: string;
  };
};

type ChannelConfig = {
  currentChannelId: string;
  channels: {
    [channelId: string]: ChannelInfo;
  };
};

const store = new Conf<ChannelConfig>({
  projectName: packageJson.name,
  projectVersion: packageJson.version,
  schema: {
    ...channelsSchema,
  },
});

export const upsertChannel = (
  channelId: string,
  channelSecret: string,
  accessToken: string,
  expiresIn: number,
  issuedAt: number,
): ChannelInfo => {
  const channels = store.get("channels") || {};
  const existingChannel = channels[channelId];
  channels[channelId] = {
    secret: channelSecret,
    accessToken,
    expiresIn,
    issuedAt,
    // Preserve existing endpoint settings if they exist
    ...(existingChannel?.baseUrl ? { baseUrl: existingChannel.baseUrl } : {}),
  };

  store.set("channels", channels);
  return channels[channelId];
};

export const getChannel = (channelId: string): ChannelInfo | undefined => {
  const channels = store.get("channels");
  if (!channels || !channels[channelId]) {
    return;
  }
  return channels[channelId];
};

export const setChannel = (
  channelId: string,
  channelInfo: ChannelInfo,
): void => {
  const channels = store.get("channels") || {};
  channels[channelId] = channelInfo;
  store.set("channels", channels);
};

export const setCurrentChannel = (channelId: string): void => {
  store.set("currentChannelId", channelId);
};

export const getCurrentChannelId = (): string | undefined => {
  return store.get("currentChannelId");
};

export const getApiBaseUrl = (channelId: string): string => {
  const channel = getChannel(channelId);
  if (!channel) {
    throw new Error(`Channel ${channelId} is not found.`);
  }

  return channel.baseUrl?.api || BASE_URL_CONFIG.api.defaultBaseUrl;
};

export const getLiffBaseUrl = (channelId: string): string => {
  const channel = getChannel(channelId);
  if (!channel) {
    throw new Error(`Channel ${channelId} is not found.`);
  }

  return channel.baseUrl?.liff || BASE_URL_CONFIG.liff.defaultBaseUrl;
};

export const setApiBaseUrl = (channelId: string, apiBaseUrl: string): void => {
  const channel = getChannel(channelId);
  if (!channel) {
    throw new Error(`Channel ${channelId} is not added yet.`);
  }

  const channels = store.get("channels") || {};
  channels[channelId] = {
    ...channel,
    baseUrl: {
      ...channel.baseUrl,
      api: apiBaseUrl,
    },
  };

  store.set("channels", channels);
};

export const setLiffBaseUrl = (
  channelId: string,
  liffBaseUrl: string,
): void => {
  const channel = getChannel(channelId);
  if (!channel) {
    throw new Error(`Channel ${channelId} is not added yet.`);
  }

  const channels = store.get("channels") || {};
  channels[channelId] = {
    ...channel,
    baseUrl: {
      ...channel.baseUrl,
      liff: liffBaseUrl,
    },
  };

  store.set("channels", channels);
};
