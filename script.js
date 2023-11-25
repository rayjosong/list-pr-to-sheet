const axios = require("axios");
const { Parser } = require("json2csv");
const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  const organization = await askQuestion(
    "Please enter your organisation name: ",
  );

  const repo = await askQuestion("Please enter the repository name: ");
  const token = await askQuestion("Please enter your access token: ");

  const url = `https://api.github.com/repos/${organization}/${repo}/pulls?state=all`;
  const options = {
    headers: {
      Authorization: `token ${token}`,
      "User-Agent": "rayjosong", // change accordingly
      Accept: "application/vnd.github.v3+json",
    },
  };

  try {
    const response = await axios.get(url, options);
    const pulls = response.data.map((pull) => ({
      number: pull.number,
      title: pull.title,
      user: pull.user.login,
      state: pull.state,
      created_at: pull.created_at,
      updated_at: pull.updated_at,
      closed_at: pull.closed_at,
      additions: pull.additions,
      deletions: pull.deletions,
    }));

    const parser = new Parser();
    const csv = parser.parse(pulls);

    console.log("writing to " + `${repo}_pull_requests.csv`);
    fs.writeFileSync(`${repo}_pull_requests.csv`, csv);
  } catch (error) {
    console.error("error: " + error);
  }

  rl.close();
}

main();
