import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Conf from "conf";

import {
  upsertChannel,
  getChannel,
  setCurrentChannel,
  getCurrentChannelId,
} from "./channels.js";

vi.mock("conf", () => {
  const mockConf = {
    get: vi.fn(),
    set: vi.fn(),
  };
  return {
    default: vi.fn(() => mockConf),
  };
});

describe("channels", () => {
  let mockConf: Conf;

  beforeEach(() => {
    mockConf = new Conf();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("upsertChannel", () => {
    it("should insert a new channel", () => {
      const channelId = "123";
      const channelSecret = "secret";
      const accessToken = "access_token";
      const expiresIn = 3600;
      const issuedAt = 1000;

      vi.mocked(mockConf.get).mockReturnValueOnce({});

      const channel = upsertChannel(
        channelId,
        channelSecret,
        accessToken,
        expiresIn,
        issuedAt,
      );

      expect(mockConf.set).toHaveBeenCalledWith("channels", {
        [channelId]: {
          secret: channelSecret,
          accessToken,
          expiresIn,
          issuedAt,
        },
      });
      expect(channel).toStrictEqual({
        secret: channelSecret,
        accessToken,
        expiresIn,
        issuedAt,
      });
    });

    it("should update the channel", () => {
      const channelId = "123";
      const channelSecret = "secret";
      const accessToken = "access_token";
      const expiresIn = 3600;
      const issuedAt = 1000;

      vi.mocked(mockConf.get).mockReturnValueOnce({
        "123": {
          secret: channelSecret,
          accessToken: "old",
          expiresIn: 10,
          issuedAt: 900,
        },
      });

      const channel = upsertChannel(
        channelId,
        channelSecret,
        accessToken,
        expiresIn,
        issuedAt,
      );

      expect(mockConf.set).toHaveBeenCalledWith("channels", {
        [channelId]: {
          secret: channelSecret,
          accessToken,
          expiresIn,
          issuedAt,
        },
      });
      expect(channel).toStrictEqual({
        secret: channelSecret,
        accessToken,
        expiresIn,
        issuedAt,
      });
    });
  });

  describe("getChannel", () => {
    it("should get a channel", () => {
      const channelId = "123";
      const channelData = {
        accessToken: "access_token",
        expiresIn: 3600,
        issuedAt: 1000,
      };

      vi.mocked(mockConf.get).mockReturnValueOnce({
        [channelId]: channelData,
      });

      const result = getChannel(channelId);
      expect(result).toStrictEqual(channelData);
    });

    it("should return undefined if there are no channels", () => {
      const channelId = "123";

      vi.mocked(mockConf.get).mockReturnValueOnce(undefined);

      const result = getChannel(channelId);
      expect(result).toBe(undefined);
    });

    it("should return undefined if the specified channel does not exist", () => {
      const channelId = "123";

      vi.mocked(mockConf.get).mockReturnValueOnce({
        999: {
          accessToken: "access_token",
          expiresIn: 3600,
          issuedAt: 1000,
        },
      });

      const result = getChannel(channelId);
      expect(result).toBe(undefined);
    });
  });

  describe("setCurrentChannel", () => {
    it("should set the current channel", () => {
      const channelId = "123";

      setCurrentChannel(channelId);
      expect(mockConf.set).toHaveBeenCalledWith("currentChannelId", channelId);
    });
  });

  describe("getCurrentChannelId", () => {
    it("should get the current channel ID", () => {
      vi.mocked(mockConf.get).mockReturnValueOnce(123);

      const result = getCurrentChannelId();
      expect(result).toBe(123);
    });

    it("should return undefined if there is no current channel ID", () => {
      vi.mocked(mockConf.get).mockReturnValueOnce(undefined);

      const result = getCurrentChannelId();
      expect(result).toBe(undefined);
    });
  });
});
