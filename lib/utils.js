"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVersionsForPackage = exports.getAllActiveVersionsForPackage = exports.DEV_VERSION_NAME_REGEX = void 0;
exports.DEV_VERSION_NAME_REGEX = /(0\.0\.0-dev\.([a-zA-Z0-9)]{7}))/g;
const getAllActiveVersionsForPackage = (octokit, issue) => octokit.paginate('GET /orgs/{org}/packages/{package_type}/{package_name}/versions', {
    org: issue.owner,
    package_type: 'npm',
    package_name: issue.repo,
    per_page: 100,
}, (data) => data.data);
exports.getAllActiveVersionsForPackage = getAllActiveVersionsForPackage;
const deleteVersionsForPackage = ({ octokit, issue, versions, }) => Promise.all(versions.map((version) => {
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
}));
exports.deleteVersionsForPackage = deleteVersionsForPackage;
