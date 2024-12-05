import { afterEach, describe, expect, it, vi } from "vitest";
import { serveCommands } from "./index.js";
import { LocalProxy } from "../proxy/local-proxy.js";
import path from "path";
import { Command } from "commander";
import { serveAction } from "./serveAction.js";

vi.mock("./serveAction");

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
      localProxyPort: "9001",
      inspect: true,
    };

    const cwd = process.cwd();
    const proxy = new LocalProxy({
      keyPath: path.resolve(cwd, "localhost-key.pem"),
      certPath: path.resolve(cwd, "localhost.pem"),
      port: "9001",
    });

    const command = serveCommands(program);
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
      "--inspect",
    ]);

    expect(serveAction).toHaveBeenCalledWith(options, proxy);
  });
});
