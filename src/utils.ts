import { getOctokit } from '@actions/github';
import { Context } from '@actions/github/lib/context';

type Octokit = ReturnType<typeof getOctokit>;
type Issue = Context['issue'];

export const DEV_VERSION_NAME_REGEX = /(0\.0\.0-dev\.([a-zA-Z0-9)]{7}))/g;

export const getAllActiveVersionsForPackage = (octokit: Octokit, issue: Issue) =>
  octokit.paginate(
    'GET /orgs/{org}/packages/{package_type}/{package_name}/versions',
    {
      org: issue.owner,
      package_type: 'npm',
      package_name: issue.repo,
      per_page: 100,
    },
    (data) => data.data
  );

export const deleteVersionsForPackage = ({
  octokit,
  issue,
  versions,
}: {
  octokit: Octokit;
  issue: Issue;
  versions: Awaited<ReturnType<typeof getAllActiveVersionsForPackage>>;
}) =>
  Promise.all(
    versions.map((version) => {
      const versionStr = `${version.name}/${version.id}`;
      return octokit.rest.packages
        .deletePackageVersionForOrg({
          package_type: 'npm',
          package_name: issue.repo,
          org: issue.owner,
          package_version_id: version.id,
        })
        .then(() => {
          console.debug(`✅ ${versionStr} deleted!`);
        })
        .catch((err) => {
          console.error(`🔴 Can't delete version ${versionStr}.`, err);
        });
    })
  );
