# GitHub PR Fetcher 

This is a simple Node.js script to automatically fetch Pull Request (PR) data from a specific GitHub repository, and export the data to an Excel spreadsheet. 

## Prerequisites

Before you begin, ensure you have met the following requirements:

* You have installed Node.js and npm. If not, follow the instructions from this link: [Node.js](https://nodejs.org/en/download/).
* You have a GitHub API token. Follow these instructions to generate one: [Creating a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

## Setup and Installation

1. Clone this repository to your local system
```
git clone <repository-url>
```
2. Navigate into the project directory, and install the required packages
```
cd <project-dir>
npm install
```

## Environment Variables

To run this project, you need to add the following environment variables in a `.env` file in your project directory.

```
REPO_NAME=your_repo_name
ORGANISATION_NAME=your_organisation_name
GITHUB_API_TOKEN=your_github_api_token
USERNAME=github_username
```

Replace the placeholder values (e.g., `your_repo_name`) with actual values. Note that:
* `REPO_NAME` is the name of the repository from which you want to fetch PRs
* `ORGANISATION_NAME` is the name of the organization that the repository belongs to
* `GITHUB_API_TOKEN` is your personal GitHub API token
* `USERNAME` is your GitHub username, PRs from this user will be fetched

## Run the Script

After setting up, run the following command to fetch and store the PR data:

```
node filename.js
```

Replace `filename.js` with the actual filename of the script. 

The script will fetch the PR data and save it to an Excel spreadsheet named `{repo}_{user}_PRs.xlsx`. 

Quick tip: you can use the "HYPERLINK=(url, label)" function on excel if you want to combine the `Title` and `URL` columns in the sheet.

## Contributing

If you want to contribute to this project, feel free to fork the repository, make your changes and create a pull request. Contributions are always welcomed
