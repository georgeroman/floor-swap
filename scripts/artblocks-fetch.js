const axios = require("axios");
const fs = require("fs");
const { parse } = require("node-html-parser");

const invalidProjectIds = [
  "128",
  "148",
  "155",
  "170",
  "175",
  "176",
  "177",
  "178",
  "179",
  "180",
  "181",
  "182",
  "183",
];

const main = async () => {
  const projectIds = await axios
    .get("https://api.artblocks.io/platform")
    .then((response) => response.data)
    .then((data) => {
      const root = parse(data);

      const projectIds = root.childNodes[0].childNodes[0].childNodes[5].text
        .split(":")[1]
        .split(",")
        .map((str) => str.trim());

      return projectIds;
    });

  // This will probably need some manual help since the requests time-out after a while
  for (const projectId of projectIds) {
    if (invalidProjectIds.includes(projectId)) {
      console.log(`Skipping project ${projectId}`);
      continue;
    } else {
      console.log(`Fetching project ${projectId}`);
    }

    const { address, name, description, artist, imageUrl, tokenIdRange } =
      await axios
        .get("https://api.artblocks.io/project/" + projectId)
        .then((response) => response.data)
        .then(async (data) => {
          const root = parse(data);

          const name = root.childNodes[0].childNodes[0].childNodes[0].text
            .split(":")[1]
            .trim();
          const artist = root.childNodes[0].childNodes[0].childNodes[1].text
            .split(":")[1]
            .trim();
          const description =
            root.childNodes[0].childNodes[0].childNodes[2].text
              .split(":")[1]
              .trim();
          const address =
            Number(projectId) < 3
              ? "0x059edd72cd353df5106d2b9cc5ab83a52287ac3a"
              : "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270";
          const rawImageUrl =
            "https://api.artblocks.io/image/" + Number(projectId) * 1000000;
          const imageUrl = await axios
            .get(rawImageUrl)
            .then((response) => response.request.res.responseUrl);
          const maximumInvocations =
            root.childNodes[0].childNodes[0].childNodes[20].text
              .split(":")[1]
              .trim();

          return {
            address,
            name,
            description,
            artist,
            imageUrl,
            tokenIdRange: [
              Number(projectId) * 1000000,
              Number(projectId) * 1000000 + Number(maximumInvocations) - 1,
            ],
          };
        });

    await fs.promises.writeFile(
      `./data/artblocks/${projectId}.json`,
      JSON.stringify(
        { address, name, description, artist, imageUrl, tokenIdRange },
        null,
        2
      )
    );
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
