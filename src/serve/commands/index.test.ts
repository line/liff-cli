import { afterEach, describe, expect, it, vi } from "vitest";
import { installServeCommands } from "./index.js";
import { LocalProxy } from "../proxy/local-proxy.js";
import path from "path";
import { Command } from "commander";
import { serveAction } from "../serveAction.js";

vi.mock("../serveAction.js");

describe("serveCommand", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call serveAction with correct options and proxy", async () => {
    const program = new Command();
    const options = {
      liffId: "123-xxx",
      url: "https://example.com?hoge=fuga",
      host: "https://example.com",
      port: "8000",
      proxyType: "local-proxy",
      localProxyPort: "9001",
      localProxyInspectorPort: "9223",
      ngrokCommand: "ngrok",
      inspect: true,
    };

    const cwd = process.cwd();
    const keyPath = path.resolve(cwd, "localhost-key.pem");
    const certPath = path.resolve(cwd, "localhost.pem");

    const liffAppProxy = new LocalProxy({
      keyPath,
      certPath,
      port: "9001",
    });

    const liffInspectorProxy = new LocalProxy({
      keyPath,
      certPath,
      port: "9223",
    });

    const command = installServeCommands(program);
    await command.parseAsync([
      "_",
      "serve",
      "--liff-id",
      options.liffId,
      "--url",
      options.url,
      "--host",
      options.host,
      "--port",
      options.port,
      "--local-proxy-port",
      options.localProxyPort,
      "--local-proxy-inspector-port",
      options.localProxyInspectorPort,
      "--inspect",
      "--proxy-type",
      options.proxyType,
      "--ngrok-command",
      options.ngrokCommand,
    ]);

    expect(serveAction).toHaveBeenCalledWith(
      options,
      liffAppProxy,
      liffInspectorProxy,
    );
  });
});
