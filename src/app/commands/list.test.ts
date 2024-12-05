import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { LiffApiClient } from "../../api/liff.js";
import { makeListCommand } from "./list.js";
import { resolveChannel } from "../../channel/resolveChannel.js";

vi.mock("../../api/liff.js", () => {
  const fn = vi.fn();
  return {
    LiffApiClient: vi.fn(() => ({
      fetchApps: fn,
    })),
  };
});
vi.mock("../../channel/resolveChannel.js");

describe("makeListCommand", () => {
  let mockFetchApps: LiffApiClient["fetchApps"];

  beforeEach(() => {
    vi.stubGlobal("console", {
      ...console,
      info: vi.fn(),
    });
    const liffApiClientInstance = new LiffApiClient({ baseUrl: "", token: "" });
    mockFetchApps = liffApiClientInstance.fetchApps;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list LIFF apps successfully", async () => {
    vi.mocked(resolveChannel).mockResolvedValueOnce({
      accessToken: "valid_token",
      expiresIn: 3600,
      secret: "secret",
      issuedAt: 1000,
    });
    vi.mocked(mockFetchApps).mockResolvedValueOnce({
      apps: [
        {
          liffId: "123-A",
          description: "A App",
          view: {
            type: "tall",
            url: "https://example.com",
          },
        },
        {
          liffId: "123-B",
          description: "B App",
          view: {
            type: "tall",
            url: "https://example.com",
          },
        },
      ],
    });

    const command = makeListCommand();
    await command.parseAsync(["_", "list", "--channel-id", "123"]);

    expect(mockFetchApps).toHaveBeenCalledWith();
    expect(console.info).toHaveBeenCalledWith("LIFF apps:");
    expect(console.info).toHaveBeenCalledWith("123-A: A App");
    expect(console.info).toHaveBeenCalledWith("123-B: B App");
  });

  it("should throw an error if access token is not found", async () => {
    vi.mocked(resolveChannel).mockResolvedValueOnce(undefined);

    const command1 = makeListCommand();
    await expect(command1.parseAsync(["_", "list", "--channel-id", "123"]))
      .rejects.toThrow(`Access token not found.
      Please provide a valid channel ID or set the current channel first.`);
    expect(console.info).not.toHaveBeenCalled();

    vi.mocked(resolveChannel).mockResolvedValueOnce(undefined);

    const command2 = makeListCommand();
    await expect(command2.parseAsync(["_", "list"])).rejects
      .toThrow(`Access token not found.
      Please provide a valid channel ID or set the current channel first.`);
    expect(console.info).not.toHaveBeenCalled();
  });
});
