import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterEach,
  MockInstance,
} from "vitest";
import { scaffoldAction } from "./scaffoldAction.js";
import child_process from "child_process";

vi.mock("child_process");

describe("scaffoldAction", () => {
  let mockConsoleInfo: MockInstance<
    [message?: unknown, ...optionalParams: unknown[]],
    void
  >;

  beforeEach(() => {
    mockConsoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.mocked(child_process.execSync).mockReturnValue(Buffer.from(""));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call execSync with correct command for basic app", async () => {
    const options = {
      name: "test-app",
    };

    await scaffoldAction(options);

    expect(child_process.execSync).toHaveBeenCalledWith(
      `npx @line/create-liff-app "${options.name}"`,
      { stdio: "inherit" },
    );

    expect(mockConsoleInfo).toHaveBeenCalledWith(
      expect.stringContaining(
        `Creating new LIFF app template: ${options.name}`,
      ),
    );
  });

  it("should include liffId when provided", async () => {
    const options = {
      name: "test-app",
      liffId: "1234-abcd",
    };

    await scaffoldAction(options);

    expect(child_process.execSync).toHaveBeenCalledWith(
      `npx @line/create-liff-app "${options.name}" -l ${options.liffId}`,
      { stdio: "inherit" },
    );
  });

  it("should throw an error when execSync fails", async () => {
    const error = new Error("Command failed");
    vi.mocked(child_process.execSync).mockImplementation(() => {
      throw error;
    });

    const options = {
      name: "test-app",
    };

    await expect(scaffoldAction(options)).rejects.toThrow(error);
  });
});
