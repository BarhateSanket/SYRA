import { Octokit } from '@octokit/rest';

const githubConfig = {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  redirectUri: process.env.GITHUB_REDIRECT_URI || `${process.env.BASE_URL}/api/github/callback`,
  scopes: ['repo', 'user', 'read:org']
};

const createOctokitClient = (accessToken) => {
  return new Octokit({
    auth: accessToken
  });
};

export {
  githubConfig,
  createOctokitClient
};
