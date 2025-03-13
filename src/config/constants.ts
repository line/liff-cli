export const BASE_URL_CONFIG = {
  api: {
    defaultBaseUrl: "https://api.line.me",
    configKey: "api-base-url",
  },
  liff: {
    defaultBaseUrl: "https://liff.line.me",
    configKey: "liff-base-url",
  },
} as const;

export const VALID_CONFIG_KEYS = [
  BASE_URL_CONFIG.api.configKey,
  BASE_URL_CONFIG.liff.configKey,
] as const;
