import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
let posts = [];
let nextId = 1;

// MIDDLEWARE
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


// HOMEPAGE GET
app.get("/", (req, res) => {
  res.render("blog-web-app.ejs", {
    posts: posts
  });
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
app.get("/posts/:id", (req, res) => {


  let post = posts.find((post) => {
    return post.id === parseInt(req.params.id);
  });


  if (post === undefined) {
    res.status(404).render("404.ejs");
    return;
  }


  res.render("post.ejs", {post: post});
});


// GET EDIT PAGES FOR EACH POST
app.get("/posts/:id/edit", (req, res) => {

  let post = posts.find((post) => {
    return post.id === parseInt(req.params.id);
  });

  // CHECK IF POST EXISTS
  if (post === undefined) { 
    res.status(404).render("404.ejs");
    return;
  }

  res.render("edit-post.ejs", {
    post: post,
    error: null,
    title: post.title,
    content: post.content // SENDS AND SAVES ORIGINAL POST TITLE AND CONTENT
  });
});











// CREATE POST
app.post("/create", (req, res) => {

  let newPost = {
    
    id: nextId,
    title: req.body.title,
    content: req.body.content,

    // DATETIME AUTOMATICALLY STORED
    date: new Date().toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  };


  if (newPost.title.trim() === "" || newPost.content.trim() === "") { // CHECK IF POST FIELDS ARE EMPTY (SPACES DON'T COUNT DUE TO TRIM())
    return res.render("create-post.ejs", {
      error: "Title and content are required.", // RETURNS CREATE POST PAGE BACK WITH AN ERROR MESSAGE ADDED (ERROR STRING IS PASSED IN)
      title: newPost.title,
      content: newPost.content // KEEPS FIELDS TO AVOID DELETION IF OTHER FIELD IS MISSING
    });
  }


  nextId++;

  // SAVE POST IN POSTS ARRAY
  posts.push(newPost);
  console.log(posts);
  res.redirect("/");
});





// EDIT POST
app.post("/posts/:id/edit", (req, res) => {

  // FINDS POST WITH THE ADEQUATE CLICKED POST ID
  let post = posts.find((post) => {
    return post.id === parseInt(req.params.id);
  });

  // CHECK IF POSTS EXISTS
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

  // PERMANENTLY COMPLETES EDIT AFTER EMPTY FIELD VALIDATION
  post.title = title;
  post.content = content;
  res.redirect("/posts/" + post.id);

});


// DELETE POST
app.post("/posts/:id/delete", (req, res) => {

  let index = posts.findIndex((post) => {
    return post.id === parseInt(req.params.id);
  });

   // CHECK IF POST EXISTS
   if (index === -1) {
    res.status(404).render("404.ejs");
    return;
   }

  

  posts.splice(index, 1); // DELETES PART OF ARRAY STARTING FROM INDEX, NUMBER = HOW MANY ITEMS WE DELETE
  res.redirect("/");
});












// IF THE PATH IS TOTALLY INVALID, GIVE 404 PAGE
app.use((req, res) => {
  res.status(404).render("404.ejs");
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});