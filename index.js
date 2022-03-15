const core = require("@actions/core");
const github = require("@actions/github");

const REGEX = /(0\.0\.0-dev\.([a-zA-Z0-9)]{7}))/g;

try {
  async function run() {
    const githubToken = core.getInput("GITHUB_TOKEN");
    const packagesToken = core.getInput("PACKAGES_TOKEN");
    console.log({
      githubToken,
      packagesToken,
      packagesTokenMissing: !packagesToken,
    });

    const octokit = github.getOctokit(githubToken);
    const { issue } = github.context;

    const commentsQuery = await octokit.rest.issues.listComments({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
    });

    const comments = commentsQuery.data.map((item) => item.body);
    console.log({ comments });

    const versionsToDelete = [];
    comments.forEach((c) => {
      const res = c.match(REGEX);
      if (res) {
        versionsToDelete.push(...res);
      }
    });

    console.log({ versionsToDelete });

    await Promise.all(
      versionsToDelete.map((version) =>
        octokit.rest.packages
          .getPackageVersionForOrganization({
            package_type: "npm",
            package_name: issue.repo,
            org: issue.owner,
            package_version_id: version,
          })
          .then(({ data: package }) => {
            console.log(`Deleting version ${version}/${package.id} ...`);
            return octokit.rest.packages.deletePackageVersionForOrg({
              package_type: "npm",
              package_name: issue.repo,
              org: issue.owner,
              package_version_id: package.id,
            });
          })
      )
    );
  }

  run();
} catch (error) {
  core.setFailed(error.message);
}
