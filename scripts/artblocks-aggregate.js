const axios = require("axios");
const fs = require("fs");

const main = async () => {
  const infos = {};

  for (const file of await fs.promises.readdir("./data/artblocks")) {
    if (file !== "all.json") {
      const info = JSON.parse(
        await fs.promises.readFile(`./data/artblocks/${file}`, "utf-8")
      );

      const projectId = file.split(".")[0];
      const slug = info.name.toLowerCase().split(" ").join("-");
      infos[slug] = {
        ...info,
        animationUrl: `https://generator.artblocks.io/${info.tokenIdRange[0]}`,
        externalUrl: `https://artblocks.io/project/${projectId}`,
      };
    }
  }

  await fs.promises.writeFile(
    `./data/artblocks/all.json`,
    JSON.stringify(infos, null, 2)
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
