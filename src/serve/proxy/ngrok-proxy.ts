import { URL } from "node:url";
import * as ngrok from "@ngrok/ngrok";
import fs from "fs";
import path from "path";
import os from "node:os";
import { ProxyInterface } from "./proxy-interface.js";

export class NgrokProxy implements ProxyInterface {
  private session: ngrok.Session | null = null;
  private listener: ngrok.Listener | null = null;

  constructor() {}

  async connect(targetUrl: URL): Promise<URL> {
    try {
      const targetPort = targetUrl.port;
      const targetHost = targetUrl.hostname;

      const authToken = this.readTokenFromNgrokConfig();

      if (!authToken) {
        throw new Error(
          "Usage of ngrok requires a verified account and authtoken.\n" +
            "Sign up for an account: https://dashboard.ngrok.com/signup\n" +
            "Install your authtoken: https://dashboard.ngrok.com/get-started/your-authtoken\n\n" +
            `Once you have your authtoken, add it to: ${this.getNgrokConfigPath()}\n` +
            "Format: authtoken: your_token_here",
        );
      }

      ngrok.authtoken(authToken);

      const builder = new ngrok.SessionBuilder();

      builder.handleDisconnection((addr, error) => {
        console.log(`Disconnected from ngrok server ${addr}: ${error}`);
        console.log("Attempting to reconnect...");
        return true;
      });

      this.session = await builder.connect();
      this.listener = await this.session.httpEndpoint().listen();

      const url = this.listener.url();
      if (!url) {
        throw new Error("ngrok did not provide a URL");
      }

      this.listener.forward(`${targetHost}:${targetPort}`);

      return new URL(url);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to establish ngrok connection: ${String(error)}`);
    }
  }

  private getNgrokConfigPath(): string {
    const platform = os.platform();

    if (platform === "win32") {
      return path.join(os.homedir(), "AppData", "Local", "ngrok", "ngrok.yml");
    } else if (platform === "darwin") {
      return path.join(
        os.homedir(),
        "Library",
        "Application Support",
        "ngrok",
        "ngrok.yml",
      );
    } else {
      return path.join(os.homedir(), ".config", "ngrok", "ngrok.yml");
    }
  }

  private readTokenFromNgrokConfig(): string | null {
    try {
      const configPath = this.getNgrokConfigPath();

      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, "utf8");
        const match = content.match(/authtoken:\s*["']?([\w\d_-]+)["']?/);
        if (match && match[1]) {
          return match[1].trim();
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  async cleanup(): Promise<void> {
    if (this.listener) {
      await this.listener.close();
      this.listener = null;
    }

    if (this.session) {
      await this.session.close();
      this.session = null;
    }
  }
}
