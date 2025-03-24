import { ProxyInterface } from "./proxy-interface.js";

/**
 * Dummy proxy implementation that does nothing
 * Used when a proxy is required by the interface but not needed functionally
 */
export class DummyProxy implements ProxyInterface {
  async connect(targetUrl: URL): Promise<URL> {
    // Return the same URL without modification
    return targetUrl;
  }

  async cleanup(): Promise<void> {
    // Nothing to clean up
  }
}
