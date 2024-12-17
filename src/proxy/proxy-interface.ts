import { URL } from "node:url";
export interface ProxyInterface {
  connect(targetUrl: URL): Promise<URL>;
  cleanup(): Promise<void>;
}
