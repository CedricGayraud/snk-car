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

if (!outputs || outputs.length === 0) {
  console.log("⚙️ No outputs provided, defaulting to ../dist/github-contribution-grid-snake.svg");

  outputs.push({
    filename: path.resolve("../dist/github-contribution-grid-snake.svg"),
    format: "svg",
    drawOptions: {
      colorDots: {
        A: "#9be9a8",
        B: "#40c463",
        C: "#30a14e",
        D: "#216e39",
      },
      colorEmpty: "#ebedf0",
      colorDotBorder: "#ffffff",
      colorSnake: "#FFD500", // 🟡 Jaune Renault
      sizeCell: 12,
      sizeDot: 10,
      sizeDotBorderRadius: 2,
      dark: {
        colorDots: {
          A: "#0e4429",
          B: "#006d32",
          C: "#26a641",
          D: "#39d353",
        },
        colorEmpty: "#161b22",
        colorDotBorder: "#0d1117",
        colorSnake: "#FFD500",
      },
    },
    animationOptions: {
      frameDuration: 80, // durée d'une frame en ms
      step: 2,           // vitesse de déplacement
    },
  });
}


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
