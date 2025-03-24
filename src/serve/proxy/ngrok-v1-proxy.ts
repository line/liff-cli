import { setTimeout } from "node:timers";
import os from "node:os";

import stripAnsi from "strip-ansi";
import type pty from "node-pty";

import { ProxyInterface } from "./proxy-interface.js";

function extractUrl(input: string): string | null {
  const urlRegex = /(https:\/\/[^\s]+)\s+->/;
  const match = input.match(urlRegex);
  return match ? match[1] : null;
}

type NgrokV1ProxyConfig = {
  ngrokCommand: string;
};

async function tryImportNodePty(): Promise<typeof pty> {
  try {
    return (await import("node-pty")).default;
  } catch (error) {
    throw new Error(`Failed to import 'node-pty'. Please install it manually.`);
  }
}

/**
 * @experimental
 */
export class NgrokV1Proxy implements ProxyInterface {
  private ptyProcess?: pty.IPty;

  constructor(private config: NgrokV1ProxyConfig) {}

  async connect(targetUrl: URL): Promise<URL> {
    const targetPort = targetUrl.port;

    const command = `${this.config.ngrokCommand} ${targetPort}`;

    const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
    const pty = await tryImportNodePty();
    this.ptyProcess = pty.spawn(shell, [], {
      name: "xterm-color",
      cols: 200,
      rows: 30,
      cwd: process.env.HOME,
      env: process.env,
    });

    const promise = new Promise<URL>((resolve, reject) => {
      this.ptyProcess?.onData((data) => {
        const url = extractUrl(stripAnsi(data));
        if (url) {
          resolve(new URL(url));
        }
      });

      setTimeout(() => {
        reject(new Error("Not found ngrok URL from the output."));
      }, 10000);
    });

    this.ptyProcess?.write(command + "\r");

    return promise;
  }

  async cleanup(): Promise<void> {
    this.ptyProcess?.kill();
  }
}
