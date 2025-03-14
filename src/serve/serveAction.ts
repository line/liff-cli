import { spawn } from "node:child_process";
import { LiffApiClient } from "../api/liff.js";
import { resolveChannel } from "../channel/resolveChannel.js";
import { getCurrentChannelId } from "../channel/stores/channels.js";
import { ProxyInterface } from "./proxy/proxy-interface.js";
import resolveEndpointUrl from "./resolveEndpointUrl.js";
import pc from "picocolors";
import { getLiffBaseUrl } from "../channel/baseUrl.js";

export const serveAction = async (
  options: {
    liffId: string;
    url?: string;
    host?: string;
    port?: string;
    inspect?: boolean;
    localProxyPort: string;
  },
  proxy: ProxyInterface,
) => {
  const currentChannelId = getCurrentChannelId();
  if (!currentChannelId) {
    throw new Error(`Current channel not set.
        Please set the current channel first.
        `);
  }

  const channelInfo = await resolveChannel(currentChannelId);
  if (!channelInfo) {
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

  const httpsUrl = await proxy.connect(endpointUrl);
  const liffBaseUrl = await getLiffBaseUrl(currentChannelId);
  const liffUrl = new URL(liffBaseUrl);
  liffUrl.pathname = options.liffId;

  const client = new LiffApiClient({
    token: channelInfo.accessToken,
    baseUrl: liffBaseUrl,
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
