import { Agent, FetchAgent } from "./agent.js";

export class AuthApiClient {
  #baseUrl: string;
  #agent: Agent;

  constructor(option: { baseUrl: string; agent?: Agent }) {
    this.#baseUrl = option.baseUrl;
    this.#agent = option.agent ?? new FetchAgent();
  }

  // https://developers.line.biz/ja/reference/messaging-api/#issue-stateless-channel-access-token
  async fetchStatelessChannelAccessToken({
    channelId,
    channelSecret,
  }: {
    channelId: string;
    channelSecret: string;
  }): Promise<{
    token_type: "Bearer";
    access_token: string;
    expires_in: number;
  }> {
    const res = await this.#agent.request(`${this.#baseUrl}/oauth2/v3/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: `${channelId}`,
        client_secret: channelSecret,
      }),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(`Failed to fetch stateless channel access token: ${res.status} ${res.statusText}
        ${JSON.stringify(body)}`);
    }
    return res.json();
  }
}
