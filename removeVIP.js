const path = require("path");
const _ = require("lodash");
const csv = require("fast-csv");
const readCsv = require("./lib/readCsv");

const vipFile = path.resolve(__dirname, "assets", "vip", "vip_whitelist.csv");
const finalValidatedFile = path.resolve(
  __dirname,
  "assets",
  "final",
  "DAO_central_emails_validated_final.csv"
);
const finalOutputFile = path.resolve(
  __dirname,
  "assets",
  "final",
  "DAO_central_emails_validated_final_no_vip.csv"
);

(async function () {
  const vip = await readCsv(vipFile, { skipRows: 1 }, (row) => ({
    "ENS/ETH Address": row[4],
  }));
  const vipAddresses = vip.map((item) => item["ENS/ETH Address"]);

  const finalValidated = await readCsv(
    finalValidatedFile,
    {
      skipRows: 1,
    },
    (row) => ({
      submission_id: row[0],
      respondent_id: row[1],
      submitted_at: row[2],
      first_name: row[3],
      ens_address: row[4],
      email: row[5],
      verdict: row[6],
      score: row[7],
    })
  );

  const filtered = _.remove(finalValidated, ({ ens_address }) => {
    return !vipAddresses.includes(ens_address);
  });

  return csv.writeToPath(finalOutputFile, filtered, { headers: true });
})();
