#! /usr/bin/env node

const dataPath = "./api_tests/data";
const yargs = require("yargs");
const newman = require("newman");
const fs = require("fs");
var path = require("path");

const argv = yargs
  .command("$0")
  .option("env", {
    alias: "e",
    describe: "environment",
    choices: ["aws-local", "aws-sit1"]
  })
  .demandOption("e")
  .help().argv;

start = (data, dataRow) => {
  let folders = getData();
  if (data) {
    folders = [data];
  }
  const collections = getCollections(data);
  const environment = getEnvironment();
  if (fs.existsSync("api-test-result.json")) {
    fs.unlinkSync("api-test-result.json");
  }
  console.log(folders)
  collections.forEach(async collection => {
    console.log(folders)
    for (const folder of folders) {
      result = await runNewman(
        collection,
        folder,
        environment,
        dataRow
      );
    }
  });
};

getCollections = name => {
  const testFolder = "./api_tests/collections/";
  const collections = [];

  fs.readdirSync(testFolder).forEach(file => {
    if (file.includes(".json")) {
      var content = fs.readFileSync(`${testFolder}/${file}`, "utf8");

      let collectionContent = JSON.parse(content);

      if (name) {
        collectionContent.item = collectionContent.item.filter(
          content => content.name === name
        );
      }
      collections.push(collectionContent);
    }
  });
  return collections;
};

getData = () => {
  const testFolder = "./api_tests/data/";
  const folders = [];
  fs.readdirSync(testFolder).forEach(file => {
    const folderName = file.replace(".json", "");
    if (!file.includes("DS_Store")) {
      folders.push(folderName);
    }
  });

  return folders;
};

getEnvironment = () => {
  const jsonPath = path.join(
    "./api_tests/env/",
    `${argv.env}.json`
  );
  const content = fs.readFileSync(jsonPath, "utf8");
  return JSON.parse(content);
};


runNewman = (collection, folder, environment, globals, dataRow) => {
  let iterationPath = `${dataPath}/${folder}.json`;
  console.log(iterationPath);
  if (dataRow) {
    let data = JSON.parse(fs.readFileSync(iterationPath, "utf8"));
    fs.writeFileSync("api-test-data.json", JSON.stringify([data[dataRow]]));
    iterationPath = "api-test-data.json";
  }
  return new Promise((resolve, reject) => {
    newman.run(
      {
        collection,
        reporters: ["cli"],
        bail: "failure",
        environment: environment,
        iterationData: iterationPath,
        suppressExitCode: true,
        folder,
        globals
      },
      (err, summary) => {
        if (fs.existsSync("api-test-result.json")) {
          let savedSummary = JSON.parse(
            fs.readFileSync("api-test-result.json", "utf8")
          );
          savedSummary.push(buildJsonResult(summary, folder));
          fs.writeFileSync(
            "api-test-result.json",
            JSON.stringify(savedSummary)
          );
        } else {
          fs.writeFileSync(
            "api-test-result.json",
            JSON.stringify([buildJsonResult(summary, folder)])
          );
        }

        if (dataRow) {
          fs.unlinkSync("api-test-data.json");
        }
        if (err != null) {
          reject(err);
        }
        if (summary.run.failures.length > 0) {
          reject(summary.run.failures);
        }
        console.log(`${folder} run complete!`);
        resolve();
      }
    );
  }).then(
    () => {},
    err => {
      process.exit(1);
    }
  );
};

const buildJsonResult = (summary, folder) => {
  return {
    iterations: summary.run.stats.iterations,
    asertions: summary.run.stats.assertions,
    failures: summary.run.failures,
    name: folder
  };
};

start(argv.folder, argv.dataRow);