import { Agent, FetchAgent } from "./agent.js";

export class LiffApiClient {
  #token: string;
  #baseUrl: string;
  #agent: Agent;

  constructor(option: { token: string; baseUrl: string; agent?: Agent }) {
    this.#token = option.token;
    this.#baseUrl = option.baseUrl;
    this.#agent = option.agent ?? new FetchAgent();
  }

  // https://developers.line.biz/ja/reference/liff-server/#get-all-liff-apps
  async fetchApps(): Promise<{
    // TODO: Not exhaustive yet
    apps: {
      liffId: string;
      view: {
        type: string;
        url: string;
      };
      description: string;
    }[];
  }> {
    const res = await this.#agent.request(`${this.#baseUrl}/liff/v1/apps`, {
      headers: {
        Authorization: `Bearer ${this.#token}`,
      },
    });
    if (!res.ok) {
      throw new Error(
        `Failed to fetch LIFF apps: ${res.status} ${res.statusText}`,
      );
    }
    return res.json();
  }

  // https://developers.line.biz/ja/reference/liff-server/#add-liff-app
  async addApp(request: {
    view: { type: string; url: string };
    description?: string;
  }): Promise<{ liffId: string }> {
    const res = await this.#agent.request(`${this.#baseUrl}/liff/v1/apps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.#token}`,
      },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      throw new Error(
        `Failed to add LIFF app: ${res.status} ${res.statusText}`,
      );
    }
    return res.json();
  }

  // https://developers.line.biz/ja/reference/liff-server/#update-liff-app
  async updateApp(
    liffId: string,
    request: { view?: { type?: string; url?: string }; description?: string },
  ): Promise<void> {
    const res = await this.#agent.request(
      `${this.#baseUrl}/liff/v1/apps/${liffId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.#token}`,
        },
        body: JSON.stringify(request),
      },
    );
    if (!res.ok) {
      throw new Error(
        `Failed to update LIFF app: ${res.status} ${res.statusText}`,
      );
    }
  }

  // https://developers.line.biz/ja/reference/liff-server/#delete-liff-app
  async deleteApp(liffId: string): Promise<void> {
    const res = await this.#agent.request(
      `${this.#baseUrl}/liff/v1/apps/${liffId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.#token}`,
        },
      },
    );
    if (!res.ok) {
      throw new Error(
        `Failed to delete LIFF app: ${res.status} ${res.statusText}`,
      );
    }
  }
}
