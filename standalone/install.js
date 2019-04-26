"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Request = require("request");
var pact_util_1 = require("../src/pact-util");
var path = require("path");
var fs = require("fs");
var urljoin = require("url-join");
var decompress = require("decompress");
var tar = require("tar");
var chalk = require("chalk");
var sumchecker = require("sumchecker");
var request = Request.defaults({ proxy: process.env.npm_config_https_proxy || process.env.npm_config_proxy || undefined });
exports.PACT_STANDALONE_VERSION = "1.64.0";
var PACT_DEFAULT_LOCATION = "https://github.com/pact-foundation/pact-ruby-standalone/releases/download/v" + exports.PACT_STANDALONE_VERSION + "/";
var HTTP_REGEX = /^http(s?):\/\//;
var CONFIG = createConfig();
var CIs = [
    "CI",
    "CONTINUOUS_INTEGRATION",
    "ABSTRUSE_BUILD_DIR",
    "APPVEYOR",
    "BUDDY_WORKSPACE_URL",
    "BUILDKITE",
    "CF_BUILD_URL",
    "CIRCLECI",
    "CODEBUILD_BUILD_ARN",
    "CONCOURSE_URL",
    "DRONE",
    "GITLAB_CI",
    "GO_SERVER_URL",
    "JENKINS_URL",
    "PROBO_ENVIRONMENT",
    "SEMAPHORE",
    "SHIPPABLE",
    "TDDIUM",
    "TEAMCITY_VERSION",
    "TF_BUILD",
    "TRAVIS",
    "WERCKER_ROOT",
];
function createConfig() {
    var packageConfig = findPackageConfig(path.resolve(__dirname, "..", ".."));
    var PACT_BINARY_LOCATION = packageConfig.binaryLocation || PACT_DEFAULT_LOCATION;
    var CHECKSUM_SUFFIX = ".checksum";
    return {
        doNotTrack: packageConfig.doNotTrack || process.env.PACT_DO_NOT_TRACK !== undefined || false,
        binaries: [
            {
                platform: "win32",
                binary: "pact-" + exports.PACT_STANDALONE_VERSION + "-win32.zip",
                binaryChecksum: "pact-" + exports.PACT_STANDALONE_VERSION + "-win32.zip" + CHECKSUM_SUFFIX,
                downloadLocation: PACT_BINARY_LOCATION,
                folderName: "win32-" + exports.PACT_STANDALONE_VERSION
            },
            {
                platform: "darwin",
                binary: "pact-" + exports.PACT_STANDALONE_VERSION + "-osx.tar.gz",
                binaryChecksum: "pact-" + exports.PACT_STANDALONE_VERSION + "-osx.tar.gz" + CHECKSUM_SUFFIX,
                downloadLocation: PACT_BINARY_LOCATION,
                folderName: "darwin-" + exports.PACT_STANDALONE_VERSION
            },
            {
                platform: "linux",
                arch: "x64",
                binary: "pact-" + exports.PACT_STANDALONE_VERSION + "-linux-x86_64.tar.gz",
                binaryChecksum: "pact-" + exports.PACT_STANDALONE_VERSION + "-linux-x86_64.tar.gz" + CHECKSUM_SUFFIX,
                downloadLocation: PACT_BINARY_LOCATION,
                folderName: "linux-x64-" + exports.PACT_STANDALONE_VERSION
            },
            {
                platform: "linux",
                arch: "ia32",
                binary: "pact-" + exports.PACT_STANDALONE_VERSION + "-linux-x86.tar.gz",
                binaryChecksum: "pact-" + exports.PACT_STANDALONE_VERSION + "-linux-x86.tar.gz" + CHECKSUM_SUFFIX,
                downloadLocation: PACT_BINARY_LOCATION,
                folderName: "linux-ia32-" + exports.PACT_STANDALONE_VERSION
            }
        ]
    };
}
exports.createConfig = createConfig;
function findPackageConfig(location, tries) {
    if (tries === void 0) { tries = 10; }
    if (tries === 0) {
        return {};
    }
    var packagePath = path.resolve(location, "package.json");
    if (fs.existsSync(packagePath)) {
        var config = require(packagePath).config;
        if (config && (config.pact_binary_location || config.pact_do_not_track)) {
            return {
                binaryLocation: getBinaryLocation(config.pact_binary_location, location),
                doNotTrack: config.pact_do_not_track
            };
        }
    }
    return findPackageConfig(path.resolve(location, ".."), tries - 1);
}
function getBinaryLocation(location, basePath) {
    if (!location || typeof location !== "string" || location.length === 0) {
        return undefined;
    }
    return HTTP_REGEX.test(location) ? location : path.resolve(basePath, location);
}
function download(data) {
    console.log(chalk.gray("Installing Pact Standalone Binary for " + data.platform + "."));
    return new Promise(function (resolve, reject) {
        if (fs.existsSync(path.resolve(data.filepath))) {
            console.log(chalk.yellow("Binary already downloaded, skipping..."));
            return resolve(data);
        }
        console.log(chalk.yellow("Downloading Pact Standalone Binary v" + exports.PACT_STANDALONE_VERSION + " for platform " + data.platform + " from " + data.binaryDownloadPath));
        if (!CONFIG.doNotTrack) {
            console.log(chalk.gray("Please note: we are tracking this download anonymously to gather important usage statistics. " +
                "To disable tracking, set 'pact_do_not_track: true' in your package.json 'config' section."));
            var isCI = CIs.some(function (key) { return process.env[key] !== undefined; });
            request.post({
                url: "https://www.google-analytics.com/collect",
                form: {
                    v: 1,
                    tid: "UA-117778936-1",
                    cid: Math.round(2147483647 * Math.random()).toString(),
                    t: "screenview",
                    an: "pact-install",
                    av: require("../package.json").version,
                    aid: "pact-node",
                    aiid: "standalone-" + exports.PACT_STANDALONE_VERSION,
                    cd: "download-node-" + data.platform + "-" + (isCI ? "ci" : "user"),
                    aip: true,
                }
            }).on("error", function () {
            });
        }
        if (HTTP_REGEX.test(data.binaryDownloadPath)) {
            downloadFileRetry(data.binaryDownloadPath, data.filepath)
                .then(function () {
                console.log(chalk.green("Finished downloading binary to " + data.filepath));
                resolve(data);
            }, function (e) { return reject("Error downloading binary from " + data.binaryDownloadPath + ": " + e); });
        }
        else if (fs.existsSync(data.binaryDownloadPath)) {
            fs.createReadStream(data.binaryDownloadPath)
                .on("error", function (e) { return reject("Error reading the file at '" + data.binaryDownloadPath + "': " + e); })
                .pipe(fs.createWriteStream(data.filepath)
                .on("error", function (e) { return reject("Error writing the file to '" + data.filepath + "': " + e); })
                .on("close", function () { return resolve(data); }));
        }
        else {
            reject("Could not get binary from '" + data.binaryDownloadPath + "' as it's not a URL and does not exist at the path specified.");
        }
    });
}
function extract(data) {
    if (fs.existsSync(data.platformFolderPath)) {
        return Promise.resolve();
    }
    if (!fs.existsSync(data.checksumFilepath)) {
        throwError("Checksum file missing from standalone directory. Aborting.");
    }
    fs.mkdirSync(data.platformFolderPath);
    console.log(chalk.yellow("Extracting binary from " + data.filepath + "."));
    var basename = path.basename(data.filepath);
    return sumchecker("sha1", data.checksumFilepath, __dirname, basename)
        .then(function () { return console.log(chalk.green("Checksum passed for '" + basename + "'.")); }, function () { return throwError("Checksum rejected for file '" + basename + "' with checksum " + path.basename(data.checksumFilepath)); })
        .then(function () { return data.isWindows ?
        decompress(data.filepath, data.platformFolderPath, { strip: 1 }) :
        tar.x({
            file: data.filepath,
            strip: 1,
            cwd: data.platformFolderPath,
            Z: true
        }); })
        .then(function () {
        var publishPath = path.resolve(data.platformFolderPath, "bin", "pact-publish" + (pact_util_1.default.isWindows() ? ".bat" : ""));
        if (fs.existsSync(publishPath)) {
            fs.unlinkSync(publishPath);
        }
        console.log(chalk.green("Extraction done."));
    })
        .then(function () {
        console.log("\n\n" +
            chalk.bgYellow(chalk.black("### If you") +
                chalk.red(" ❤ ") +
                chalk.black("Pact and want to support us, please donate here:")) +
            chalk.blue(" http://donate.pact.io/node") +
            "\n\n");
    })
        .catch(function (e) { return throwError("Extraction failed for " + data.filepath + ": " + e); });
}
function setup(platform, arch) {
    var entry = getBinaryEntry(platform, arch);
    return Promise.resolve({
        binaryDownloadPath: join(entry.downloadLocation, entry.binary),
        checksumDownloadPath: join(PACT_DEFAULT_LOCATION, entry.binaryChecksum),
        filepath: path.resolve(__dirname, entry.binary),
        checksumFilepath: path.resolve(__dirname, entry.binaryChecksum),
        isWindows: pact_util_1.default.isWindows(platform),
        platform: entry.platform,
        arch: entry.arch,
        platformFolderPath: path.resolve(__dirname, entry.folderName)
    });
}
function join() {
    var paths = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        paths[_i] = arguments[_i];
    }
    return HTTP_REGEX.test(paths[0]) ? urljoin.apply(void 0, paths) : path.join.apply(path, paths);
}
function downloadFileRetry(url, filepath, retry) {
    if (retry === void 0) { retry = 3; }
    return new Promise(function (resolve, reject) {
        var len = 0;
        var downloaded = 0;
        var time = Date.now();
        request({ url: url, headers: { 'User-Agent': 'https://github.com/pact-foundation/pact-node' } })
            .on("error", function (e) { return reject(e); })
            .on("response", function (res) { return len = parseInt(res.headers["content-length"], 10); })
            .on("data", function (chunk) {
            downloaded += chunk.length;
            var now = Date.now();
            if (now - time > 1000) {
                time = now;
                console.log(chalk.gray("Downloaded " + (100 * downloaded / len).toFixed(2) + "%..."));
            }
        })
            .pipe(fs.createWriteStream(filepath))
            .on("finish", function () { return resolve(); });
    }).catch(function (e) { return retry-- === 0 ? throwError(e) : downloadFileRetry(url, filepath, retry); });
}
function throwError(msg) {
    throw new Error(chalk.red("Error while installing binary: " + msg));
}
function getBinaryEntry(platform, arch) {
    platform = platform || process.platform;
    arch = arch || process.arch;
    for (var _i = 0, _a = CONFIG.binaries; _i < _a.length; _i++) {
        var value = _a[_i];
        if (value.platform === platform && (value.arch ? value.arch === arch : true)) {
            return value;
        }
    }
    throw throwError("Cannot find binary for platform '" + platform + "' with architecture '" + arch + "'.");
}
exports.getBinaryEntry = getBinaryEntry;
function downloadChecksums() {
    console.log(chalk.gray("Downloading All Pact Standalone Binary Checksums."));
    return Promise.all(CONFIG.binaries.map(function (value) {
        return setup(value.platform, value.arch)
            .then(function (data) {
            return downloadFileRetry(data.checksumDownloadPath, data.checksumFilepath)
                .then(function () {
                console.log(chalk.green("Finished downloading checksum " + path.basename(data.checksumFilepath)));
                return data;
            }, function (e) { return throwError("Error downloading checksum from " + data.checksumDownloadPath + ": " + e); });
        });
    })).then(function () { return console.log(chalk.green("All checksums downloaded.")); }, function (e) { return throwError("Checksum Download Failed Unexpectedly: " + e); });
}
exports.downloadChecksums = downloadChecksums;
exports.default = (function (platform, arch) {
    return setup(platform, arch)
        .then(function (d) { return download(d); })
        .then(function (d) { return extract(d); })
        .then(function () { return console.log(chalk.green("Pact Standalone Binary is ready.")); })
        .catch(function (e) { return throwError("Postinstalled Failed Unexpectedly: " + e); });
});
//# sourceMappingURL=install.js.map