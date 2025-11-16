import { Octokit } from "@octokit/rest";

// Validate environment variables
if (!process.env.GITHUB_CLIENT_ID) {
  console.warn("⚠️ Warning: GITHUB_CLIENT_ID is missing.");
}
if (!process.env.GITHUB_CLIENT_SECRET) {
  console.warn("⚠️ Warning: GITHUB_CLIENT_SECRET is missing.");
}

// Base URL fallback
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// GitHub OAuth config
const githubConfig = {
  clientId: process.env.GITHUB_CLIENT_ID || "",
  clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  redirectUri:
    process.env.GITHUB_REDIRECT_URI ||
    `${BASE_URL}/api/github/callback`,
  scopes: ["repo", "user", "read:org"],
};

// Create authenticated Octokit client
const createOctokitClient = (accessToken) => {
  if (!accessToken) {
    throw new Error("GitHub access token is required to create Octokit client.");
  }

  return new Octokit({
    auth: accessToken,
  });
};

export { githubConfig, createOctokitClient };
