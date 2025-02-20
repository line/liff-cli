import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LiffApiClient } from "../api/liff.js";
import { resolveChannel } from "../channel/resolveChannel.js";
import { spawn } from "node:child_process";
import { LocalProxy } from "./proxy/local-proxy.js";
import path from "path";
import { serveAction } from "./serveAction.js";

vi.mock("../api/liff.js", () => {
  const fn = vi.fn();
  return {
    LiffApiClient: vi.fn(() => ({
      updateApp: fn,
    })),
  };
});

vi.mock("../channel/resolveChannel.js");
vi.mock("node:child_process");

const cwd = process.cwd();
const keyPath = path.resolve(cwd, "localhost-key.pem");
const certPath = path.resolve(cwd, "localhost.pem");

const liffAppProxy = new LocalProxy({
  keyPath,
  certPath,
  port: "9000",
});

const liffInspectorProxy = new LocalProxy({
  keyPath,
  certPath,
  port: "9223",
});

describe("serveAction", () => {
  let mockUpdateApp: LiffApiClient["updateApp"];

  beforeEach(() => {
    vi.stubGlobal("console", {
      ...console,
      info: vi.fn(),
    });
    const liffApiClientInstance = new LiffApiClient({
      baseUrl: "",
      token: "",
    });
    mockUpdateApp = liffApiClientInstance.updateApp;
  });

  afterEach(async () => {
    await liffAppProxy.cleanup();
    await liffInspectorProxy.cleanup();
    vi.restoreAllMocks();
  });

  it("should update a LIFF app successfully when the --url option is specified", async () => {
    const options = {
      liffId: "123-xxx",
      url: "http://example.com",
      localProxyPort: "9000",
    };

    vi.mocked(resolveChannel).mockResolvedValueOnce({
      accessToken: "token",
      expiresIn: 3600,
      secret: "secret",
      issuedAt: 1000,
    });
    vi.mocked(mockUpdateApp).mockResolvedValueOnce();

    await serveAction(options, liffAppProxy, liffInspectorProxy);

    expect(mockUpdateApp).toHaveBeenCalledWith(options.liffId, {
      view: { url: "https://localhost:9000/" },
    });
    expect(console.info).toHaveBeenCalledWith(
      `Successfully updated endpoint url for LIFF ID: ${options.liffId}.\n`,
    );
  });

  it("should update a LIFF app successfully with liff-inspector when the --inspect option is specified", async () => {
    const options = {
      liffId: "123-xxx",
      url: "http://example.com?hoge=fuga",
      inspect: true,
      localProxyPort: "9000",
    };

    vi.mocked(resolveChannel).mockResolvedValueOnce({
      accessToken: "token",
      expiresIn: 3600,
      secret: "secret",
      issuedAt: 1000,
    });
    vi.mocked(mockUpdateApp).mockResolvedValueOnce();

    await serveAction(options, liffAppProxy, liffInspectorProxy);

    expect(spawn).toHaveBeenCalledWith("npx", ["@line/liff-inspector"], {
      shell: true,
      stdio: "inherit",
    });

    expect(mockUpdateApp).toHaveBeenCalledWith(options.liffId, {
      view: {
        url: "https://localhost:9000/?hoge=fuga&li.origin=wss%3A%2F%2Flocalhost%3A9223%2F",
      },
    });
  });

  it("should handle channel not found", async () => {
    const options = {
      liffId: "123-xxx",
      url: "http://example.com",
      localProxyPort: "9000",
    };

    vi.mocked(resolveChannel).mockResolvedValueOnce(undefined);

    await expect(serveAction(options, liffAppProxy, liffInspectorProxy)).rejects
      .toThrow(`Access token not found.
        Please set the current channel first.
    `);

    expect(mockUpdateApp).not.toHaveBeenCalled();
  });

  it("Should not update a LIFF app when --url, --host, and --port are specified", async () => {
    const options = {
      liffId: "123-xxx",
      url: "http://example.com",
      host: "localhost",
      port: "8080",
      localProxyPort: "9000",
    };

    vi.mocked(resolveChannel).mockResolvedValueOnce({
      accessToken: "token",
      expiresIn: 3600,
      secret: "secret",
      issuedAt: 1000,
    });
    vi.mocked(mockUpdateApp).mockResolvedValueOnce();

    await expect(
      serveAction(options, liffAppProxy, liffInspectorProxy),
    ).rejects.toThrow(
      "When --url is specified, --host, and --port cannot be specified.",
    );

    expect(mockUpdateApp).not.toHaveBeenCalled();
  });
});
