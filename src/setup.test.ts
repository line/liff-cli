import { Command } from "commander";
import { vi, it, describe, expect } from "vitest";
import { setupCLI } from "./setup.js";

describe("setupCLI", () => {
  it("should return the run func†ion to start the CLI program", () => {
    const writeMock = vi.fn();
    const program = new Command()
      // Note: This is required to avoid the process exiting.
      // https://github.com/tj/commander.js/blob/master/Readme.md#override-exit-and-output-handling
      // https://github.com/tj/commander.js/blob/4ef19faac1564743d8c7e3ce89ef8d190e1551b4/tests/options.version.test.js#L3
      .exitOverride()
      .configureOutput({ writeOut: writeMock });

    const { run } = setupCLI(program);

    expect(() => {
      run("node ./index.js -h".split(" "));
    }).toThrow(); // Note: commander.js throws an error when -h is passed.
    expect(writeMock).toHaveBeenCalledWith(`Usage: index [options] [command]

Options:
  -h, --help       display help for command

Commands:
  channel          Manage LIFF channels
  app              Manage LIFF apps
  init [options]   Initialize new LIFF app
  serve [options]  Manage HTTPS dev server
  help [command]   display help for command
`);
  });

  it("should install channel commands", () => {
    const writeMock = vi.fn();
    const program = new Command()
      .exitOverride()
      .configureOutput({ writeOut: writeMock });

    setupCLI(program);

    expect(() => {
      program.parse("node ./index.js channel -h".split(" "));
    }).toThrow();
    expect(writeMock)
      .toHaveBeenCalledWith(`Usage: index channel [options] [command]

Manage LIFF channels

Options:
  -h, --help       display help for command

Commands:
  add [channelId]  Register a LIFF channel that you want to manage
  use [channelId]  Set the default LIFF channel to use
  help [command]   display help for command
`);
  });

  it("should install app commands", () => {
    const writeMock = vi.fn();
    const program = new Command()
      .exitOverride()
      .configureOutput({ writeOut: writeMock });

    setupCLI(program);

    expect(() => {
      program.parse("node ./index.js app -h".split(" "));
    }).toThrow();
    expect(writeMock).toHaveBeenCalledWith(`Usage: index app [options] [command]

Manage LIFF apps

Options:
  -h, --help        display help for command

Commands:
  create [options]  Create a new LIFF app
  list [options]    List all LIFF apps
  update [options]  Update the configuration of the existing LIFF app
  delete [options]  Delete a LIFF app
  help [command]    display help for command
`);
  });

  it("should serve commands", () => {
    const writeMock = vi.fn();
    const program = new Command()
      .exitOverride()
      .configureOutput({ writeOut: writeMock });

    setupCLI(program);

    expect(() => {
      program.parse("node ./index.js serve -h".split(" "));
    }).toThrow();
    expect(writeMock).toHaveBeenCalledWith(`Usage: index serve [options]

Manage HTTPS dev server

Options:
  -l, --liff-id <liffId>               The LIFF id that the user wants to
                                       update.
  -u, --url <url>                      The local URL of the LIFF app.
  --host <host>                        The host of the application server.
  --port <port>                        The port number of the application
                                       server.
  -i, --inspect                        The flag indicates LIFF app starts on
                                       debug mode. (default: false)
  --local-proxy-port <localProxyPort>  The port number of the application proxy
                                       server to listen on when running the
                                       CLI. (default: "9000")
  -h, --help                           display help for command
`);
  });
});
