import * as fs from "fs";
import * as path from "path";
import * as core from "@actions/core";
import { parseOutputsOption } from "./outputsOptions";

(async () => {
  try {
    const userName = core.getInput("github_user_name");

  // Fallback pour exécution directe (hors GitHub Actions)
  const finalUserName =
    userName && userName.trim().length > 0
      ? userName
      : process.env.GITHUB_USER_NAME || "CedricGayraud";

  console.log(`👤 Using GitHub username: ${finalUserName}`);

  const outputs = parseOutputsOption(
    core.getMultilineInput("outputs") ?? [
      core.getInput("gif_out_path"),
      core.getInput("svg_out_path"),
    ],
  );
  const githubToken =
    process.env.GITHUB_TOKEN ?? core.getInput("github_token");

  const { generateContributionSnake } = await import(
    "./generateContributionSnake"
  );
  const results = await generateContributionSnake(finalUserName, outputs, {
    githubToken,
  });


    outputs.forEach((out, i) => {
      const result = results[i];
      if (out?.filename && result) {
        console.log(`💾 writing to ${out?.filename}`);
        fs.mkdirSync(path.dirname(out?.filename), { recursive: true });
        fs.writeFileSync(out?.filename, result);
      }
    });
  } catch (e: any) {
    core.setFailed(`Action failed with "${e.message}"`);
  }
})();
