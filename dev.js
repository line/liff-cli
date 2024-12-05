import * as child_process from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(child_process.exec);

console.log("Building project...");
const { stderr, stdout } = await exec("npm run build");

if (stderr) {
  console.error("An error occurred while building the project");
  console.error(stderr);
  process.exit(1);
}

console.log(stdout);
console.log("Project built successfully!");

console.log("Running CLI...");
console.log("");

await import("./dist/cli.js");
