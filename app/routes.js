const { ObjectId } = require("mongodb");
const user = require("./models/user");

module.exports = function (app, passport, db) {
  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get("/", async function (req, res) {
    res.render("index.ejs");
  });
  // app.get('/deleteAll', function(req, res) {
  //     res.render('profile.ejs');
  // });

  // PROFILE SECTION =========================
  app.get("/profile", isLoggedIn, function (req, res) {
    var logs = db.collection("logs").find().toArray();
    var user = req.user;
    var notifications = db
      .collection("notifications")
      .find({
        user_id: req.user._id,
      })
      .toArray();
    res.render("profile.ejs", {
      user,
      logs,
      notifications,
    });
  });

  //   app.get('/updateForm', isLoggedIn, function(req, res) {
  //     db.collection('messages').find().toArray((err, result) => {
  //       if (err) return console.log(err)
  //       res.render('update.ejs', {
  //         user : req.user,
  //         messages: result
  //       })
  //     })
  // });

  app.get("/ourProfile", isLoggedIn, async function (req, res) {
    var logs = await db.collection("logs").find().toArray();
    var user = req.user;
    var notifications = await db
      .collection("notifications")
      .find({
        user_id: req.user._id,
      })
      .toArray();
    res.render("ourProfile.ejs", {
      user,
      logs,
      notifications,
    });
  });

  app.get("/contents", isLoggedIn, function (req, res) {
    db.collection("logs")
      .find()
      .toArray((err, result) => {
        if (err) return console.log(err);
        res.render("contents.ejs", {
          user: req.user,
          logs: result,
        });
      });
  });

  app.get("/photos", isLoggedIn, function (req, res) {
    db.collection("lines")
      .find()
      .toArray((err, result) => {
        if (err) return console.log(err);
        res.render("photos.ejs", {
          user: req.user,
          logs: result,
        });
      });
  });

  app.get("/userProfile", isLoggedIn, function (req, res) {
    if (req.user.local.superStarLog) {
      // find the user's superStarLog and make it available to the thing that renders it (user profile.ejs) and find all the user's logs and make that list available to userProfile.ejs to populate the pull down list
      // db.collection('logs').findOne({'_id': req.user.local.superStarLog},(err, result)) => {
    }
    db.collection("users")
      .find()
      .toArray((err, result) => {
        if (err) return console.log(err);
        res.render("userProfile.ejs", {
          user: req.user,
        });
      });
  });

  // app.get('/ourLogs', isLoggedIn, function(req, res) {
  //   db.collection('logs').find({logUserEmail: req.user.local.email}).toArray((err, result) => {
  //     if (err) return console.log(err)
  //     const randomLog =  result[Math.floor(Math.random()*result.length)]
  //     res.render('ourLogs.ejs', {
  //       user : req.user,
  //       log: randomLog
  //     })
  //   })
  // });

  app.get("/ourLogs", isLoggedIn, async function (req, res) {
    // db.collection("logs")
    //   // .find()
    //   // .toArray((err, result) => {
    //   //   if (err) return console.log(err);
    //   //   console.log(result);
    //   //   console.log("these are all the logs");
    //   //   console.log(req.user.local.email);
    //   //   console.log("check out the emails");
    //   //   const filteredLogs = result.filter(
    //   //     (log) => log.logUserEmail !== req.user.local.email
    //   //   );
    //   //   console.log("these are the filtered logs");
    //   //   console.log(filteredLogs);
    //   //   const randomLog =
    //   //     filteredLogs[Math.floor(Math.random() * filteredLogs.length)];
    //   //   res.render("ourLogs.ejs", {
    //   //     user: req.user,
    //   //     log: randomLog,
    //   //   });
    //   // });
    var logs = await db.collection("logs").find().toArray();
    console.log(logs);
    const filteredLogs = logs.filter(
      (log) => log.logUserEmail !== req.user.local.email
    );
    // console.log("these are the filtered logs");
    // console.log(filteredLogs);
    const log = filteredLogs[Math.floor(Math.random() * filteredLogs.length)];
    var user = req.user;
    var notifications = db
      .collection("notifications")
      .find({
        user_id: req.user._id,
      })
      .toArray();
    res.render("ourLogs.ejs", {
      user,
      log,
      notifications,
    });
  });
  // LOGOUT ==============================
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // ----------------- upload page

  app.get("/uploadLog", isLoggedIn, function (req, res) {
    // db.collection('users').find().
    db.collection("logs")
      .find()
      .toArray((err, result) => {
        if (err) return console.log(err);
        res.render("uploadLog.ejs", {
          user: req.user,
          logs: result,
        });
      });
  });

  // message board routes ===============================================================

  app.post("/postLog", async (req, res) => {
    console.log("this is body", req.body);
    console.log("this is user", req.user);
    await db.collection("logs").save(
      {
        // user: req.body.local.email,
        title: req.body.title,
        time: req.body.time,
        bg: req.body.bg,
        boost: req.body.boost,
        other: req.body.other,
        logUser: req.user._id,
        logUserEmail: req.user.local.email,
      },
      (err, result) => {
        if (err) return console.log(err);
        console.log("saved to database");
      }
    );
    var followers = await db
      .collection("follows")
      .find({
        followed_id: req.user._id.toString(),
      })
      .toArray();
      console.log("these are the followers")
      console.log(followers)
    var notifications = followers.map((follower) => {
      return {
        user_id: follower.follower_id,
        message: `${req.user.local.name} updated their journal!`,
        viewed: false,
        timestamp: new Date(),
      };
    });
    console.log(notifications)
    if (notifications.length > 0) {
      await db.collection("notifications").insertMany(notifications, {
        ordered: true,
      });
    }
    res.redirect("/uploadLog");
  });

  app.post("/update", (req, res) => {
    db.collection("users").findOneAndUpdate(
      {
        _id: ObjectId(req.user._id),
      },
      {
        $set: {
          local: {
            email: req.body.email,
            password: req.user.local.password,
          },
        },
      },
      {
        upsert: false,
      },
      (error, result) => {
        if (error) return console.log(error);
        console.log("save to database");
        res.redirect("/profile");
      }
    );
  });

  app.delete("/deleteLog", (req, res) => {
    db.collection("logs").findOneAndDelete(
      { _id: ObjectId(req.body._id) },
      (err, result) => {
        if (err) return res.send(500, err);
        res.send("delete");
      }
    );
  });

  // FOLLOW ROUTES

  app.post("/follows", async (req, res) => {
    await db.collection("follows").save(
      {
        followed_id: req.body.followed_id,
        follower_id: req.user._id.toString(),
      },
      (err, result) => {
        if (err) return console.log(err);
        console.log("saved to database");
      }
    );
    var follows = await db.collection("follows").find().toArray()
    console.log(follows)
    res.send(200);
  });

  // NOTIFICATIONS ROUTES

  app.get("/notifications", isLoggedIn, async function (req, res) {
    var logs = await db.collection("logs").find().toArray();
    var user = req.user;
    var notifications = await db
      .collection("notifications")
      .find({
        user_id: req.user._id,
      })
      .toArray();
    res.render("notifications.ejs", {
      user,
      logs,
      notifications,
    });
  });

  // FOLLOWED JOURNAL

  app.get("/followedLog", isLoggedIn, async function (req, res) {
    var user = req.user;
    var notifications = await db
      .collection("notifications")
      .find({
        user_id: req.user._id,
      })
      .toArray();
      var following = await db
        .collection("follows")
        .find({
          follower_id: req.user._id.toString(),
        }).toArray();
      var following_ids = following.map((follow)=> new ObjectId(follow.followed_id))
      var logs = await db.collection("logs")
      .find({
        logUser: {$in: following_ids}}).toArray();
    console.log(logs)
    console.log(following_ids)
    res.render("followedLog.ejs", {
      user,
      logs,
      notifications,
    });
  });

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get("/login", function (req, res) {
    res.render("login.ejs", { message: req.flash("loginMessage") });
  });

  // process the login form
  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/profile", // redirect to the secure profile section
      failureRedirect: "/login", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );

  // SIGNUP =================================
  // show the signup form
  app.get("/signup", function (req, res) {
    res.render("signup.ejs", { message: req.flash("signupMessage") });
  });

  // process the signup form
  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/profile", // redirect to the secure profile section
      failureRedirect: "/signup", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get("/unlink/local", isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect("/profile");
    });
  });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();

  res.redirect("/");
}
