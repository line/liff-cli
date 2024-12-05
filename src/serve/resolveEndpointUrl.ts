import { URL } from "url";

export const resolveEndpointUrl = ({
  url,
  host,
  port,
}: {
  url?: string;
  host?: string;
  port?: string;
}): URL => {
  if (url) {
    if (host || port) {
      throw new Error(
        `When --url is specified, --host, and --port cannot be specified.`,
      );
    }
    return new URL(url);
  }
  if (host || port) {
    if (!host) {
      throw new Error(
        `When --port is specified, --host must also be specified.`,
      );
    }
    if (!port) {
      throw new Error(
        `When --host is specified, --port must also be specified.`,
      );
    }
    return new URL(`https://${host}:${port}`);
  }
  throw new Error(`Either --url, or both --host and --port must be specified.`);
};

export default resolveEndpointUrl;
