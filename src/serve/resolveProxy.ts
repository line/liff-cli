import path from "path";

import { LocalProxy } from "./proxy/local-proxy.js";
import { NgrokProxy } from "./proxy/ngrok-proxy.js";
import { NgrokV1Proxy } from "./proxy/ngrok-v1-proxy.js";
import { ProxyInterface } from "./proxy/proxy-interface.js";

type Options = {
  proxyType: string;
  localProxyPort: string;
  localProxyInspectorPort: string;
  ngrokCommand: string;
};

export const resolveProxy = (
  options: Options,
): { liffAppProxy: ProxyInterface; liffInspectorProxy: ProxyInterface } => {
  if (options.proxyType === "local-proxy") {
    const cwd = process.cwd();
    const keyPath = path.resolve(cwd, "localhost-key.pem");
    const certPath = path.resolve(cwd, "localhost.pem");
    return {
      liffAppProxy: new LocalProxy({
        keyPath,
        certPath,
        port: options.localProxyPort,
      }),
      liffInspectorProxy: new LocalProxy({
        keyPath,
        certPath,
        port: options.localProxyInspectorPort,
      }),
    };
  }

  if (options.proxyType === "ngrok-v1") {
    console.warn("ngrok-v1 is experimental feature.");
    return {
      liffAppProxy: new NgrokV1Proxy({
        ngrokCommand: options.ngrokCommand,
      }),
      liffInspectorProxy: new NgrokV1Proxy({
        ngrokCommand: options.ngrokCommand,
      }),
    };
  }

  if (options.proxyType === "ngrok-v3") {
    console.warn("ngrok-v3 is experimental feature.");

    return {
      liffAppProxy: new NgrokProxy({
        ngrokCommand: options.ngrokCommand,
      }),
      liffInspectorProxy: new NgrokProxy({
        ngrokCommand: options.ngrokCommand,
      }),
    };
  }

  throw new Error(`Unknown proxy type: ${options.proxyType}`);
};
