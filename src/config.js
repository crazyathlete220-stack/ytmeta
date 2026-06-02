'use strict';

const path = require('path');

/**
 * Resolve file paths for OAuth credentials and the saved token.
 *
 * Both can be overridden with environment variables so the tool never
 * hard-codes a location:
 *   YTMETA_CREDENTIALS  path to the Google OAuth client secret JSON
 *   YTMETA_TOKEN        path where the access/refresh token is stored
 *
 * Defaults point at the current working directory, which keeps secrets
 * out of the package and lets each user keep their own files locally.
 */
function resolvePaths() {
  const cwd = process.cwd();
  return {
    credentialsPath:
      process.env.YTMETA_CREDENTIALS || path.join(cwd, 'client_secret.json'),
    tokenPath: process.env.YTMETA_TOKEN || path.join(cwd, 'token.json'),
  };
}

// Scopes required across all commands. force-ssl is needed to post comments.
const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl',
];

module.exports = { resolvePaths, SCOPES };
