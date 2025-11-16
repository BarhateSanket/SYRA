import { githubConfig, createOctokitClient } from "../config/github.js";
import User from "../models/user.model.js";

/* -----------------------------------------------------
   1. Initiate OAuth ( Step 1 )
----------------------------------------------------- */
export const initiateGitHubAuth = (req, res) => {
  try {
    const { clientId, redirectUri, scopes } = githubConfig;

    const authUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&scope=${scopes.join("%20")}`;

    res.json({ success: true, authUrl });
  } catch (error) {
    console.error("GitHub OAuth init error:", error);
    res.status(500).json({ error: "Failed to initiate GitHub login" });
  }
};

/* -----------------------------------------------------
   2. Handle OAuth Callback (Step 2)
----------------------------------------------------- */
export const handleGitHubCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { clientId, clientSecret, redirectUri } = githubConfig;

    if (!code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({
        success: false,
        error: tokenData.error_description || "OAuth exchange failed",
      });
    }

    return res.json({
      success: true,
      accessToken: tokenData.access_token,
      message: "GitHub authentication successful",
    });
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

/* -----------------------------------------------------
   3. Get Authenticated User's Repositories
----------------------------------------------------- */
export const getUserRepos = async (req, res) => {
  try {
    const { accessToken } = req.body;

    const octokit = createOctokitClient(accessToken);

    const response = await octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 10,
    });

    res.json({
      success: true,
      repositories: response.data.map((repo) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updated_at: repo.updated_at,
      })),
    });
  } catch (error) {
    console.error("GitHub repo fetch error:", error);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
};

/* -----------------------------------------------------
   4. Get Repository Issues
----------------------------------------------------- */
export const getRepoIssues = async (req, res) => {
  try {
    const { accessToken, owner, repo } = req.body;

    const octokit = createOctokitClient(accessToken);

    const response = await octokit.issues.listForRepo({
      owner,
      repo,
      state: "open",
      per_page: 10,
    });

    res.json({
      success: true,
      issues: response.data.map((issue) => ({
        number: issue.number,
        title: issue.title,
        body: issue.body,
        url: issue.html_url,
        state: issue.state,
        labels: issue.labels.map((l) => l.name),
        created_at: issue.created_at,
        updated_at: issue.updated_at,
      })),
    });
  } catch (error) {
    console.error("GitHub issue fetch error:", error);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
};

/* -----------------------------------------------------
   5. Get Repository Pull Requests
----------------------------------------------------- */
export const getRepoPullRequests = async (req, res) => {
  try {
    const { accessToken, owner, repo } = req.body;

    const octokit = createOctokitClient(accessToken);

    const response = await octokit.pulls.list({
      owner,
      repo,
      state: "open",
      per_page: 10,
    });

    res.json({
      success: true,
      pullRequests: response.data.map((pr) => ({
        number: pr.number,
        title: pr.title,
        body: pr.body,
        url: pr.html_url,
        state: pr.state,
        head: pr.head.ref,
        base: pr.base.ref,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
      })),
    });
  } catch (error) {
    console.error("GitHub PR fetch error:", error);
    res.status(500).json({ error: "Failed to fetch pull requests" });
  }
};

/* -----------------------------------------------------
   6. Create a GitHub Issue
----------------------------------------------------- */
export const createIssue = async (req, res) => {
  try {
    const { accessToken, owner, repo, title, body, labels } = req.body;

    const octokit = createOctokitClient(accessToken);

    const response = await octokit.issues.create({
      owner,
      repo,
      title,
      body,
      labels,
    });

    res.json({
      success: true,
      issue: {
        number: response.data.number,
        title: response.data.title,
        url: response.data.html_url,
        state: response.data.state,
      },
    });
  } catch (error) {
    console.error("GitHub create issue error:", error);
    res.status(500).json({ error: "Failed to create issue" });
  }
};

/* -----------------------------------------------------
   7. Create Pull Request
----------------------------------------------------- */
export const createPullRequest = async (req, res) => {
  try {
    const { accessToken, owner, repo, title, body, head, base } = req.body;

    const octokit = createOctokitClient(accessToken);

    const response = await octokit.pulls.create({
      owner,
      repo,
      title,
      body,
      head,
      base,
    });

    res.json({
      success: true,
      pullRequest: {
        number: response.data.number,
        title: response.data.title,
        url: response.data.html_url,
        state: response.data.state,
      },
    });
  } catch (error) {
    console.error("GitHub create PR error:", error);
    res.status(500).json({ error: "Failed to create pull request" });
  }
};
