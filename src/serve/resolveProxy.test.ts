import { describe, it, expect } from "vitest";
import { resolveProxy } from "./resolveProxy.js";
import { LocalProxy } from "./proxy/local-proxy.js";
import { NgrokV1Proxy } from "./proxy/ngrok-v1-proxy.js";

describe("resolveProxy", () => {
  it("should return LocalProxy when proxyType is local-proxy", () => {
    const options = {
      proxyType: "local-proxy",
      localProxyPort: "9000",
      localProxyInspectorPort: "9223",
      ngrokCommand: "ngrok",
    };

    expect(resolveProxy(options)).toEqual({
      liffAppProxy: expect.any(LocalProxy),
      liffInspectorProxy: expect.any(LocalProxy),
    });
  });

  it("should return NgrokV1Proxy when proxyType is ngrok-v1", () => {
    const options = {
      proxyType: "ngrok-v1",
      localProxyPort: "9000",
      localProxyInspectorPort: "9223",
      ngrokCommand: "ngrok",
    };

    expect(resolveProxy(options)).toEqual({
      liffAppProxy: expect.any(NgrokV1Proxy),
      liffInspectorProxy: expect.any(NgrokV1Proxy),
    });
  });

  it("should throw an error when an unknown proxyType is specified", () => {
    const options = {
      proxyType: "unknown",
      localProxyPort: "9000",
      localProxyInspectorPort: "9223",
      ngrokCommand: "ngrok",
    };

    expect(() => resolveProxy(options)).toThrow("Unknown proxy type: unknown");
  });
});
