import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

// POSTGRES DATABASE SETUP
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "codeblog",
  password: process.env.DB_PASSWORD,
  port: 5433,
});

db.connect();

const app = express();
const port = 3000;

// MIDDLEWARE
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// HOMEPAGE GET
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM posts ORDER BY created_at DESC");

    res.render("blog-web-app.ejs", {
      posts: result.rows
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).render("500.ejs");
  }
});


// GET ABOUT PAGE
app.get("/about", (req, res) => {
  res.render("about.ejs");
});

// CREATE POST GET
app.get("/create", (req, res) => {
    res.render("create-post.ejs", {error: null, title: "", content: ""}); // TITLE AND CONTENT KEEP CONSISTENCY FOR POST REQUEST
});


// GET POST VIEWING PAGE FOR EACH POST
app.get("/posts/:id", async (req, res) => {

  // CHECKS CASES WHERE ID IS NOT AN INTEGER (NAN)
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(404).render("404.ejs");
  }

  try {
    const result = await db.query("SELECT * FROM posts WHERE id=$1", [id]);

    const post = result.rows[0]; // POST === FIRST (AND ONLY) ROW IN RESULT QUERY

    if (post === undefined) {
      res.status(404).render("404.ejs");
      return;
    }

    res.render("post.ejs", {post: post});

    

  } catch (error) {
    console.error("Error viewing post:", error);
    res.status(500).render("500.ejs");
  }
});



// GET EDIT PAGES FOR EACH POST
app.get("/posts/:id/edit", async (req, res) => {

  // CHECKS CASES WHERE ID IS NOT AN INTEGER (NAN)
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(404).render("404.ejs");
  }

  try {

    // GETS POST
    const result = await db.query("SELECT * FROM posts WHERE id=$1", [id]);
    const post = result.rows[0]; // POST === FIRST (AND ONLY) ROW IN RESULT QUERY

    if (post === undefined) {
      res.status(404).render("404.ejs");
      return;
    }

    res.render("edit-post.ejs", {
      post: post,
      error: null,
      title: post.title,
      content: post.content // SENDS AND SAVES ORIGINAL POST TITLE AND CONTENT FOR PLACEHOLDER
    });

  } catch (error) {
    console.error("Error editing post:", error);
    res.status(500).render("500.ejs");
  }
});











// CREATE POST
app.post("/create", async (req, res) => {

  const title = req.body.title;
  const content = req.body.content;

  if (title.trim() === "" || content.trim() === "") { // CHECK IF POST FIELDS ARE EMPTY (SPACES DON'T COUNT DUE TO TRIM())
    return res.render("create-post.ejs", {
      error: "Title and content are required.", // RETURNS CREATE POST PAGE BACK WITH AN ERROR MESSAGE ADDED (ERROR STRING IS PASSED IN)
      title: title,
      content: content // KEEPS FIELDS TO AVOID DELETION IF OTHER FIELD IS MISSING
    });
  }

  // SAVE POST TO DATABASE
  try {
    await db.query(
      "INSERT INTO posts (title, content) VALUES ($1, $2)", [title, content] // INSERTS POST INTO DATABSE
    );

    res.redirect("/"); // BACK TO HOMEPAGE AFTER POST CREATION

  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).render("500.ejs");
  }
});





// EDIT POST
app.post("/posts/:id/edit", async (req, res) => {


   // CHECKS CASES WHERE ID IS NOT AN INTEGER (NAN)
   const id = Number(req.params.id);
   if (!Number.isSafeInteger(id) || id <= 0) {
     return res.status(404).render("404.ejs");
   }
 
   try {
 
      // GETS POST
      const result = await db.query("SELECT * FROM posts WHERE id=$1", [id]);
      const post = result.rows[0]; // POST === FIRST (AND ONLY) ROW IN RESULT QUERY
      
      // CHECK IF POST EXISTS
      if (post === undefined) {
        res.status(404).render("404.ejs");
        return;
      }

      // SETS NEW TITLE AND CONTENT BASED ON THE EDIT RECEIVED FROM THE EJS FORM
      let title = req.body.title;
      let content = req.body.content;


      // EMPTY FIELD VALIDATION
      if (title.trim() === "" || content.trim() === "") {
        return res.render("edit-post.ejs", {
          post: post,
          error: "Title and content are required.",
          title: title,
          content: content // KEEPS FIELDS TO AVOID DELETION IF OTHER FIELD IS MISSING
        });
      }

      // EDIT POST QUERY
      await db.query("UPDATE posts SET title=$1, content=$2 WHERE id=$3 ", [req.body.title, req.body.content, id]);

      res.redirect("/posts/" + id);

   } catch (error) {
      console.error("Error editing post:", error);
      res.status(500).render("500.ejs");
   }
});


// DELETE POST
app.post("/posts/:id/delete", async (req, res) => {

   // CHECKS CASES WHERE ID IS NOT AN INTEGER (NAN)
   const id = Number(req.params.id);
   if (!Number.isSafeInteger(id) || id <= 0) {
     return res.status(404).render("404.ejs");
   }

   try {
      const result = await db.query("DELETE FROM posts WHERE id=$1", [id]);

      // IF POST DOESN'T EXIST ERROR
      if (result.rowCount === 0) {
        return res.status(404).render("404.ejs");
      }

      res.redirect("/");

   } catch (error) {
      console.log("Error deleting post:", error);
      res.status(500).render("500.ejs");
   }
});












// IF THE PATH IS TOTALLY INVALID, GIVE 404 PAGE
app.use((req, res) => {
  res.status(404).render("404.ejs");
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});