import path from "path";

import { LocalProxy } from "./proxy/local-proxy.js";
import { NgrokV1Proxy } from "./proxy/ngrok-v1-proxy.js";
import { ProxyInterface } from "./proxy/proxy-interface.js";

type Options = {
  proxyType: string;
  localProxyPort: string;
  ngrokCommand: string;
};

export const resolveProxy = (options: Options): ProxyInterface => {
  if (options.proxyType === "local-proxy") {
    const cwd = process.cwd();
    return new LocalProxy({
      keyPath: path.resolve(cwd, "localhost-key.pem"),
      certPath: path.resolve(cwd, "localhost.pem"),
      port: options.localProxyPort,
    });
  }

  if (options.proxyType === "ngrok-v1") {
    return new NgrokV1Proxy({
      ngrokCommand: options.ngrokCommand,
    });
  }

  throw new Error(`Unknown proxy type: ${options.proxyType}`);
};
