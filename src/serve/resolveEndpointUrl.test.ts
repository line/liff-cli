import { describe, it, expect } from "vitest";
import { resolveEndpointUrl } from "./resolveEndpointUrl.js";
import { URL } from "url";

describe("resolveEndpointUrl", () => {
  it("should return the correct URL when --url option is specified without other options", () => {
    const options = { liffId: "123-xxx", url: "https://example.com" };

    expect(resolveEndpointUrl({ url: options.url })).toStrictEqual(
      new URL("https://example.com"),
    );
  });

  it("should return the correct URL when --host and --port options are specified", () => {
    const options = { liffId: "123-xxx", host: "localhost", port: "8080" };

    expect(
      resolveEndpointUrl({ host: options.host, port: options.port }),
    ).toStrictEqual(new URL("https://localhost:8080"));
  });

  it("should throw an error when --url option is specified with --host option", () => {
    const options = {
      url: "https://example.com",
      host: "8000",
    };

    expect(() =>
      resolveEndpointUrl({ url: options.url, host: options.host }),
    ).toThrow(
      "When --url is specified, --host, and --port cannot be specified.",
    );
  });

  it("should throw an error when --host option is specified without --port option", () => {
    const options = { port: "8080" };

    expect(() => resolveEndpointUrl({ port: options.port })).toThrow(
      "When --port is specified, --host must also be specified.",
    );
  });

  it("should throw an error when --port option is specified without --host option", () => {
    const options = { host: "localhost" };

    expect(() => resolveEndpointUrl({ host: options.host })).toThrow(
      "When --host is specified, --port must also be specified.",
    );
  });

  it("should throw an error when neither --url, nor both --host and --port are specified", () => {
    expect(() => resolveEndpointUrl({})).toThrow(
      "Either --url, or both --host and --port must be specified.",
    );
  });
});
