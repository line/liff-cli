import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import inquire from "inquirer";

import { initAction } from "./index.js";

vi.mock("../channel/commands/add.js");
vi.mock("../app/commands/create.js");
vi.mock("child_process");

vi.mock("inquirer");

describe("initAction", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should prompt on no parameters given", async () => {
    const promptInputs = {
      channelId: "123",
    };
    vi.mocked(inquire.prompt).mockResolvedValue(promptInputs);

    await initAction({
      name: '',
      viewType: '',
      endpointUrl: '',
    });

    expect(inquire.prompt).toHaveBeenCalled();
    expect(inquire.prompt).toHaveBeenCalledWith([
      {
        type: "input",
        name: "channelId",
        message: "Channel ID?",
      },
      {
        type: "input",
        name: "name",
        message: "App name?",
      },
      {
        type: "list",
        name: "viewType",
        message: "View type?",
        choices: ["compact", "tall", "full"],
      },
      {
        type: "input",
        name: "endpointUrl",
        message: `Endpoint URL? (leave empty for default 'https://localhost:9000')`,
      },
    ]);
  });
});