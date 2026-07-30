import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import inquire from "inquirer";

import { makeAddCommand } from "./add.js";
import { getChannel, upsertChannel } from "../stores/channels.js";
import { renewAccessToken } from "../renewAccessToken.js";

vi.mock("inquirer");

vi.mock("../stores/channels.js");
vi.mock("../renewAccessToken.js");

describe("add", () => {
  beforeEach(() => {
    vi.stubGlobal("console", {
      ...console,
      info: vi.fn(),
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("makeAddCommand", () => {
    it("should require channelId", async () => {
      const command = makeAddCommand();

      await expect(command.parseAsync(["_", "add"])).rejects.toThrowError(
        "Channel ID is required.",
      );
      expect(vi.mocked(renewAccessToken)).not.toHaveBeenCalled();
      expect(upsertChannel).not.toHaveBeenCalled();
    });

    it("should renew access token", async () => {
      const now = Date.now();
      vi.setSystemTime(now);

      vi.mocked(inquire.prompt).mockResolvedValue({ channelSecret: "secret" });
      vi.mocked(renewAccessToken).mockResolvedValue({
        secret: "secret",
        accessToken: "access_token",
        expiresIn: 3600,
        issuedAt: now,
        apiBaseUrl: "https://api.line.me",
      });

      const command = makeAddCommand();
      await command.parseAsync(["_", "add", "123"]);

      expect(renewAccessToken).toHaveBeenCalledWith(
        "123",
        "secret",
        now,
        "https://api.line.me",
      );
      expect(console.info).toHaveBeenCalledWith("Channel 123 is now added.");
    });

    it("should use the specified API base URL", async () => {
      const now = Date.now();
      vi.setSystemTime(now);

      vi.mocked(inquire.prompt).mockResolvedValue({ channelSecret: "secret" });
      vi.mocked(renewAccessToken).mockResolvedValue({
        secret: "secret",
        accessToken: "access_token",
        expiresIn: 3600,
        issuedAt: now,
        apiBaseUrl: "https://api.example.com",
      });

      const command = makeAddCommand();
      await command.parseAsync([
        "_",
        "add",
        "123",
        "--api-base-url",
        "https://api.example.com",
      ]);

      expect(renewAccessToken).toHaveBeenCalledWith(
        "123",
        "secret",
        now,
        "https://api.example.com",
      );
    });

    it("should keep the registered API base URL when the option is omitted", async () => {
      const now = Date.now();
      vi.setSystemTime(now);

      vi.mocked(inquire.prompt).mockResolvedValue({ channelSecret: "secret" });
      vi.mocked(getChannel).mockReturnValue({
        secret: "secret",
        accessToken: "access_token",
        expiresIn: 3600,
        issuedAt: now,
        apiBaseUrl: "https://api.example.com",
      });

      const command = makeAddCommand();
      await command.parseAsync(["_", "add", "123"]);

      expect(renewAccessToken).toHaveBeenCalledWith(
        "123",
        "secret",
        now,
        "https://api.example.com",
      );
    });

    it("should throw an error for an invalid API base URL", async () => {
      vi.mocked(inquire.prompt).mockResolvedValue({ channelSecret: "secret" });

      const command = makeAddCommand();
      await expect(
        command.parseAsync(["_", "add", "123", "--api-base-url", "not-a-url"]),
      ).rejects.toThrowError("Invalid API base URL: not-a-url");
      expect(renewAccessToken).not.toHaveBeenCalled();
    });
  });
});
