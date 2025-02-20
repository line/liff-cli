import { spawn } from "node:child_process";
import { LiffApiClient } from "../api/liff.js";
import { resolveChannel } from "../channel/resolveChannel.js";
import { getCurrentChannelId } from "../channel/stores/channels.js";
import { ProxyInterface } from "./proxy/proxy-interface.js";
import resolveEndpointUrl from "./resolveEndpointUrl.js";
import pc from "picocolors";

const setupLiffInspector = async (liffInspectorProxy: ProxyInterface) => {
  const LIFF_INSPECTOR_DEFAULT_PORT = "9222";
  const liffInspectorUrl = new URL("ws://localhost");
  liffInspectorUrl.port = LIFF_INSPECTOR_DEFAULT_PORT;

  spawn("npx", ["@line/liff-inspector"], {
    shell: true,
    stdio: "inherit",
  });

  const wssUrl = await liffInspectorProxy.connect(liffInspectorUrl);

  return wssUrl;
};

export const serveAction = async (
  options: {
    liffId: string;
    url?: string;
    host?: string;
    port?: string;
    inspect?: boolean;
    localProxyPort: string;
  },
  liffAppProxy: ProxyInterface,
  liffInspectorProxy: ProxyInterface,
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

  const wssUrl = options.inspect
    ? await setupLiffInspector(liffInspectorProxy)
    : undefined;
  const httpsUrl = await liffAppProxy.connect(endpointUrl);

  const liffUrl = new URL("https://liff.line.me/");
  liffUrl.pathname = options.liffId;

  const client = new LiffApiClient({
    token: accessToken,
    baseUrl: "https://api.line.me",
  });
  if (wssUrl) {
    httpsUrl.searchParams.set("li.origin", wssUrl.toString());
  }

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
