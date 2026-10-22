import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import argon2 from "argon2";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

// ============================================================
// DATABASE SETUP
// ============================================================

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "coveblog",
  password: process.env.DB_PASSWORD,
  port: 5433,
});

db.connect();

// INITIALIZE POSTGRESQL SESSION STORE CLASS
const PgSession = connectPgSimple(session);

// CREATE POSTGRESQL SESSION STORE
const sessionStore = new PgSession({
  conObject: {
    user: "postgres",
    host: "localhost",
    database: "coveblog",
    password: process.env.DB_PASSWORD,
    port: 5433
  },
  createTableIfMissing: true
});

// ============================================================
// EXPRESS SETUP & MIDDLEWARE
// ============================================================

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// CONFIGURE LOGIN SESSIONS MIDDLEWARE
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

// MAKE AUTHENTICATED USER AVAILABLE TO EJS
app.use(async (req, res, next) => {
  res.locals.currentUser = null;

  if (!req.session.userId) {
    return next();
  }

  try {
    const result = await db.query(
      "SELECT id, username, role FROM users WHERE id = $1",
      [req.session.userId]
    );

    if (result.rows.length > 0) {
      res.locals.currentUser = result.rows[0];
    }

    next();
  } catch (error) {
    next(error);
  }
});



// ============================================================
// GET ROUTES
// ============================================================

// HOMEPAGE
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM posts ORDER BY created_at DESC");

    res.render("blog-web-app.ejs", {
      posts: result.rows,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).render("500.ejs");
  }
});

// REGISTRATION PAGE
app.get("/register", (req, res) => {
  res.render("register.ejs", { error: null });
});

// LOGIN PAGE
app.get("/login", (req, res) => {
  res.render("login.ejs", { error: null });
});

// ABOUT PAGE
app.get("/about", (req, res) => {
  res.render("about.ejs");
});

// CREATE POST PAGE
app.get("/create", (req, res) => {
  // TITLE AND CONTENT KEEP CONSISTENCY FOR POST REQUEST
  res.render("create-post.ejs", {
    error: null,
    title: "",
    content: "",
  });
});

// VIEW INDIVIDUAL POST
app.get("/posts/:id", async (req, res) => {
  // VALIDATE POST ID
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(404).render("404.ejs");
  }

  try {
    const result = await db.query("SELECT * FROM posts WHERE id=$1", [id]);

    // FIRST AND ONLY ROW IN RESULT QUERY
    const post = result.rows[0];

    if (post === undefined) {
      res.status(404).render("404.ejs");
      return;
    }

    res.render("post.ejs", { post: post });
  } catch (error) {
    console.error("Error viewing post:", error);
    res.status(500).render("500.ejs");
  }
});

// EDIT POST PAGE
app.get("/posts/:id/edit", async (req, res) => {
  // VALIDATE POST ID
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(404).render("404.ejs");
  }

  try {
    // FETCH POST
    const result = await db.query("SELECT * FROM posts WHERE id=$1", [id]);
    const post = result.rows[0];

    if (post === undefined) {
      res.status(404).render("404.ejs");
      return;
    }

    // PRESERVE ORIGINAL POST TITLE AND CONTENT
    res.render("edit-post.ejs", {
      post: post,
      error: null,
      title: post.title,
      content: post.content,
    });
  } catch (error) {
    console.error("Error editing post:", error);
    res.status(500).render("500.ejs");
  }
});

// ============================================================
// POST ROUTES
// ============================================================

// WHEN USER REGISTRATION IS ATTEMPTED
app.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // VALIDATE INPUT TYPES
  if (
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return res.status(400).render("register.ejs", {
      error: "Invalid registration information.",
    });
  }

  // VALIDATE USERNAME LENGTH
  const cleanUsername = username.trim();

  if (cleanUsername.length < 3 || cleanUsername.length > 30) {
    return res.status(400).render("register.ejs", {
      error: "Username must be between 3 and 30 characters.",
    });
  }

  // VALIDATE EMAIL FORMAT
  const cleanEmail = email.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (cleanEmail.length > 255 || !emailPattern.test(cleanEmail)) {
    return res.status(400).render("register.ejs", {error: "Please enter a valid email address."});
  }

  // VALIDATE PASSWORD LENGTH
  if (password.length < 12 || password.length > 128) {
    return res.status(400).render("register.ejs", {error: "Password must be between 12 and 128 characters."});
  }

  // CONFIRM PASSWORDS MATCH
  if (password !== confirmPassword) {
    return res.status(400).render("register.ejs", {error: "Passwords do not match.",});
  }

  // HASH PASSWORD USING ARGON AND CREATE USER
  try {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    });

    // SAVE USER TO DATABASE
    await db.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)",
      [cleanUsername, cleanEmail, passwordHash]
    );

    res.redirect("/");
  } catch (error) {

    // HANDLE DUPLICATE USERNAME OR EMAIL
    if (error.code === "23505") {
      return res.status(409).render("register.ejs", {error: "Username or email is already registered."});
    }

    console.error("Error registering user:", error);
    res.status(500).render("500.ejs");
  }
});

// WHEN USER LOGIN IS ATTEMPTED
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // VALIDATE INPUT TYPES (rare for this to matter)
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).render("login.ejs", {error: "Invalid login information."});
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // VALIDATE EMAIL FORMAT
  if (!emailPattern.test(cleanEmail)) {
    return res.status(400).render("login.ejs", {error: "Please enter a valid email address."});
  }




  // ATTEMPT LOGIN
  try {
    // QUERY TO GET ID AND PASSWORD_HASH FROM USERS TABLE
    const result = await db.query(
      "SELECT id, password_hash FROM users WHERE email = $1",
      [cleanEmail]
    );

    // IF EMAIL IS NOT REGISTERED ERROR
    if (result.rows.length === 0) {
      return res.status(401).render("login.ejs", {error: "Invalid email or password."});
    }

    // RETRIEVE THE USER'S ID AND PASSWORD HASH
    const user = result.rows[0];

    // CHECK IF USER HAS A PASSWORD
    if (user.password_hash === null) {
      return res.status(401).render("login.ejs", { error: "Invalid email or password." });
    }

    // VERIFY USER'S PASSWORD
    const passwordMatches = await argon2.verify(user.password_hash, password);

    // IF PASSWORD IS WRONG ERROR
    if (!passwordMatches) {
      return res.status(401).render("login.ejs", {error: "Invalid email or password."});
    }

    // CREATE A NEW SESSION AFTER SUCCESSFUL LOGIN (NO EMAIL OR PASSWORD ERRORS)
    req.session.regenerate((error) => {
      if (error) {
        console.error("Error regenerating session:", error);
        return res.status(500).render("500.ejs");
      }

      // STORE AUTHENTICATED USER ID IN THE SESSION
      req.session.userId = user.id;

      // SAVE SESSION BEFORE REDIRECTING
      req.session.save((error) => {
        if (error) {
          console.error("Error saving session:", error);
          return res.status(500).render("500.ejs");
        }

        res.redirect("/");
      });
    });



  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).render("500.ejs");
  }
});

// WHEN USER LOGS OUT
app.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Error logging out user:", error);
      return res.status(500).render("500.ejs");
    }

    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

// CREATE POST
app.post("/create", async (req, res) => {

  // REQUIRE USER TO BE LOGGED IN
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const title = req.body.title;
  const content = req.body.content;

  // CHECK FIELDS ARE OF TYPE STRING
  if (typeof title !== "string" || typeof content !== "string") {
    return res.status(400).render("create-post.ejs", { error: "Invalid post information.", title: "", content: "" });
  }

  // CHECK FIELDS ARE NOT EMPTY
  if (title.trim() === "" || content.trim() === "") {
    return res.render("create-post.ejs", {
      error: "Title and content are required.",
      title: title,
      content: content,
    });
  }

  // SAVE POST TO DATABASE
  try {
    // CONNECTS CREATED POST TO THE LOGGED ON USER
    await db.query(
      "INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3)",
      [title, content, req.session.userId]
    );

    // REDIRECT TO HOMEPAGE
    res.redirect("/");
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).render("500.ejs");
  }
});

// EDIT POST
app.post("/posts/:id/edit", async (req, res) => {
  // VALIDATE POST ID
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(404).render("404.ejs");
  }

  try {
    // FETCH POST
    const result = await db.query("SELECT * FROM posts WHERE id=$1", [id]);
    const post = result.rows[0];

    // CHECK IF POST EXISTS
    if (post === undefined) {
      res.status(404).render("404.ejs");
      return;
    }

    // GET UPDATED TITLE AND CONTENT FROM FORM
    let title = req.body.title;
    let content = req.body.content;

    // VALIDATE REQUIRED POST FIELDS
    if (title.trim() === "" || content.trim() === "") {
      return res.render("edit-post.ejs", {
        post: post,
        error: "Title and content are required.",
        title: title,
        content: content,
      });
    }

    // UPDATE POST IN DATABASE
    await db.query(
      "UPDATE posts SET title=$1, content=$2 WHERE id=$3 ",
      [req.body.title, req.body.content, id]
    );

    // REDIRECT TO UPDATED POST
    res.redirect("/posts/" + id);
  } catch (error) {
    console.error("Error editing post:", error);
    res.status(500).render("500.ejs");
  }
});

// DELETE POST
app.post("/posts/:id/delete", async (req, res) => {
  // VALIDATE POST ID
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(404).render("404.ejs");
  }

  try {
    // DELETE POST FROM DATABASE
    const result = await db.query("DELETE FROM posts WHERE id=$1", [id]);

    // CHECK IF POST EXISTS
    if (result.rowCount === 0) {
      return res.status(404).render("404.ejs");
    }

    // REDIRECT TO HOMEPAGE
    res.redirect("/");
  } catch (error) {
    console.log("Error deleting post:", error);
    res.status(500).render("500.ejs");
  }
});

// ============================================================
// ERROR HANDLING
// ============================================================

// HANDLE UNRECOGNIZED ROUTES
app.use((req, res) => {
  res.status(404).render("404.ejs");
});

// ============================================================
// START SERVER
// ============================================================

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});