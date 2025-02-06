import Conf from "conf";
import { promises as fs } from "fs";

const packageJson = JSON.parse(
  await fs.readFile(new URL("../../../package.json", import.meta.url), "utf8"),
);

export interface RootConfig {
  currentChannelId?: string;
  channels?: {
    [channelId: string]: {
      secret: string;
      accessToken: string;
      expiresIn: number;
      issuedAt: number;
    };
  };
  common?: {
    baseUrl?: {
      liff: string;
      line: string;
    };
  };
}

export const store = new Conf<RootConfig>({
  projectName: packageJson.name,
  projectVersion: packageJson.version,
  schema: {
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
    common: {
      type: "object",
      properties: {
        baseUrl: {
          type: "object",
          properties: {
            liff: {
              type: "string",
              description: "The base URL for LIFF Application",
            },
            line: {
              type: "string",
              description: "The base URL for LINE API",
            },
          },
        },
      },
    },
  },
});
