import { URL } from "node:url";
import * as ngrok from "@ngrok/ngrok";
import { ProxyInterface } from "./proxy-interface.js";

export class NgrokProxy implements ProxyInterface {
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
    const listener = await this.session.httpEndpoint().listen();

    const url = listener.url();
    if (!url) {
      throw new Error("ngrok did not provide a URL");
    }

    listener.forward(`${targetHost}:${targetPort}`);

    return new URL(url);
  }

  async cleanup(): Promise<void> {
    if (this.session) {
      await this.session.close();
      this.session = null;
    }
  }
}
