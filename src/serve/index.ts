import { Command } from "commander";
import { LocalProxy } from "../proxy/local-proxy.js";
import path from "path";
import { serveAction } from "./serveAction.js";

export const serveCommands = (program: Command) => {
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
      "--local-proxy-port <localProxyPort>",
      "The port number of the application proxy server to listen on when running the CLI.",
      "9000",
    )
    .action(async (options) => {
      const cwd = process.cwd();
      const proxy = new LocalProxy({
        keyPath: path.resolve(cwd, "localhost-key.pem"),
        certPath: path.resolve(cwd, "localhost.pem"),
        port: options.localProxyPort,
      });
      await serveAction(options, proxy);
    });
  return serve;
};
