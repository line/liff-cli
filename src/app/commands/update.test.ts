import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { resolveChannel } from "../../channel/resolveChannel.js";
import { makeUpdateCommand } from "./update.js";
import { LiffApiClient } from "../../api/liff.js";

vi.mock("../../api/liff.js", () => {
  const fn = vi.fn();
  return {
    LiffApiClient: vi.fn(() => ({
      updateApp: fn,
    })),
  };
});

vi.mock("../../channel/resolveChannel.js");

describe("makeUpdateCommand", () => {
  let mockUpdateApp: LiffApiClient["updateApp"];

  beforeEach(() => {
    vi.stubGlobal("console", {
      ...console,
      info: vi.fn(),
    });
    const liffApiClientInstance = new LiffApiClient({ baseUrl: "", token: "" });
    mockUpdateApp = liffApiClientInstance.updateApp;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should update a LIFF app successfully", async () => {
    const channelId = 123;
    const liffId = "123-xxx";
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
    vi.mocked(mockUpdateApp).mockResolvedValueOnce();

    const command = makeUpdateCommand();

    await command.parseAsync([
      "_",
      "update",
      "--liff-id",
      liffId,
      "--channel-id",
      channelId.toString(),
      "--name",
      options.name,
      "--endpoint-url",
      options.endpointUrl,
      "--view-type",
      options.viewType,
    ]);
    expect(mockUpdateApp).toHaveBeenCalledWith(liffId, {
      description: options.name,
      view: {
        type: options.viewType,
        url: options.endpointUrl,
      },
    });
    expect(console.info).toHaveBeenCalledWith(
      `Successfully updated LIFF app: ${liffId}`,
    );
  });

  it("should handle channel not found", async () => {
    const channelId = 123;

    vi.mocked(resolveChannel).mockResolvedValueOnce(undefined);

    const command = makeUpdateCommand();

    await expect(
      command.parseAsync([
        "_",
        "update",
        "--liff-id",
        "123-xxx",
        "--channel-id",
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
    expect(mockUpdateApp).not.toHaveBeenCalled();
  });
});
