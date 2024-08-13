import joplin from "api";

const fs = require("fs-extra");
const path = require("path");
const logger = require("electron-log");

async function initWord2Vec() {
  const installationDir = await joplin.plugins.installationDir();
  const dataDir = await joplin.plugins.dataDir();
  const word2VecFolder = path.join(dataDir, "lib", "word2vec");

  if (!fs.existsSync(word2VecFolder)) {
    logger.info("word2vec does not exist, have to create and initialize");
    const srcFromInstallation = path.join(installationDir, "lib", "word2vec");
    await fs.copy(srcFromInstallation, path.join(dataDir, "lib", "word2vec"));
  } else {
    logger.info("word2vec already exists in plugin");
  }
}

module.exports = {
    initWord2Vec,
}
