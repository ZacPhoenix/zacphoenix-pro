#!/usr/bin/env node
// Get a Linear OAuth access token that acts AS THE APP (actor=app), so agents
// have their own identity instead of using your personal login.
//
// Prereqs:
//   1. Create an OAuth application in Linear (Settings -> API -> OAuth
//      applications). See ../scripts/README.md for exact steps.
//   2. Add this exact redirect/callback URL to the app:  http://localhost:8787/callback
//   3. Copy the app's Client ID and Client secret.
//
// Usage:
//   LINEAR_CLIENT_ID=xxx LINEAR_CLIENT_SECRET=yyy node linear-app-token.mjs
//
// It prints an authorize URL, waits for you to approve in the browser, catches
// the callback, exchanges the code, and prints the app access token.
//
// Requires Node 18+ (uses built-in fetch). No npm install needed.

import http from "node:http";
import crypto from "node:crypto";

const CLIENT_ID = process.env.LINEAR_CLIENT_ID;
const CLIENT_SECRET = process.env.LINEAR_CLIENT_SECRET;
const PORT = Number(process.env.PORT || 8787);
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

// `write` covers issue/comment mutations; add granular scopes if you prefer.
const SCOPES = process.env.LINEAR_SCOPES || "read,write";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing env. Run:\n  LINEAR_CLIENT_ID=xxx LINEAR_CLIENT_SECRET=yyy node linear-app-token.mjs",
  );
  process.exit(1);
}

const state = crypto.randomBytes(16).toString("hex");

const authorizeUrl =
  "https://linear.app/oauth/authorize?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPES,
    state,
    prompt: "consent",
    actor: "app", // <-- the important bit: act as the app, not as you
  }).toString();

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.url.startsWith("/callback")) {
    res.writeHead(404).end("Not found");
    return;
  }
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    res.writeHead(400).end(`Authorization failed: ${error}`);
    console.error("Authorization failed:", error);
    server.close();
    process.exit(1);
  }
  if (returnedState !== state) {
    res.writeHead(400).end("State mismatch — aborting.");
    console.error("State mismatch — possible CSRF. Aborting.");
    server.close();
    process.exit(1);
  }

  try {
    const tokenRes = await fetch("https://api.linear.app/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
        code: code || "",
      }).toString(),
    });
    const data = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(JSON.stringify(data));
    }

    res
      .writeHead(200, { "Content-Type": "text/plain" })
      .end("Done. You can close this tab and return to the terminal.");

    console.log("\n=== Linear app access token (actor=app) ===\n");
    console.log(data.access_token);
    console.log("\nScopes:", data.scope);
    console.log("Token type:", data.token_type);
    console.log(
      "\nStore this as a SECRET (e.g. LINEAR_APP_TOKEN) for your self-hosted",
      "MCP. Do NOT commit it.\n",
    );
  } catch (e) {
    res.writeHead(500).end("Token exchange failed — see terminal.");
    console.error("Token exchange failed:", e.message);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(PORT, () => {
  console.log("\n1) Open this URL in your browser and approve:\n");
  console.log(authorizeUrl);
  console.log(`\n2) Waiting for the callback on ${REDIRECT_URI} ...\n`);
});
