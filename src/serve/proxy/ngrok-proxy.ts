import { URL } from "node:url";
import * as ngrok from "@ngrok/ngrok";
import { ProxyInterface } from "./proxy-interface.js";

export class NgrokProxy implements ProxyInterface {
  private listener: ngrok.Listener | null = null;
  private session: ngrok.Session | null = null;

  constructor() {}

  async connect(targetUrl: URL): Promise<URL> {
    const targetPort = targetUrl.port;
    const targetHost = targetUrl.hostname;

    if (!process.env.NGROK_AUTHTOKEN) {
      console.error(
        "Set your authtoken in the NGROK_AUTHTOKEN environment variable",
      );
    }

    const builder = new ngrok.SessionBuilder();

    // Return value of true indicates that automatic reconnection should be attempted
    builder.handleDisconnection((addr, error) => {
      console.log(`Disconnected from ngrok server ${addr}: ${error}`);
      console.log("Attempting to reconnect...");
      return true;
    });

    this.session = await builder.authtokenFromEnv().connect();
    this.listener = await this.session.httpEndpoint().listen();

    const url = this.listener.url();
    if (!url) {
      throw new Error("ngrok did not provide a URL");
    }

    await this.listener.forward(`${targetHost}:${targetPort}`);

    return new URL(url);
  }

  async cleanup(): Promise<void> {
    if (this.listener) {
      await ngrok.disconnect(this.listener.url());
      this.listener = null;
    }
  }
}
