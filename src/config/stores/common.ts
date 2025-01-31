import { store } from "./index.js";

export const getLineBaseUrl = (): string => {
  return store.get("common.baseUrl.line") ?? "https://api.line.me";
};

export const setLineBaseUrl = (url: string) => {
  store.set("common.baseUrl.line", url);
};

export const getLiffBaseUrl = (): string => {
  return store.get("common.baseUrl.liff") ?? "https://liff.line.me";
};

export const setLiffBaseUrl = (url: string) => {
  store.set("common.baseUrl.liff", url);
};
