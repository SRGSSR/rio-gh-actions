import * as core from "@actions/core";
import * as github from "@actions/github";

const REGEX = /(0\.0\.0-dev\.([a-zA-Z0-9)]{7}))/g;

try {
  async function run() {
    const githubToken = core.getInput("GITHUB_TOKEN");

    const octokit = github.getOctokit(githubToken);
    const { issue } = github.context;

    const commentsQuery = await octokit.rest.issues.listComments({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
    });
    const comments = commentsQuery.data.map((item) => item.body);

    const versionNamesToDelete: string[] = [];
    comments.forEach((c) => {
      const res = c?.match(REGEX);
      if (res) {
        versionNamesToDelete.push(...res);
      }
    });

    console.log({ versionNamesToDelete });

    if (!versionNamesToDelete.length) return;

    const allVersions = (
      await octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg({
        package_type: "npm",
        package_name: issue.repo,
        org: issue.owner,
      })
    ).data;

    await Promise.all(
      versionNamesToDelete.map((versionName) => {
        const foundVersion = allVersions.find((v) => v.name === versionName);
        if (!foundVersion) {
          console.log(`Version with name ${versionName} not found.`);
          return;
        }
        const versionStr = `${versionName}/${foundVersion.id}`;
        return octokit.rest.packages
          .deletePackageVersionForOrg({
            package_type: "npm",
            package_name: issue.repo,
            org: issue.owner,
            package_version_id: foundVersion.id,
          })
          .then(() => {
            console.log(`${versionStr} deleted! :)`);
          })
          .catch((err) => {
            console.log(`Can't delete version ${versionStr} :(`, err);
          });
      })
    );
  }

  run();
} catch (error) {
  core.setFailed(error instanceof Error ? error.message : (error as string));
}
