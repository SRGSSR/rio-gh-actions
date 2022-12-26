# RIO Github Actions

All custom actions / shared workflows / shared configs for rio (PlaySuisse) projects

## Release new version

1. Bump version in `package.json` file.
1. Stage the new/edited files.
   - `git add .` or else
1. Commit
   - `git commit -m YOUR_MESSAGE`
1. Tag
   - `git tag -a -m RELEASE_NAME RELEASE_CODE`
1. Push
   - `git push --follow-tags`
1. Manually create a new github release from the tag you created
