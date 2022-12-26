"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-inner-declarations */
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const utils_1 = require("./utils");
try {
    function run() {
        return __awaiter(this, void 0, void 0, function* () {
            const githubToken = core.getInput('githubToken');
            const octokit = github.getOctokit(githubToken);
            const { issue } = github.context;
            const commentsQuery = yield octokit.rest.issues.listComments({
                owner: issue.owner,
                repo: issue.repo,
                issue_number: issue.number,
            });
            const comments = commentsQuery.data.map((item) => item.body);
            const versionNamesFoundInComments = [];
            comments.forEach((c) => {
                const res = c === null || c === void 0 ? void 0 : c.match(utils_1.DEV_VERSION_NAME_REGEX);
                if (res) {
                    versionNamesFoundInComments.push(...res);
                }
            });
            console.debug('ℹ️', { versionNamesFoundInComments });
            if (!versionNamesFoundInComments.length)
                return;
            const allVersions = yield (0, utils_1.getAllActiveVersionsForPackage)(octokit, issue);
            const versionsToDelete = [];
            const versionNamesNotFound = [];
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
            yield (0, utils_1.deleteVersionsForPackage)({
                octokit,
                issue,
                versions: versionsToDelete,
            });
        });
    }
    run();
}
catch (error) {
    core.setFailed(error instanceof Error ? error.message : error);
}
