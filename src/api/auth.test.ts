import { it, expect, describe } from "vitest";
import { http, HttpResponse } from "msw";

import { server } from "../mock.js";
import { AuthApiClient } from "./auth.js";

const baseUrl = "https://localhost:3000";

describe("fetchStatelessChannelAccessToken", () => {
  it("should return an access token and extra data", async () => {
    server.use(
      http.post(`${baseUrl}/oauth2/v3/token`, async () => {
        return HttpResponse.json(
          {
            access_token: "accessToken",
            expires_in: 1000,
            token_type: "Bearer",
          },
          {
            status: 201,
          },
        );
      }),
    );

    const client = new AuthApiClient({
      baseUrl,
    });
    const response = await client.fetchStatelessChannelAccessToken({
      channelId: "1234567890",
      channelSecret: "channelSecret",
    });
    expect(response.access_token).toBe("accessToken");
    expect(response.expires_in).toBe(1000);
    expect(response.token_type).toBe("Bearer");
  });

  it("should throw an error when the request fails", async () => {
    server.use(
      http.post(`${baseUrl}/oauth2/v3/token`, async () => {
        return HttpResponse.json(
          {
            error: "invalid_request",
            error_description: "Invalid request",
          },
          {
            status: 400,
          },
        );
      }),
    );

    const client = new AuthApiClient({
      baseUrl,
    });
    await expect(
      client.fetchStatelessChannelAccessToken({
        channelId: "1234567890",
        channelSecret: "channelSecret",
      }),
    ).rejects.toThrow(
      "Failed to fetch stateless channel access token: 400 Bad Request",
    );
  });
});
