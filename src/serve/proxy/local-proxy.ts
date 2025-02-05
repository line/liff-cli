import { ProxyInterface } from "./proxy-interface.js";
import https from "node:https";
import httpProxy from "http-proxy";
import fs from "fs";

type LocalProxyConfig = {
  keyPath: string;
  certPath: string;
  port: string;
};

export class LocalProxy implements ProxyInterface {
  private key: string;
  private cert: string;
  private port: string;
  private server?: https.Server;
  constructor(config: LocalProxyConfig) {
    if (!fs.existsSync(config.keyPath)) {
      throw new Error(`Key file not found: ${config.keyPath}`);
    }
    if (!fs.existsSync(config.certPath)) {
      throw new Error(`Cert file not found: ${config.certPath}`);
    }

    this.key = fs.readFileSync(config.keyPath, "utf8");
    this.cert = fs.readFileSync(config.certPath, "utf8");
    this.port = config.port;
  }

  async connect(targetUrl: URL): Promise<URL> {
    const proxy = httpProxy.createProxyServer({});

    const proxyUrl = new URL("https://localhost");
    proxyUrl.port = this.port;
    proxyUrl.pathname = targetUrl.pathname;
    proxyUrl.search = targetUrl.search;

    return new Promise((resolve, reject) => {
      this.server = https
        .createServer({ key: this.key, cert: this.cert }, (req, res) => {
          proxy.web(req, res, {
            target: targetUrl.toString(),
            changeOrigin: true,
            secure: true,
            prependPath: false,
          });
        })
        .listen(this.port)
        .on("listening", () => {
          resolve(proxyUrl);
        })
        .on("error", (e) => {
          reject(e);
        });
    });
  }

  async cleanup(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }
      this.server.close((e) => {
        if (e) reject(e);
        else resolve();
      });
    });
  }
}
