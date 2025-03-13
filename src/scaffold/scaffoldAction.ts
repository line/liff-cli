import { execSync } from "child_process";

export type ScaffoldOptions = {
  name: string;
  liffId?: string;
};

export const scaffoldAction = async (
  options: ScaffoldOptions,
): Promise<void> => {
  const { name, liffId } = options;

  let command = `npx @line/create-liff-app "${name}"`;

  if (liffId) {
    command += ` -l ${liffId}`;
  }

  console.info(`Creating new LIFF app template: ${name}`);

  try {
    execSync(command, {
      stdio: "inherit",
    });
    console.info(`Successfully created LIFF app template: ${name}`);
  } catch (error) {
    console.error(`Failed to create LIFF app template: ${error}`);
    throw error;
  }
};
