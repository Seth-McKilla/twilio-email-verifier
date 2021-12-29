"use strict";
const fs = require("fs");
require("dotenv").config();
const client = require("@sendgrid/client");
client.setApiKey(process.env.SENDGRID_API_KEY);
const emails = require("./emails");

(async () => {
  let results = [];

  await Promise.all(
    emails.map(async (email) => {
      const data = {
        email,
        "source": "signup",
      };

      try {
        const [response] = await client.request({
          url: `/v3/validations/email`,
          method: "POST",
          body: data,
        });
        const result = response.body.result;
        results.push(result);
      } catch (error) {
        console.error(error);
      }
    })
  ).then(() => fs.writeFileSync("results.json", JSON.stringify(results)));
})();
