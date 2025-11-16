import { createOctokitClient } from '../config/github.js';
import User from '../models/user.model.js';

// GitHub OAuth initiation
const initiateGitHubAuth = (req, res) => {
  const { clientId, redirectUri, scopes } = require('../config/github').githubConfig;
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}`;
  res.json({ authUrl });
};

// GitHub OAuth callback
const handleGitHubCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { clientId, clientSecret, redirectUri } = require('../config/github').githubConfig;

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description });
    }

    // Store access token in user session/database
    // For now, return token - in production, store securely
    res.json({
      success: true,
      accessToken: tokenData.access_token,
      message: 'GitHub authentication successful'
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Get user repositories
const getUserRepos = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const octokit = createOctokitClient(accessToken);

    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 10
    });

    res.json({
      success: true,
      repositories: data.map(repo => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updated_at: repo.updated_at
      }))
    });
  } catch (error) {
    console.error('Error fetching repos:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
};

// Get repository issues
const getRepoIssues = async (req, res) => {
  try {
    const { accessToken, owner, repo } = req.body;
    const octokit = createOctokitClient(accessToken);

    const { data } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      per_page: 10
    });

    res.json({
      success: true,
      issues: data.map(issue => ({
        number: issue.number,
        title: issue.title,
        body: issue.body,
        url: issue.html_url,
        state: issue.state,
        labels: issue.labels.map(label => label.name),
        created_at: issue.created_at,
        updated_at: issue.updated_at
      }))
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
};

// Get repository pull requests
const getRepoPullRequests = async (req, res) => {
  try {
    const { accessToken, owner, repo } = req.body;
    const octokit = createOctokitClient(accessToken);

    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state: 'open',
      per_page: 10
    });

    res.json({
      success: true,
      pullRequests: data.map(pr => ({
        number: pr.number,
        title: pr.title,
        body: pr.body,
        url: pr.html_url,
        state: pr.state,
        head: pr.head.ref,
        base: pr.base.ref,
        created_at: pr.created_at,
        updated_at: pr.updated_at
      }))
    });
  } catch (error) {
    console.error('Error fetching PRs:', error);
    res.status(500).json({ error: 'Failed to fetch pull requests' });
  }
};

// Create an issue
const createIssue = async (req, res) => {
  try {
    const { accessToken, owner, repo, title, body, labels } = req.body;
    const octokit = createOctokitClient(accessToken);

    const { data } = await octokit.issues.create({
      owner,
      repo,
      title,
      body,
      labels
    });

    res.json({
      success: true,
      issue: {
        number: data.number,
        title: data.title,
        url: data.html_url,
        state: data.state
      }
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
};

// Create a pull request
const createPullRequest = async (req, res) => {
  try {
    const { accessToken, owner, repo, title, body, head, base } = req.body;
    const octokit = createOctokitClient(accessToken);

    const { data } = await octokit.pulls.create({
      owner,
      repo,
      title,
      body,
      head,
      base
    });

    res.json({
      success: true,
      pullRequest: {
        number: data.number,
        title: data.title,
        url: data.html_url,
        state: data.state
      }
    });
  } catch (error) {
    console.error('Error creating PR:', error);
    res.status(500).json({ error: 'Failed to create pull request' });
  }
};

export {
  initiateGitHubAuth,
  handleGitHubCallback,
  getUserRepos,
  getRepoIssues,
  getRepoPullRequests,
  createIssue,
  createPullRequest
};
