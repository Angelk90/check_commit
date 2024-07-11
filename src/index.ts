import {
  getInput,
  setOutput,
  getMultilineInput,
  setFailed,
} from "@actions/core";

interface RepositoryItem {
  repository: string;
  commit: string;
  latestCommit: string;
}

async function getLatestCommit(repository: string): Promise<string> {
  const repo = repository
    .split("https://github.com/")
    .filter((item) => item !== "");
  const response = await fetch(`https://api.github.com/repos/${repo}/commits`);
  const commits = await response.json();
  if (commits.status === "404") return commits.message;
  return commits[0].sha;
}

async function checkCommits(): Promise<RepositoryItem[]> {
  const repositoriesWithoutLatestCommit = [];
  const list = getInput("list");

  const DATA: RepositoryItem[] = JSON.parse(list);

  for (const item of DATA) {
    const latestCommit = await getLatestCommit(item.repository);

    if (latestCommit !== item.commit) {
      repositoriesWithoutLatestCommit.push({
        repository: item.repository,
        commit: item.commit,
        latestCommit: latestCommit,
      });
    }
  }
  return repositoriesWithoutLatestCommit;
}

function createTable(array: RepositoryItem[]) {
  let table = "| repository | commit | latestCommit |\n|--|--|--|\n";

  array.forEach((entry) => {
    table += `| ${entry.repository} | ${entry.commit} | ${entry.latestCommit} |\n`;
  });

  return table;
}

function generateUniqueCode(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uniqueCode = "";
  for (let i = 0; i < length; i++) {
    uniqueCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return uniqueCode;
}

checkCommits()
  .then((repositories) => {
    setOutput("json", JSON.stringify(repositories, null, 2));
    setOutput("table", createTable(repositories));
    setOutput("code", generateUniqueCode(40));
  })
  .catch((error) => {
    console.error("Si è verificato un errore:", error);
  });
