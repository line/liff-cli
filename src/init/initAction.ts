import { execSync } from "child_process";
import { addAction as addChannelAction } from "../channel/commands/add.js";
import { createLiffApp } from "../app/commands/create.js";
import { InitOptions, makeOptions } from "./commands/index.js";

export const initAction: (options: InitOptions) => Promise<void> = async (
  options,
) => {
  // collect required information via prompt if not specified via parameter
  const consolidatedOptions = await makeOptions(options);

  // 1. add channel
  await addChannelAction(consolidatedOptions.channelId);

  // 2. create liff app (@ server)
  const liffId = await createLiffApp(consolidatedOptions);

  // 3. create liff app (@ client)
  execSync(
    `npx @line/create-liff-app "${consolidatedOptions.name}" -l ${liffId}`,
    {
      stdio: "inherit",
    },
  );

  // 4. print instructions on how to run locally
  console.info(`App ${liffId} successfully created.

Now do the following:
  1. go to app directory: \`cd ${consolidatedOptions.name}\`
  2. create certificate key files (e.g. \`mkcert localhost\`, see: https://developers.line.biz/en/docs/liff/liff-cli/#serve-operating-conditions )
  3. run LIFF app template using command above (e.g. \`npm run dev\` or \`yarn dev\`)
  4. open new terminal window, navigate to \`${consolidatedOptions.name}\` directory
  5. run \`liff-cli serve -l ${liffId} -u http://localhost:\${PORT FROM STEP 3.}/\`
  6. open browser and navigate to http://localhost:\${PORT FROM STEP 3.}/
`);
};
