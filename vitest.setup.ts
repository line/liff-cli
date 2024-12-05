import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./src/mock";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
