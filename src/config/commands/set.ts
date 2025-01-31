import { Command } from "commander";
import { setLiffBaseUrl, setLineBaseUrl } from "../stores/common.js";

const setAction = async (key: string, value: string) => {
  switch (key) {
    case "baseUrl.line":
      setLineBaseUrl(value);
      break;
    case "baseUrl.liff":
      setLiffBaseUrl(value);
      break;
    default:
      throw new Error(`Unknown key: ${key}`);
  }
};

export const makeSetCommand = () => {
  const set = new Command("set");
  set
    .description("Set configuration")
    .argument("<key>", "The key to set")
    .argument("<value>", "The value to set")
    .action(setAction);

  return set;
};
