const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
const helmet = require("helmet");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
const cookieSession = require("cookie-session");

require("dotenv").config();

const PORT = 3000;

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

const AUTH_OPTIONS = {
  callbackURL: "/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

const regenerate = (callback) => {
  console.log("regenerating");
  callback();
};
const save = (callback) => {
  console.log("saving");
  callback();
};

function verifyCallback(accessToken, refreshToken, profile, done) {
  //console.log("Google profile", profile);
  done(null, profile);
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

// Save session to cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Read the session from cookie
passport.deserializeUser((id, done) => {
  done(null, id);
});

const app = express();

/** Middlewares */
app.use(helmet());
app.use(
  cookieSession({
    name: "session",
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
app.use(passport.initialize());
// passport fix for regenerate and save
app.use((req, res, next) => {
  req.session.regenerate = regenerate;
  req.session.save = save;
  next();
});
app.use(passport.session());

function checkLoggedIn(req, res, next) {
  const isLoggedIn = req.isAuthenticated() && req.user;
  if (!isLoggedIn) {
    return res.status(401).json({
      error: "You must log in to continue",
    });
  }
  next();
}

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
    session: true,
  }),
  (req, res) => {
    res.send("Google called us back!");
  }
);

app.get("/auth/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/secret", checkLoggedIn, (req, res) => {
  return res.send("This is a secret: 42");
});

app.get("/failure", (req, res) => {
  return res.send("Failed to log in");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

https
  .createServer(
    {
      key: fs.readFileSync("./key.pem"),
      cert: fs.readFileSync("./cert.pem"),
    },
    app
  )
  .listen(PORT, () => {
    console.log(`server running on port ${PORT}...`);
  });
