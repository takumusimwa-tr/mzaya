// Central runtime-environment classification.
// Staging is an internet-facing deployed environment: it should use proxy-aware
// networking, restricted CORS, shared rate limits, SSL and structured logs just
// like production, while still allowing explicitly configured mock providers.
const name = String(process.env.NODE_ENV || 'development').trim().toLowerCase();

const isProduction = name === 'production';
const isStaging = name === 'staging';
const isTest = name === 'test';
const isDeployed = isProduction || isStaging;
const isDevelopment = !isDeployed && !isTest;

module.exports = {
  name,
  isProduction,
  isStaging,
  isTest,
  isDeployed,
  isDevelopment,
};
