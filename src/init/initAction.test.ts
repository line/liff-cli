import { describe, expect, it, vi, afterEach } from "vitest";
import child_process from "child_process";
import { initAction } from "./initAction.js";
import { addAction as addChannelAction } from "../channel/commands/add.js";
import { createLiffApp } from "../app/commands/create.js";
import { resolveChannel } from "../channel/resolveChannel.js";
import { makeOptions } from "./commands/index.js";

vi.mock("../channel/commands/add.js");
vi.mock("../channel/resolveChannel.js");
vi.mock("../app/commands/create.js");
vi.mock("./commands/index.js");
vi.mock("child_process");
vi.mock("inquirer");

const TEST_OPTIONS = {
  channelId: "123",
  name: "My App",
  viewType: "compact",
  endpointUrl: "https://example.com",
};

describe("initAction", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("should call execSync with correct command", async () => {
    vi.mocked(child_process.execSync).mockReturnValue(Buffer.from(""));
    vi.mocked(makeOptions).mockResolvedValue(TEST_OPTIONS);
    const DUMMY_LIFF_ID = "hogehoge123";
    vi.mocked(createLiffApp).mockResolvedValue(DUMMY_LIFF_ID);

    await initAction(TEST_OPTIONS);

    expect(child_process.execSync).toHaveBeenCalledWith(
      `npx @line/create-liff-app "${TEST_OPTIONS.name}" -l ${DUMMY_LIFF_ID}`,
      { stdio: "inherit" },
    );
  });

  it("should add channel if not registered", async () => {
    vi.mocked(createLiffApp).mockResolvedValue("123");
    vi.mocked(resolveChannel).mockResolvedValue(undefined);
    vi.mocked(makeOptions).mockResolvedValue(TEST_OPTIONS);

    await initAction({});

    expect(resolveChannel).toBeCalled();
    expect(addChannelAction).toHaveBeenCalledWith("123");
  });

  it("should not add channel if already registered", async () => {
    vi.mocked(createLiffApp).mockResolvedValue("123");
    vi.mocked(resolveChannel).mockResolvedValue({
      secret: "secret",
      accessToken: "accessToken",
      expiresIn: 1000,
      issuedAt: 2000,
    });
    vi.mocked(makeOptions).mockResolvedValue(TEST_OPTIONS);

    await initAction({});

    expect(resolveChannel).toBeCalled();
    expect(addChannelAction).not.toBeCalled();
  });
});
