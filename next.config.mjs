/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false;

let nextConfig = {};

if (isGithubActions) {
  // Get the repository name from the environment variable
  const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, '');
  nextConfig = {
    assetPrefix: `/${repo}`,
    basePath: `/${repo}`,
  };
}

export default nextConfig;
