require("dotenv").config();
const client = require("@sendgrid/client");
client.setApiKey(process.env.SENDGRID_API_KEY);

const data = {
  "email": "example@example.com",
  "source": "signup",
};

const request = {
  url: `/v3/validations/email`,
  method: "POST",
  body: data,
};

(async () => {
  try {
    const response = await client.request(request);
    console.log(response.body);
  } catch (err) {
    console.log(err.message);
  }
})();
