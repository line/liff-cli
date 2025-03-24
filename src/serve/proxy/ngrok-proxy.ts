import { exec } from "node:child_process";

import { ProxyInterface } from "./proxy-interface.js";

/**
 * Function to extract URL from ngrok v3 JSON logs
 * @param jsonLog ngrok JSON log
 * @returns extracted URL, or null if not found
 */
function extractUrlFromJson(jsonLog: string): string | null {
  console.log("Extracting URL from JSON log:", jsonLog);
  try {
    // Parse each line as a separate JSON object
    const lines = jsonLog.trim().split("\n");

    for (const line of lines) {
      try {
        const logEntry = JSON.parse(line);
        // console.log("Parsed log entry:", JSON.stringify(logEntry, null, 2));

        // Look for log entries containing URL
        // Check multiple possible structures based on ngrok v3 documentation
        if (logEntry.url) {
          return logEntry.url;
        }

        if (
          logEntry.obj === "tunnels" &&
          logEntry.action === "started" &&
          logEntry.url
        ) {
          return logEntry.url;
        }

        if (
          logEntry.msg &&
          logEntry.msg.includes("started tunnel") &&
          logEntry.addr
        ) {
          return logEntry.addr;
        }

        if (
          logEntry.urls &&
          Array.isArray(logEntry.urls) &&
          logEntry.urls.length > 0
        ) {
          return logEntry.urls[0];
        }
      } catch (lineError) {
        // Skip invalid JSON lines
        console.error("Error parsing JSON line:", lineError);
      }
    }

    return null;
  } catch (error) {
    console.error("Error parsing JSON log:", error);
    return null;
  }
}

type NgrokProxyConfig = {
  ngrokCommand: string;
};

/**
 * Proxy implementation using ngrok v3
 * Uses JSON format logs to obtain URL
 * @experimental
 */
export class NgrokProxy implements ProxyInterface {
  private childProcess?: ReturnType<typeof exec>;

  constructor(private config: NgrokProxyConfig) {}

  async connect(targetUrl: URL): Promise<URL> {
    const targetPort = targetUrl.port;

    // Build ngrok v3 command
    // Add log_format=json and log=stdout options
    const command = `${this.config.ngrokCommand} http ${targetPort} --log=stdout --log-format=json`;

    console.log("Executing ngrok command:", command);

    return new Promise<URL>((resolve, reject) => {
      // Set timeout
      const timeout = setTimeout(() => {
        console.log("Timeout reached. Buffer content:", stdoutBuffer);
        reject(new Error("Could not find ngrok URL from the output."));
      }, 10000);

      // Execute ngrok command
      this.childProcess = exec(command);

      let stdoutBuffer = "";

      // Extract URL from stdout
      this.childProcess.stdout?.on("data", (data) => {
        const dataStr = data.toString();
        console.log("Received ngrok output:", dataStr);

        stdoutBuffer += dataStr;
        const url = extractUrlFromJson(stdoutBuffer);

        if (url) {
          clearTimeout(timeout);
          resolve(new URL(url));
        }
      });

      // Error handling
      this.childProcess.stderr?.on("data", (data) => {
        console.error(`ngrok error: ${data}`);
      });

      // Process error handling
      this.childProcess.on("error", (error) => {
        clearTimeout(timeout);
        reject(new Error(`ngrok process error: ${error.message}`));
      });

      // Process exit handling
      this.childProcess.on("exit", (code) => {
        if (code !== 0) {
          clearTimeout(timeout);
          reject(new Error(`ngrok process exited with code ${code}`));
        }
      });
    });
  }

  async cleanup(): Promise<void> {
    // Terminate process if it exists
    if (this.childProcess) {
      // Send SIGTERM signal
      this.childProcess.kill();
      this.childProcess = undefined;
    }
  }
}
