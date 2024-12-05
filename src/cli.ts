import { setupCLI } from "./setup.js";
import { Command } from "commander";

const program = new Command();

const cli = setupCLI(program);
cli.run();
