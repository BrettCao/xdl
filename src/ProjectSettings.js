require('instapromise');

var JsonFile = require('@exponent/json-file');

var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

var projectSettingsFile = 'settings.json';
var projectSettingsDefaults = {
  hostType: 'ngrok',
  dev: true,
  strict: false,
  minify: false,
  urlType: 'exp',
};
var packagerInfoFile = 'packager-info.json';

function projectSettingsJsonFile(projectRoot, filename) {
  return new JsonFile(path.join(dotExponentProjectDirectory(projectRoot), filename));
}

async function readAsync(projectRoot) {
  let projectSettings;
  try {
    projectSettings = await projectSettingsJsonFile(projectRoot, projectSettingsFile).readAsync();
  } catch (e) {
    projectSettings = await projectSettingsJsonFile(projectRoot, projectSettingsFile).writeAsync(projectSettingsDefaults);
  }

  return projectSettings;
}

async function setAsync(projectRoot, json) {
  return await projectSettingsJsonFile(projectRoot, projectSettingsFile).mergeAsync(json, {cantReadFileDefault: projectSettingsDefaults});
}

async function readPackagerInfoAsync(projectRoot) {
  return await projectSettingsJsonFile(projectRoot, packagerInfoFile).readAsync({cantReadFileDefault: {}});
}

async function setPackagerInfoAsync(projectRoot, json) {
  return await projectSettingsJsonFile(projectRoot, packagerInfoFile).mergeAsync(json, {cantReadFileDefault: {}});
}

function dotExponentProjectDirectory(projectRoot) {
  let dirPath = path.join(projectRoot, '.exponent');
  try {
    // remove .exponent file if it exists, we moved to a .exponent directory
    if (fs.statSync(dirPath).isFile()) {
      fs.unlinkSync(dirPath);
    }
  } catch (e) {
    // no file or directory, continue
  }

  mkdirp.sync(dirPath);
  return dirPath;
}

function dotExponentProjectDirectoryExists(projectRoot) {
  let dirPath = path.join(projectRoot, '.exponent');
  try {
    if (fs.statSync(dirPath).isDirectory()) {
      return true;
    }
  } catch (e) {
    // file doesn't exist
  }

  return false;
}

async function getPackagerOptsAsync(projectRoot) {
  let projectSettings = await readAsync(projectRoot);

  return {
    http: (projectSettings.urlType === 'http'),
    ngrok: (projectSettings.hostType === 'ngrok'),
    lan: (projectSettings.hostType === 'lan'),
    localhost: (projectSettings.hostType === 'localhost'),
    dev: projectSettings.dev,
    strict: projectSettings.strict,
    minify: projectSettings.minify,
    redirect: (projectSettings.urlType === 'redirect'),
  };
}

module.exports = {
  dotExponentProjectDirectory,
  dotExponentProjectDirectoryExists,
  getPackagerOptsAsync,
  projectSettingsJsonFile,
  readAsync,
  readPackagerInfoAsync,
  setAsync,
  setPackagerInfoAsync,
};
