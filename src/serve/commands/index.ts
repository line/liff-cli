import { Command } from "commander";
import { serveAction } from "../serveAction.js";
import { resolveProxy } from "../resolveProxy.js";

export const installServeCommands = (program: Command) => {
  const serve = program.command("serve");
  serve
    .description("Manage HTTPS dev server")
    .requiredOption(
      "-l, --liff-id <liffId>",
      "The LIFF id that the user wants to update.",
    )
    .option("-u, --url <url>", "The local URL of the LIFF app.")
    .option("--host <host>", "The host of the application server.")
    .option("--port <port>", "The port number of the application server.")
    .option(
      "-i, --inspect",
      "The flag indicates LIFF app starts on debug mode. (default: false)",
    )
    .option(
      "--proxy-type <proxyType>",
      "The type of proxy to use. local-proxy or ngrok-v1",
      "local-proxy",
    )
    .option(
      "--local-proxy-port <localProxyPort>",
      "The port number of the application proxy server to listen on when running the CLI.",
      "9000",
    )
    .option(
      "--ngrok-command <ngrokCommand>",
      "The command to run ngrok.",
      "ngrok",
    )
    .action(async (options) => {
      const proxy = resolveProxy(options);
      await serveAction(options, proxy);
    });
  return serve;
};
