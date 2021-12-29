const csv = require("fast-csv");
require("dotenv").config();

function readCsv(path, options, rowProcessor) {
  return new Promise((resolve, reject) => {
    const data = [];

    csv
      .parseFile(path, options)
      .on("error", reject)
      .on("data", (row) => {
        const obj = rowProcessor(row);
        if (obj) data.push(obj);
      })
      .on("end", () => {
        resolve(data);
      });
  });
}

module.exports = readCsv;
