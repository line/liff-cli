import { exec } from "node:child_process";

import { ProxyInterface } from "./proxy-interface.js";

function isNgrokUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);

    return (
      urlObj.hostname.endsWith("ngrok.io") ||
      urlObj.hostname.endsWith("ngrok-free.app") ||
      /\.ngrok\.dev$/.test(urlObj.hostname) ||
      /\.ngrok\.app$/.test(urlObj.hostname)
    );
  } catch {
    return false;
  }
}

function extractUrlFromJson(jsonLog: string): string | null {
  try {
    const lines = jsonLog.trim().split("\n");

    for (const line of lines) {
      try {
        const logEntry = JSON.parse(line);

        if (logEntry.url && isNgrokUrl(logEntry.url)) {
          return logEntry.url;
        }
      } catch {
        continue;
      }
    }
    return null;
  } catch {
    return null;
  }
}

type NgrokProxyConfig = {
  ngrokCommand: string;
};

/**
 * @experimental
 */
export class NgrokProxy implements ProxyInterface {
  private childProcess?: ReturnType<typeof exec>;

  constructor(private config: NgrokProxyConfig) {}

  async connect(targetUrl: URL): Promise<URL> {
    const targetPort = targetUrl.port;

    const command = `${this.config.ngrokCommand} http ${targetPort} --log=stdout --log-format=json`;

    return new Promise<URL>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Could not find ngrok URL from the output."));
      }, 10000);

      this.childProcess = exec(command);

      let stdoutBuffer = "";

      this.childProcess.stdout?.on("data", (data) => {
        const dataStr = data.toString();

        stdoutBuffer += dataStr;
        const url = extractUrlFromJson(stdoutBuffer);

        if (url) {
          clearTimeout(timeout);
          resolve(new URL(url));
        }
      });

      this.childProcess.stderr?.on("data", (data) => {
        console.error(`ngrok error: ${data}`);
      });

      this.childProcess.on("error", (error) => {
        clearTimeout(timeout);
        reject(new Error(`ngrok process error: ${error.message}`));
      });

      this.childProcess.on("exit", (code) => {
        if (code !== 0) {
          clearTimeout(timeout);
          reject(new Error(`ngrok process exited with code ${code}`));
        }
      });
    });
  }

  async cleanup(): Promise<void> {
    if (this.childProcess) {
      this.childProcess.kill();
      this.childProcess = undefined;
    }
  }
}
