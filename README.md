# Github Action: rio-clean-dev-releases

## Release new version

1) Make sure you have `@vercel/ncc` installed globally.
    - `npm i -g @vercel/ncc` if not the case.
2) Compile the `index.js` file.
    - `ncc build index.js`
3) Stage the new/edited files.
    - `git add .` or else
4) Commit
    - `git commit -m YOUR_MESSAGE`
5) Tag
    - `git tag -a -m RELEASE_NAME RELEASE_CODE`
6) Push
    - `git push --follow-tags`