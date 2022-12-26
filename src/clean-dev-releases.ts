/* eslint-disable no-inner-declarations */
import * as core from '@actions/core';
import * as github from '@actions/github';

import { deleteVersionsForPackage, DEV_VERSION_NAME_REGEX, getAllActiveVersionsForPackage } from './utils';

try {
  async function run() {
    const githubToken = core.getInput('githubToken');
    const untilTimestamp = Number(core.getInput('untilTimestamp'));

    const octokit = github.getOctokit(githubToken);
    const { issue } = github.context;

    const allVersions = await getAllActiveVersionsForPackage(octokit, issue);

    const versionsToDelete = allVersions.reduce<typeof allVersions>((acc, version) => {
      if (new Date(version.created_at).getTime() < untilTimestamp && version.name.match(DEV_VERSION_NAME_REGEX)?.length) {
        return [...acc, version];
      }
      return acc;
    }, []);

    console.debug('ℹ️', { versionNamesToDelete: versionsToDelete.map((v) => v.name) });

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
