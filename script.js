require("dotenv").config();
const axios = require("axios");
const readline = require("readline-sync");
const xlsx = require("xlsx");

const ProgressBar = require("progress");

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
let noUserPRsCount = 0;
let bar = null;

const getPRSize = (additions, deletions) => {
  const totalChanges = additions + deletions;
  if (totalChanges < 10) return "XS";
  if (totalChanges < 50) return "S";
  if (totalChanges < 200) return "M";
  if (totalChanges < 1000) return "L";
  return "XL";
};

const fetchPRs = async (totalPRs = 100) => {
  if (bar === null) {
    bar = new ProgressBar("Fetching PRs [:bar] :current/:total \t", {
      total: totalPRs,
    });
  }
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${process.env.ORGANISATION_NAME}/${process.env.REPO_NAME}/pulls?state=closed&page=${page}&per_page=100`,
      { headers },
    );

    const prs = response.data;
    const userPRs = prs.filter((pr) => pr.user.login === process.env.USERNAME);

    for (let pr of userPRs) {
      const prDetails = await axios.get(pr.url, { headers });
      const { additions, deletions, review_comments, comments, body, labels } =
        prDetails.data;

      pr.size = getPRSize(additions, deletions);
      pr.review_comments = review_comments;
      pr.body = body;

      // Get label names and join them with a comma
      pr.labels = labels.map((label) => label.name).join(", ");

      bar.tick();
      console.log(
        `#${pr.number} ${pr.title} (Size: ${pr.size}, Comments: ${
          pr.review_comments
        }, Merged: ${pr.merged_at ? "Yes" : "No"})`,
      );
    }

    if (noUserPRsCount === 3) return userPRs;

    if (userPRs.length === 0) {
      noUserPRsCount++;
    } else {
      noUserPRsCount = 0;
    }

    page++;

    if (userPRs.length < totalPRs) {
      bar.interrupt(`Fetching more PRs...`);
      return [...userPRs, ...(await fetchPRs())];
    }
  } catch (error) {
    console.error(`Could not fetch pull requests: ${error.message}`);
  }
};

const writePRsToSpreadsheet = (userPRs) => {
  const prData = userPRs.map((pr) => ({
    "PR Number": pr.number,
    Title: pr.title,
    URL: pr.html_url,
    Labels: pr.labels,
    "Created At": pr.created_at,
    "Closed At": pr.closed_at,
    "Merged At": pr.merged_at,
    Merged: pr.merged_at ? "Yes" : "No",
    Size: pr.size,
    "Review Comments": pr.review_comments,
    Body: pr.body,
  }));

  const ws = xlsx.utils.json_to_sheet(prData, {
    header: [
      "PR Number",
      "Title",
      "URL",
      "Labels",
      "Created At",
      "Closed At",
      "Merged At",
      "Merged?",
      "Size",
      "Review Comments",
      "Body",
    ],
  });

  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "PRs");
  xlsx.writeFile(wb, `${repo}_${user}_PRs.xlsx`);
};

fetchPRs().then(writePRsToSpreadsheet);
