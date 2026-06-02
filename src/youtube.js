'use strict';

const fs = require('fs');
const { google } = require('googleapis');
const { resolvePaths } = require('./config');

/**
 * Read the OAuth client secret. Supports both "installed" (Desktop app)
 * and "web" client types, since Google exports either shape.
 */
function readClientSecret(credentialsPath) {
  if (!fs.existsSync(credentialsPath)) {
    throw new Error(
      `OAuth client secret not found at ${credentialsPath}.\n` +
        `Download it from Google Cloud Console (OAuth client, type "Desktop app")\n` +
        `and place it there, or set YTMETA_CREDENTIALS.`
    );
  }
  const raw = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  const node = raw.installed || raw.web;
  if (!node) {
    throw new Error(
      `Unrecognized client secret format in ${credentialsPath} (expected "installed" or "web").`
    );
  }
  return node;
}

/**
 * Build an OAuth2 client from the saved client secret, optionally with a
 * specific redirect URI (used by the login loopback flow).
 */
function buildOAuthClient({ redirectUri } = {}) {
  const { credentialsPath } = resolvePaths();
  const { client_id, client_secret, redirect_uris } = readClientSecret(credentialsPath);
  return new google.auth.OAuth2(
    client_id,
    client_secret,
    redirectUri || (redirect_uris && redirect_uris[0])
  );
}

/**
 * Return an authenticated YouTube Data API client. Throws a clear error if
 * the user has not run `ytmeta login` yet.
 */
function getYouTubeClient() {
  const { tokenPath } = resolvePaths();
  if (!fs.existsSync(tokenPath)) {
    throw new Error(`Not authenticated. Run "ytmeta login" first (no token at ${tokenPath}).`);
  }
  const auth = buildOAuthClient();
  auth.setCredentials(JSON.parse(fs.readFileSync(tokenPath, 'utf8')));
  return google.youtube({ version: 'v3', auth });
}

module.exports = { buildOAuthClient, getYouTubeClient };
