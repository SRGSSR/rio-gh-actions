/* eslint-disable no-inner-declarations */
import * as core from '@actions/core';
import * as github from '@actions/github';

import { deleteVersionsForPackage, DEV_VERSION_NAME_REGEX, getAllActiveVersionsForPackage } from './utils';

try {
  async function run() {
    const githubToken = core.getInput('githubToken');

    const octokit = github.getOctokit(githubToken);
    const { issue } = github.context;

    const commentsQuery = await octokit.rest.issues.listComments({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
    });
    const comments = commentsQuery.data.map((item) => item.body);

    const versionNamesFoundInComments: string[] = [];
    comments.forEach((c) => {
      const res = c?.match(DEV_VERSION_NAME_REGEX);
      if (res) {
        versionNamesFoundInComments.push(...res);
      }
    });

    console.debug('ℹ️', { versionNamesFoundInComments });

    if (!versionNamesFoundInComments.length) return;

    const allVersions = await getAllActiveVersionsForPackage(octokit, issue);
    const versionsToDelete: typeof allVersions = [];
    const versionNamesNotFound: typeof versionNamesFoundInComments = [];
    versionNamesFoundInComments.forEach((versionName) => {
      const found = allVersions.find((v) => v.name === versionName);
      if (!found) {
        versionNamesNotFound.push(versionName);
        return;
      }
      versionsToDelete.push(found);
    });

    if (versionNamesNotFound.length) {
      console.debug(`🤔 Versions with names ${versionNamesNotFound} not found.`);
    }

    await deleteVersionsForPackage({
      octokit,
      issue,
      versions: versionsToDelete,
    });
  }
  run();
} catch (error) {
  core.setFailed(error instanceof Error ? error.message : (error as string));
}
