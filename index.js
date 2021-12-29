const path = require("path");
const csv = require("fast-csv");
const Bottleneck = require("bottleneck");
require("dotenv").config();
const client = require("@sendgrid/client");
client.setApiKey(process.env.SENDGRID_API_KEY);

const limiter = new Bottleneck({
  minTime: 200, // sendgrid rate limited to 7 requests per second
});

const inputFile = path.resolve(
  __dirname,
  "assets",
  "DAO_central_emails_1-500.csv"
);
const outputFile = path.resolve(
  __dirname,
  "assets",
  "DAO_central_emails_validated.csv"
);

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

(async function () {
  let results = [];

  const data = await readCsv(inputFile, { skipRows: 1 }, (row) => ({
    submission_id: row[0],
    respondent_id: row[1],
    submitted_at: row[2],
    first_name: row[3],
    ens_address: row[4],
    email: row[5],
  }));

  return await Promise.all(
    data.map(async (item, idx) => {
      const body = {
        email: item.email,
        "source": "signup",
      };
      try {
        const [response] = await limiter.schedule(() => {
          console.log(idx);
          return client.request({
            url: `/v3/validations/email`,
            method: "POST",
            body,
          });
        });
        const { result } = response.body;
        results.push({
          ...item,
          verdict: result.verdict,
          score: result.score,
        });
      } catch (error) {
        console.error(error);
      }
    })
  ).then(() => csv.writeToPath(outputFile, results, { headers: true }));
})();
