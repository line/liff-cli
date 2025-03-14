import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getApiBaseUrl, getLiffBaseUrl, setApiBaseUrl, setLiffBaseUrl } from "./baseUrl.js";
import { resolveChannel } from "./resolveChannel.js";
import { getChannel, setChannel } from "./stores/channels.js";

vi.mock("./resolveChannel.js");
vi.mock("./stores/channels.js");

describe("baseUrl", () => {
  const mockChannelId = "123";
  const mockApiBaseUrl = "https://api.example.com";
  const mockLiffBaseUrl = "https://liff.example.com";
  const mockChannel = {
    secret: "secret",
    accessToken: "token",
    expiresIn: 3600,
    issuedAt: 1000,
    baseUrl: {
      api: mockApiBaseUrl,
      liff: mockLiffBaseUrl,
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getApiBaseUrl", () => {
    it("should return the api base URL from channel info", async () => {
      vi.mocked(resolveChannel).mockResolvedValueOnce(mockChannel);

      const result = await getApiBaseUrl(mockChannelId);
      
      expect(resolveChannel).toHaveBeenCalledWith(mockChannelId);
      expect(result).toBe(mockApiBaseUrl);
    });

    it("should use default API base URL if not set in channel", async () => {
      vi.mocked(resolveChannel).mockResolvedValueOnce({
        ...mockChannel,
        baseUrl: {} // No API base URL set
      });

      const result = await getApiBaseUrl(mockChannelId);
      
      expect(result).toBe("https://api.line.me"); // Default from BASE_URL_CONFIG
    });

    it("should throw an error if channel is not found", async () => {
      vi.mocked(resolveChannel).mockResolvedValueOnce(undefined);

      await expect(getApiBaseUrl(mockChannelId)).rejects.toThrow("Channel not found.");
    });
  });

  describe("getLiffBaseUrl", () => {
    it("should return the liff base URL from channel info", async () => {
      vi.mocked(resolveChannel).mockResolvedValueOnce(mockChannel);

      const result = await getLiffBaseUrl(mockChannelId);
      
      expect(resolveChannel).toHaveBeenCalledWith(mockChannelId);
      expect(result).toBe(mockLiffBaseUrl);
    });

    it("should use default LIFF base URL if not set in channel", async () => {
      vi.mocked(resolveChannel).mockResolvedValueOnce({
        ...mockChannel,
        baseUrl: {} // No LIFF base URL set
      });

      const result = await getLiffBaseUrl(mockChannelId);
      
      expect(result).toBe("https://liff.line.me"); // Default from BASE_URL_CONFIG
    });

    it("should throw an error if channel is not found", async () => {
      vi.mocked(resolveChannel).mockResolvedValueOnce(undefined);

      await expect(getLiffBaseUrl(mockChannelId)).rejects.toThrow("Channel not found.");
    });
  });

  describe("setApiBaseUrl", () => {
    it("should update the API base URL of a channel", () => {
      const newApiBaseUrl = "https://new-api.example.com";
      vi.mocked(getChannel).mockReturnValueOnce(mockChannel);

      setApiBaseUrl(mockChannelId, newApiBaseUrl);
      
      expect(getChannel).toHaveBeenCalledWith(mockChannelId);
      expect(setChannel).toHaveBeenCalledWith(mockChannelId, {
        ...mockChannel,
        baseUrl: {
          ...mockChannel.baseUrl,
          api: newApiBaseUrl,
        },
      });
    });

    it("should throw an error if channel is not found", () => {
      vi.mocked(getChannel).mockReturnValueOnce(undefined);

      expect(() => setApiBaseUrl(mockChannelId, "https://api.example.com")).toThrow(
        `Channel ${mockChannelId} is not added yet.`
      );
      expect(setChannel).not.toHaveBeenCalled();
    });

    it("should handle channel without baseUrl property", () => {
      const channelWithoutBaseUrl = {
        secret: "secret",
        accessToken: "token",
        expiresIn: 3600,
        issuedAt: 1000,
      };
      const newApiBaseUrl = "https://new-api.example.com";
      
      vi.mocked(getChannel).mockReturnValueOnce(channelWithoutBaseUrl);

      setApiBaseUrl(mockChannelId, newApiBaseUrl);
      
      expect(setChannel).toHaveBeenCalledWith(mockChannelId, {
        ...channelWithoutBaseUrl,
        baseUrl: {
          api: newApiBaseUrl,
        },
      });
    });
  });

  describe("setLiffBaseUrl", () => {
    it("should update the LIFF base URL of a channel", () => {
      const newLiffBaseUrl = "https://new-liff.example.com";
      vi.mocked(getChannel).mockReturnValueOnce(mockChannel);

      setLiffBaseUrl(mockChannelId, newLiffBaseUrl);
      
      expect(getChannel).toHaveBeenCalledWith(mockChannelId);
      expect(setChannel).toHaveBeenCalledWith(mockChannelId, {
        ...mockChannel,
        baseUrl: {
          ...mockChannel.baseUrl,
          liff: newLiffBaseUrl,
        },
      });
    });

    it("should throw an error if channel is not found", () => {
      vi.mocked(getChannel).mockReturnValueOnce(undefined);

      expect(() => setLiffBaseUrl(mockChannelId, "https://liff.example.com")).toThrow(
        `Channel ${mockChannelId} is not added yet.`
      );
      expect(setChannel).not.toHaveBeenCalled();
    });

    it("should handle channel without baseUrl property", () => {
      const channelWithoutBaseUrl = {
        secret: "secret",
        accessToken: "token",
        expiresIn: 3600,
        issuedAt: 1000,
      };
      const newLiffBaseUrl = "https://new-liff.example.com";
      
      vi.mocked(getChannel).mockReturnValueOnce(channelWithoutBaseUrl);

      setLiffBaseUrl(mockChannelId, newLiffBaseUrl);
      
      expect(setChannel).toHaveBeenCalledWith(mockChannelId, {
        ...channelWithoutBaseUrl,
        baseUrl: {
          liff: newLiffBaseUrl,
        },
      });
    });
  });
});