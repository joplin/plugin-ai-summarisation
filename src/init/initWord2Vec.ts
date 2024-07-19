import joplin from "api";

const fs = require("fs-extra");
const path = require("path");

async function initWord2Vec() {
  const installationDir = await joplin.plugins.installationDir();
  const dataDir = await joplin.plugins.dataDir();
  console.log(dataDir);
  const word2VecFolder = path.join(dataDir, "lib", "word2vec");

  if (!fs.existsSync(word2VecFolder)) {
    const srcFromInstallation = path.join(installationDir, "lib", "word2vec");
    await fs.copy(srcFromInstallation, path.join(dataDir, "lib", "word2vec"));
  }
}

// module.exports = {
//     initWord2Vec,
// }
