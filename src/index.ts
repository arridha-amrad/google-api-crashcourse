import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { google } from "googleapis";

const app = express();

const oauth2Client = new google.auth.OAuth2({
  clientId: process.env.G_ID,
  clientSecret: process.env.G_SE,
  redirectUri: process.env.G_CB,
});

const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});

app.get("/auth/google", (_, res) => {
  res.redirect(authorizationUrl);
});

app.get("/oauth2/callback/google", async (req, res) => {
  const { code } = req.query as { code: string };
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });

  const { data } = await oauth2.userinfo.get();

  return res.status(200).json({
    email: data.email,
    all: data,
  });
});

app.listen(5000, () => {
  console.log("Server running from port 5000 🚀🇵🇸");
});
