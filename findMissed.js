const path = require("path");
const _ = require("lodash");
const readCsv = require("./lib/readCsv");

const unvalidatedFile = path.resolve(
  __dirname,
  "assets",
  "final",
  "DAO_central_emails.csv"
);
const validatedFile = path.resolve(
  __dirname,
  "assets",
  "final",
  "DAO_central_emails_validated.csv"
);

(async function () {
  const unvalidated = await readCsv(
    unvalidatedFile,
    { skipRows: 1 },
    (row) => ({
      email: row[5],
    })
  );

  const validated = await readCsv(validatedFile, { skipRows: 1 }, (row) => ({
    email: row[5],
  }));

  const diff = _.differenceWith(unvalidated, validated, _.isEqual);
  console.log(diff);
})();
