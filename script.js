// const axios = require("axios");
// const { Parser } = require("json2csv");
// const readline = require("readline");
// const fs = require("fs");
//
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });
//
// function askQuestion(query) {
//   return new Promise((resolve) => rl.question(query, resolve));
// }
//
// async function main() {
//   const organization = await askQuestion(
//     "Please enter your organisation name: ",
//   );
//
//   const repo = await askQuestion("Please enter the repository name: ");
//   const token = await askQuestion("Please enter your access token: ");
//
//   const url = `https://api.github.com/repos/${organization}/${repo}/pulls?state=all`;
//   const options = {
//     headers: {
//       Authorization: `token ${token}`,
//       "User-Agent": "rayjosong", // change accordingly
//       Accept: "application/vnd.github.v3+json",
//     },
//   };
//
//   try {
//     const response = await axios.get(url, options);
//
//     const pulls = response.data.map((pull) => ({
//       number: pull.number,
//       title: pull.title,
//       user: pull.user.login,
//       state: pull.state,
//       created_at: pull.created_at,
//       updated_at: pull.updated_at,
//       closed_at: pull.closed_at,
//       additions: pull.additions,
//       deletions: pull.deletions,
//     }));
//
//     const parser = new Parser();
//     const csv = parser.parse(pulls);
//
//     console.log("writing to " + `${repo}_pull_requests.csv`);
//     fs.writeFileSync(`${repo}_pull_requests.csv`, csv);
//   } catch (error) {
//     console.error("error: " + error);
//   }
//
//   rl.close();
// }
//
// main();
//
require("dotenv").config();
const axios = require("axios");
const readline = require("readline-sync");

// Ask for repo and organisation
// const repo = readline.question("Please enter the repository name: ");
// const org = readline.question("Please enter the organisation name: ");

const repo = process.env.REPO_NAME;
const org = process.env.ORGANISATION_NAME;
const githubApiToken = process.env.GITHUB_API_TOKEN;
const user = process.env.USERNAME;

if (!githubApiToken) {
  console.error("Please set your GitHub API token in the .env file");
  process.exit(1);
}

const headers = {
  Authorization: `token ${githubApiToken}`,
  Accept: "application/vnd.github.v3+json",
};

let page = 1;
let userPRs = [];

let noUserPRsCount = 0;

const fetchPRs = async () => {
  try {
    console.log(
      `Fetching page ${page}. Number of PRs associated to ${user}: ${userPRs.length}`,
    );
    const response = await axios.get(
      `https://api.github.com/repos/${org}/${repo}/pulls?state=all&page=${page}&per_page=100`,
      { headers },
    );
    const prs = response.data;
    const filteredPRs = prs.filter((pr) => pr.user.login === user);
    userPRs = [...userPRs, ...filteredPRs];

    // If the response is not empty and there are PRs associated with the user, there might be more pages
    if (filteredPRs.length > 0) {
      noUserPRsCount = 0; // reset the counter if PRs associated with the user are found
      page++;
      await fetchPRs();
    } else if (prs.length > 0 && noUserPRsCount <= 3) {
      noUserPRsCount++; // increment the counter if no PRs associated with the user are found
      page++;
      await fetchPRs();
    } else {
      // if there are more than 3 pages where no PRs associated to user are found, then assume it was before the join date of the user
      console.log(`Found ${userPRs.length} pull requests by ${user}:`);
      userPRs.forEach((pr) => console.log(`#${pr.number}: ${pr.title}`));
    }
  } catch (error) {
    console.error(`Could not fetch pull requests: ${error.message}`);
  }
};

fetchPRs();
