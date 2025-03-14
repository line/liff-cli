import { it, expect, describe } from "vitest";
import { http, HttpResponse } from "msw";

import { server } from "../mock.js";
import { LiffApiClient } from "./liff.js";

const baseUrl = "https://localhost:3000";
const token = "token";

describe("fetchApps", () => {
  it("should return LIFF app list", async () => {
    server.use(
      http.get(`${baseUrl}/liff/v1/apps`, () => {
        return HttpResponse.json(
          { apps: [{ liffId: "liffId" }] },
          { status: 200 },
        );
      }),
    );

    const client = new LiffApiClient({
      baseUrl,
      token,
    });
    const response = await client.fetchApps();
    expect("apps" in response).toBe(true);
    expect(response.apps.length).toBe(1);
    expect(response.apps[0].liffId).toBe("liffId");
  });

  it("should throw an error when the request fails", async () => {
    server.use(
      http.get(`${baseUrl}/liff/v1/apps`, () => {
        return HttpResponse.json(
          {
            message: "no LIFF app found for channel channelId.",
          },
          {
            status: 404,
          },
        );
      }),
    );

    const client = new LiffApiClient({
      baseUrl,
      token,
    });
    await expect(client.fetchApps()).rejects.toThrow(
      `
Failed to fetch LIFF apps.
Code: 404
Message: no LIFF app found for channel channelId.
      `,
    );
  });
});

describe("addApp", () => {
  it("should return the id of the LIFF app created", async () => {
    server.use(
      http.post(`${baseUrl}/liff/v1/apps`, async () => {
        return HttpResponse.json({ liffId: "liffId" }, { status: 201 });
      }),
    );

    const client = new LiffApiClient({
      baseUrl,
      token,
    });
    const response = await client.addApp({
      view: { type: "full", url: "https://example.com" },
    });
    expect(response.liffId).toBe("liffId");
  });

  it("should throw an error when the request fails", async () => {
    server.use(
      http.post(`${baseUrl}/liff/v1/apps`, async () => {
        return HttpResponse.json(
          {
            message: "Invali value",
          },
          {
            status: 400,
          },
        );
      }),
    );

    const client = new LiffApiClient({
      baseUrl,
      token,
    });
    await expect(
      client.addApp({ view: { type: "full", url: "https://example.com" } }),
    ).rejects.toThrow(`
Failed to add LIFF app.
Code: 400
Message: Invali value
      `);
  });
});

describe("updateApp", () => {
  it("should return nothing", async () => {
    server.use(
      http.put(`${baseUrl}/liff/v1/apps/liffId`, async () => {
        return HttpResponse.json(undefined, { status: 200 });
      }),
    );

    const client = new LiffApiClient({
      baseUrl,
      token,
    });
    const response = await client.updateApp("liffId", {
      view: { type: "full", url: "https://example.com" },
    });
    expect(response).toBe(undefined);
  });

  it("should throw an error when the request fails", async () => {
    server.use(
      http.put(`${baseUrl}/liff/v1/apps/liffId`, async () => {
        return HttpResponse.json(
          {
            message: "Invali value",
          },
          {
            status: 400,
          },
        );
      }),
    );

    const client = new LiffApiClient({
      baseUrl,
      token,
    });
    await expect(
      client.updateApp("liffId", {
        view: { type: "full", url: "https://example.com" },
      }),
    ).rejects.toThrow(`
Failed to update LIFF app.
Code: 400
Message: Invali value
`);
  });
});

describe("deleteApp", () => {
  it("should return nothing", async () => {
    server.use(
      http.delete(`${baseUrl}/liff/v1/apps/liffId`, () => {
        return HttpResponse.json(undefined, { status: 200 });
      }),
    );

    const client = new LiffApiClient({
      baseUrl,
      token,
    });
    const response = await client.deleteApp("liffId");
    expect(response).toBe(undefined);
  });

  it("should throw an error when the request fails", async () => {
    server.use(
      http.delete(`${baseUrl}/liff/v1/apps/liffId`, () => {
        return HttpResponse.json(
          {
            message: "Not found",
          },
          {
            status: 400,
            statusText: "Bad Request",
          },
        );
      }),
    );

    const client = new LiffApiClient({
      baseUrl,
      token,
    });
    await expect(client.deleteApp("liffId")).rejects.toThrow(`
Failed to delete LIFF app.
Code: 400
Message: Not found
`);
  });
});
