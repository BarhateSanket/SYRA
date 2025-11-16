import express from 'express';
import {
  initiateGitHubAuth,
  handleGitHubCallback,
  getUserRepos,
  getRepoIssues,
  getRepoPullRequests,
  createIssue,
  createPullRequest
} from '../controllers/github.controller.js';

const router = express.Router();

// GitHub OAuth routes
router.get('/auth', initiateGitHubAuth);
router.get('/callback', handleGitHubCallback);

// GitHub API routes
router.post('/repos', getUserRepos);
router.post('/issues', getRepoIssues);
router.post('/pulls', getRepoPullRequests);
router.post('/create-issue', createIssue);
router.post('/create-pr', createPullRequest);

export default router;
