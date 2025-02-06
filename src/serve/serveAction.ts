import { spawn } from "node:child_process";
import { LiffApiClient } from "../api/liff.js";
import { resolveChannel } from "../channel/resolveChannel.js";
import { getCurrentChannelId } from "../channel/stores/channels.js";
import { LocalProxy } from "./proxy/local-proxy.js";
import resolveEndpointUrl from "./resolveEndpointUrl.js";
import pc from "picocolors";

export const serveAction = async (
  options: {
    liffId: string;
    url?: string;
    host?: string;
    port?: string;
    inspect?: boolean;
    localProxyPort: string;
  },
  localProxy: LocalProxy,
) => {
  const accessToken = (await resolveChannel(getCurrentChannelId()))
    ?.accessToken;
  if (!accessToken) {
    throw new Error(`Access token not found.
        Please set the current channel first.
        `);
  }

  const endpointUrl = resolveEndpointUrl({
    url: options.url,
    host: options.host,
    port: options.port,
  });

  if (options.inspect) {
    spawn(
      "npx",
      [
        "@line/liff-inspector",
        "--key=./localhost-key.pem",
        "--cert=./localhost.pem",
      ],
      {
        shell: true,
        stdio: "inherit",
      },
    );
    endpointUrl.searchParams.set("li.origin", "wss://localhost:9222");
  }

  const httpsUrl = await localProxy.connect(endpointUrl);
  const liffUrl = new URL("https://liff.line.me/");
  liffUrl.pathname = options.liffId;

  const client = new LiffApiClient({
    token: accessToken,
    baseUrl: "https://api.line.me",
  });
  await client.updateApp(options.liffId, {
    view: { url: httpsUrl.toString() },
  });

  console.info(
    `Successfully updated endpoint url for LIFF ID: ${options.liffId}.\n`,
  );

  console.info(
    `${pc.green("→")}  ${pc.white("LIFF URL:")}     ${pc.blue(liffUrl.toString())}`,
  );
  console.info(
    `${pc.green("→")}  ${pc.white("Proxy server:")} ${pc.blue(httpsUrl.toString())}`,
  );
};
