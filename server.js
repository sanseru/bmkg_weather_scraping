import express from "express";
import cors from "cors";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import forecastRoute from "./routers/forecastRoute.js";
import db from "./db.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());
app.use(forecastRoute);

const port = 3000;

// Set up local strategy
passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    function (username, password, done) {
      db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        function (err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false, {
              message: "Incorrect username or password.",
            });
          }
          crypto.pbkdf2(
            password,
            user.salt,
            310000,
            32,
            "sha256",
            function (err, hashedPassword) {
              if (err) {
                return cb(err);
              }
              if (
                !crypto.timingSafeEqual(user.hashed_password, hashedPassword)
              ) {
                return done(null, false, {
                  message: "Incorrect username or password.",
                });
              }
              return done(null, user);
            }
          );
        }
      );
    }
  )
);

// Set up JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "secret",
};

passport.use(
  new JwtStrategy(jwtOptions, function async(token, done) {
    console.log("in jwt strat. token: ", token.user._id);
    db.get(
      "SELECT id,username FROM users WHERE id = ?",
      [token.user._id],
      function (err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
      }
    );
    // User.findOne({ _id: jwt_payload.sub }, function (err, user) {
    //   if (err) {
    //     return done(err, false);
    //   }
    //   if (user) {
    //     return done(null, user);
    //   } else {
    //     return done(null, false);
    //   }
    // });
  })
);

// passport.use(
//   new JwtStrategy(
//     {
//       secretOrKey: "TOP_SECRET",
//       jwtFromRequest: getJwt,
//     },
//     async (token, done) => {
//       console.log("in jwt strat. token: ", token);

//       // 0. Don't even make it through the getJwt function check. NO token
//       // prints unauthorized.

//       // 0B. Invalid token: again doesn't make it into this function. Prints unauthorized

//       // 1. Makes it into this function but gets App error (displays error message.) no redirecting.
//       // We simulate an "application error" occurring in this function with an email of "tokenerror".
//       //
//       if (token?.user?.email == "tokenerror") {
//         let testError = new Error(
//           "something bad happened. we've simulated an application error in the JWTstrategy callback for users with an email of 'tokenerror'."
//         );
//         return done(testError, false);
//       }

//       if (token?.user?.email == "emptytoken") {
//         // 2. Some other reason for user to not exist. pass false as user:
//         // displays "unauthorized". Doesn't allow the app to hit the next function in the chain.
//         // We are simulating an empty user / no user coming from the JWT.
//         return done(null, false); // unauthorized
//       }

//       // 3. Successfully decoded and validated user:
//       // (adds the req.user, req.login, etc... properties to req. Then calls the next function in the chain.)
//       return done(null, token.user);
//     }
//   )
// );

app.post('/profile', passport.authenticate('jwt', { session: false }),
    function(req, res) {
        res.send(req.user);
    }
);

app.post(
  "/login",
  function (req, res, next) {
    console.log(req.body);
    passport.authenticate("login", async (err, user, info) => {
      console.log("err: ", err);
      console.log("user: ", user);
      // console.log("info: ", info);

      if (err) {
        return next(err);
      }

      if (!user) {
        return res.redirect(`/failed?message=${info.message}`);
      }

      // It doesn't seem like the req.login() does anything for us when using JWT.
      // I could be wrong though. You'll have to play around with it yourself.
      // req.login(user, { session: false }, async (error) => {
      // console.log("using req.login...");

      const body = { _id: user.id, username: user.username };

      const token = jwt.sign({ user: body }, "secret", { expiresIn: '120s' });

      // expiresIn: "10h" // it will be expired after 10 hours
      //expiresIn: "20d" // it will be expired after 20 days
      //expiresIn: 120 // it will be expired after 120ms
      //expiresIn: "120s" // it will be expired after 120s
      // console.log(token)

      var tokens = {
        token: token,
      };
      return res.send(tokens);
      // }); // this is the closing brackets for the req.login
    })(req, res, next);
  },
  (req, res, next) => {
    res.send("Hello"); // able to add functions after the authenticate call now.
  }
);

// Menjalankan server pada port tertentu
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
