import { URL } from "node:url";
import * as ngrok from "@ngrok/ngrok";
import { ProxyInterface } from "./proxy-interface.js";

export class NgrokProxy implements ProxyInterface {
  private session: ngrok.Session | null = null;
  private listener: ngrok.Listener | null = null;

  constructor() {}

  async connect(targetUrl: URL): Promise<URL> {
    try {
      const targetPort = parseInt(targetUrl.port, 10);

      if (isNaN(targetPort)) {
        throw new Error("Invalid port number");
      }

      const targetHost = targetUrl.hostname;

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
