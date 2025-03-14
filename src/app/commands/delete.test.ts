import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  MockInstance,
} from "vitest";
import inquire from "inquirer";

import { LiffApiClient } from "../../api/liff.js";
import { resolveChannel } from "../../channel/resolveChannel.js";
import { makeDeleteCommand } from "./delete.js";
import { getApiBaseUrl } from "../../channel/baseUrl.js";

vi.mock("inquirer");

vi.mock("../../api/liff.js", () => {
  const fn = vi.fn();
  return {
    LiffApiClient: vi.fn(() => ({
      deleteApp: fn,
    })),
  };
});
vi.mock("../../channel/resolveChannel.js");
vi.mock("../../channel/baseUrl.js");

describe("makeDeleteCommand", () => {
  let mockConsoleInfo: MockInstance<
    [message?: unknown, ...optionalParams: unknown[]],
    void
  >;
  let mockDeleteApp: LiffApiClient["deleteApp"];

  beforeEach(() => {
    mockConsoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});
    const liffApiClientInstance = new LiffApiClient({ baseUrl: "", token: "" });
    mockDeleteApp = liffApiClientInstance.deleteApp;
  });

  afterEach(() => {
    mockConsoleInfo.mockRestore();
    vi.restoreAllMocks();
  });

  it("should delete a LIFF app successfully", async () => {
    vi.mocked(getApiBaseUrl).mockResolvedValueOnce("https://api.line.me");
    vi.mocked(resolveChannel).mockResolvedValueOnce({
      accessToken: "token",
      expiresIn: 3600,
      secret: "secret",
      issuedAt: 1000,
    });
    vi.mocked(inquire.prompt).mockResolvedValue({ confirmDelete: true });

    const command = makeDeleteCommand();
    await command.parseAsync([
      "_",
      "delete",
      "--liff-id",
      "123-xxx",
      "--channel-id",
      "123",
    ]);

    expect(resolveChannel).toHaveBeenCalledWith("123");
    expect(mockDeleteApp).toHaveBeenCalledWith("123-xxx");
    expect(mockConsoleInfo).toHaveBeenCalledWith("Deleting LIFF app...");
    expect(mockConsoleInfo).toHaveBeenCalledWith(
      "Successfully deleted LIFF app: 123-xxx",
    );
  });

  it("should throw an error if access token is not found", async () => {
    vi.mocked(resolveChannel).mockResolvedValueOnce(undefined);
    const command = makeDeleteCommand();

    await expect(
      command.parseAsync([
        "_",
        "delete",
        "--liff-id",
        "123-xxx",
        "--channel-id",
        "123",
      ]),
    ).rejects.toThrow(`Access token not found.
      Please provide a valid channel ID or set the current channel first.`);
    expect(resolveChannel).toHaveBeenCalledWith("123");
    expect(mockDeleteApp).not.toHaveBeenCalled();
  });

  it("should handle missing required options", async () => {
    const command = makeDeleteCommand();

    await expect(command.parseAsync(["_", "delete"])).rejects.toThrow(
      'process.exit unexpectedly called with "1"',
    );
    expect(resolveChannel).not.toHaveBeenCalled();
    expect(mockDeleteApp).not.toHaveBeenCalled();
  });

  it("should not delete a LIFF app if user cancels the deletio", async () => {
    vi.mocked(resolveChannel).mockResolvedValueOnce({
      accessToken: "token",
      expiresIn: 3600,
      secret: "secret",
      issuedAt: 1000,
    });
    vi.mocked(inquire.prompt).mockResolvedValue({ confirmDelete: false });

    const command = makeDeleteCommand();
    await command.parseAsync([
      "_",
      "delete",
      "--liff-id",
      "123-xxx",
      "--channel-id",
      "123",
    ]);

    expect(mockDeleteApp).not.toHaveBeenCalled();
  });
});
