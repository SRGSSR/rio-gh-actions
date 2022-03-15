const core = require("@actions/core");
const github = require("@actions/github");

try {
  async function run() {
    const githubToken = core.getInput("GITHUB_TOKEN");
    const packagesToken = core.getInput("PACKAGES_TOKEN");
    console.log({ githubToken, packagesToken });

    const octokit = github.getOctokit(githubToken);
    const { issue } = github.context;
    console.log({ context: github.context });
    console.log({ issue });
    const [{ data: pullRequest }, { data: comments }] = await Promise.all([
      octokit.rest.pulls.get({
        owner: issue.owner,
        repo: issue.repo,
        pull_number: issue.number,
      }),
      octokit.rest.issues.listComments({
        owner: issue.owner,
        repo: issue.repo,
        issue_number: issue.number,
      }),
    ]);

    console.log({ pullRequest });
    console.log({ comments });
  }
  run();
} catch (error) {
  core.setFailed(error.message);
}
