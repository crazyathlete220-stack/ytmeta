'use strict';

const fs = require('fs');
const http = require('http');
const { URL } = require('url');
const { buildOAuthClient } = require('../youtube');
const { resolvePaths, SCOPES } = require('../config');

/**
 * Authenticate via the OAuth loopback flow.
 *
 * A short-lived local server captures the authorization code Google
 * redirects back with, so the user never has to copy/paste a code.
 * The resulting token (with refresh token) is written to the token path.
 */
async function login() {
  const { tokenPath } = resolvePaths();
  const port = Number(process.env.YTMETA_PORT) || 4796;
  const redirectUri = `http://localhost:${port}`;
  const oauth2Client = buildOAuthClient({ redirectUri });

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // force a refresh token even on re-auth
    scope: SCOPES,
  });

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url, redirectUri);
        const err = url.searchParams.get('error');
        const got = url.searchParams.get('code');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(
          err
            ? `<h2>Authentication failed: ${err}</h2><p>You can close this tab.</p>`
            : '<h2>Authenticated. You can close this tab.</h2>'
        );
        server.close();
        if (err) return reject(new Error(err));
        if (got) return resolve(got);
        reject(new Error('No authorization code returned.'));
      } catch (e) {
        reject(e);
      }
    });
    server.on('error', reject);
    server.listen(port, async () => {
      console.log('Opening your browser to authorize ytmeta...');
      console.log(`If it does not open, visit:\n${authUrl}\n`);
      try {
        const open = (await import('open')).default;
        await open(authUrl);
      } catch {
        // Browser auto-open failed; the printed URL is the fallback.
      }
    });
  });

  // Back up an existing token before overwriting.
  if (fs.existsSync(tokenPath)) {
    const backup = `${tokenPath}.${new Date().toISOString().replace(/[:.]/g, '-')}.bak`;
    fs.copyFileSync(tokenPath, backup);
    console.log(`Existing token backed up to ${backup}`);
  }

  const { tokens } = await oauth2Client.getToken(code);
  fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
  console.log(`\nAuthenticated. Token saved to ${tokenPath}`);
  console.log('You can now run the other commands.');
}

module.exports = login;
