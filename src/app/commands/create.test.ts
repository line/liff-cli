import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { resolveChannel } from "../../channel/resolveChannel.js";
import { makeCreateCommand } from "./create.js";
import { LiffApiClient } from "../../api/liff.js";

vi.mock("../../api/liff.js", () => {
  const fn = vi.fn();
  return {
    LiffApiClient: vi.fn(() => ({
      addApp: fn,
    })),
  };
});

vi.mock("../../channel/resolveChannel.js");

describe("makeCreateCommand", () => {
  let mockAddApp: LiffApiClient["addApp"];

  beforeEach(() => {
    vi.stubGlobal("console", {
      ...console,
      info: vi.fn(),
    });
    const liffApiClientInstance = new LiffApiClient({ baseUrl: "", token: "" });
    mockAddApp = liffApiClientInstance.addApp;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a LIFF app successfully", async () => {
    const channelId = 123;
    const options = {
      name: "Test App",
      endpointUrl: "https://example.com",
      viewType: "tall",
    };

    vi.mocked(resolveChannel).mockResolvedValueOnce({
      accessToken: "token",
      expiresIn: 3600,
      secret: "secret",
      issuedAt: 1000,
    });
    vi.mocked(mockAddApp).mockResolvedValueOnce({ liffId: "12345" });

    const command = makeCreateCommand();

    await command.parseAsync([
      "_",
      "create",
      channelId.toString(),
      "--name",
      options.name,
      "--endpoint-url",
      options.endpointUrl,
      "--view-type",
      options.viewType,
    ]);
    expect(mockAddApp).toHaveBeenCalledWith({
      description: options.name,
      view: {
        type: options.viewType,
        url: options.endpointUrl,
      },
    });
    expect(console.info).toHaveBeenCalledWith(
      "Successfully created LIFF app: 12345",
    );
  });

  it.each([
    ["name", "--endpoint-url", "https://example.com", "--view-type", "tall"],
    ["endpointUrl", "--name", "Test App", "--view-type", "tall"],
    ["viewType", "--name", "Test App", "--endpoint-url", "https://example.com"],
  ])(
    "should handle missing option %s",
    async (_, key1, value1, key2, value2) => {
      const channelId = 123;
      vi.mocked(resolveChannel).mockResolvedValueOnce({
        accessToken: "token",
        expiresIn: 3600,
        secret: "secret",
        issuedAt: 1000,
      });

      const command = makeCreateCommand();

      await expect(
        command.parseAsync([
          "_",
          "create",
          channelId.toString(),
          `--${key1}`,
          value1,
          `--${key2}`,
          value2,
        ]),
      ).rejects.toThrowError('process.exit unexpectedly called with "1"');
      expect(mockAddApp).not.toHaveBeenCalled();
    },
  );

  it("should handle channel not found", async () => {
    const channelId = 123;

    vi.mocked(resolveChannel).mockResolvedValueOnce(undefined);

    const command = makeCreateCommand();

    await expect(
      command.parseAsync([
        "_",
        "create",
        channelId.toString(),
        "--name",
        "Test App",
        "--endpoint-url",
        "https://example.com",
        "--view-type",
        "tall",
      ]),
    ).rejects.toThrowError(`Access token not found.
      Please provide a valid channel ID or set the current channel first.`);
    expect(mockAddApp).not.toHaveBeenCalled();
  });
});
