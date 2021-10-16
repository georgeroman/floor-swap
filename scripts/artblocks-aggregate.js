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
        baseTokenUrl: "https://d2ekshiy7r5vl7.cloudfront.net/",
        baseAnimationUrl: "https://generator.artblocks.io/",
        externalUrl: `https://artblocks.io/project/${projectId}`,
      };
      delete infos[slug].imageUrl;
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
