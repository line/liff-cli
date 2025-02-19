import { describe, expect, it, vi } from "vitest";
import child_process from "child_process";
import { initAction } from "./initAction.js";
import { createLiffApp } from "../app/commands/create.js";

vi.mock("../channel/commands/add.js");
vi.mock("../app/commands/create.js");
vi.mock("child_process");
vi.mock("inquirer");

const TEST_OPTIONS = {
  channelId: "123",
  name: "My App",
  viewType: "compact",
  endpointUrl: "https://example.com",
};

describe("initAction", () => {
  it("should call execSync with correct command", async () => {
    vi.mocked(child_process.execSync).mockReturnValue(Buffer.from(""));

    const DUMMY_LIFF_ID = "hogehoge123";
    vi.mocked(createLiffApp).mockResolvedValue(DUMMY_LIFF_ID);

    await initAction(TEST_OPTIONS);

    expect(child_process.execSync).toHaveBeenCalledWith(
      `npx @line/create-liff-app "${TEST_OPTIONS.name}" -l ${DUMMY_LIFF_ID}`,
      { stdio: "inherit" },
    );
  });
});
