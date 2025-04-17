import { URL } from "node:url";
import * as ngrok from "@ngrok/ngrok";
import { ProxyInterface } from "./proxy-interface.js";

export class NgrokProxy implements ProxyInterface {
  private listener: ngrok.Listener | null = null;
  private keepAliveInterval: NodeJS.Timeout | null = null;

  constructor() {}

  async connect(targetUrl: URL): Promise<URL> {
    try {
      const targetPort = targetUrl.port;
      const targetHost = targetUrl.hostname;

      if (!process.env.NGROK_AUTHTOKEN) {
        console.error(
          "Set your authtoken in the NGROK_AUTHTOKEN environment variable",
        );
      }

      this.listener = await ngrok.forward({
        authtoken_from_env: true,
        addr: `${targetHost}:${targetPort}`,
      });

      const url = this.listener.url();
      if (!url) {
        throw new Error("ngrok did not provide a URL");
      }

      this.setupKeepAlive();

      process.on("SIGINT", async () => {
        await this.cleanup();
        process.exit(0);
      });

      return new URL(url);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to establish ngrok connection: ${String(error)}`);
    }
  }

  private setupKeepAlive(): void {
    this.keepAliveInterval = setInterval(() => {}, 60000);
  }

  async cleanup(): Promise<void> {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    if (this.listener) {
      await ngrok.disconnect(this.listener.url());
      this.listener = null;
    }
  }
}
