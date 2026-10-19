# CodeBlog

A responsive, full-stack blogging web application built with **Node.js, Express.js, EJS, PostgreSQL, JavaScript, and CSS**.

CodeBlog allows users to create, browse, edit, and delete blog posts through a responsive web interface. Posts are stored in a PostgreSQL database, ensuring data persists across server restarts.

## Features

- **Create posts** with a title and body, including validation for empty input.
- **Browse posts** on the homepage, displaying previews and publication dates.
- **Read individual posts** on dedicated pages.
- **Edit existing posts** and save changes directly to PostgreSQL.
- **Delete posts** with a confirmation prompt.
- **Persistent storage** using PostgreSQL.
- **Responsive design** for desktop and mobile screens.
- **Custom 404 and 500 error pages** for missing resources and server errors.
- **Parameterized SQL queries** for safe database interactions.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Database driver:** node-postgres (`pg`)
- **Templating:** EJS
- **Frontend:** HTML, CSS, JavaScript
- **Package management:** npm
- **Version control:** Git and GitHub

## Getting Started

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/) and npm
- [PostgreSQL](https://www.postgresql.org/)

### Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/AlexYPB/CodeBlog.git
   cd CodeBlog
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a PostgreSQL database named `codeblog`.

4. Create the `posts` table:

   ```sql
   CREATE TABLE posts (
       id SERIAL PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       content TEXT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. Create a `.env` file in the project root and configure your database password:

   ```env
   DB_PASSWORD=your_postgresql_password
   ```

   The current database configuration uses PostgreSQL on `localhost`, with database `codeblog`, user `postgres`, and port `5433`. Update these settings in `blog-web-app.js` if your PostgreSQL installation uses different values.

   **Never commit your `.env` file to GitHub.**

6. Start the server using Node.js 20.6 or later:

   ```bash
   node --env-file=.env blog-web-app.js
   ```

7. Open the local URL printed by the server in your browser.

## How It Works

CodeBlog uses Express routes to handle HTTP requests and EJS templates to dynamically render pages.

Blog posts are stored in PostgreSQL rather than in-memory JavaScript arrays. Each post contains a unique ID, title, content, and creation timestamp.

The application supports all four CRUD operations:

- **Create:** Insert new posts into PostgreSQL.
- **Read:** Retrieve posts for the homepage and individual post pages.
- **Update:** Modify existing posts.
- **Delete:** Remove posts from the database.

Database operations use asynchronous queries and parameterized SQL statements. The application also includes input validation and error handling for invalid post IDs, missing posts, and database failures.

## Project Structure

```text
CodeBlog/
├── blog-web-app.js       # Express server, routes, and database queries
├── public/
│   ├── blog-web-app.css  # Application styles
│   └── script.js         # Client-side interactions
├── views/
│   ├── partials/         # Shared header and footer
│   ├── 404.ejs           # Not found page
│   ├── 500.ejs           # Server error page
│   └── *.ejs             # Other page templates
├── .env                  # Local credentials (not committed)
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Current Limitations

- User registration and authentication are not yet implemented.
- Posts are not associated with individual user accounts.
- The application is not yet publicly deployed.

## Future Improvements

- Implement user registration, login, and logout.
- Secure passwords using hashing.
- Add session-based authentication.
- Associate posts with their authors and restrict editing and deletion to authorized users.
- Add a commenting system.
- Deploy the application for public access.

## Development Progress

**V1 — In-Memory CRUD**
- Built the responsive frontend using HTML, CSS, JavaScript, and EJS.
- Implemented create, read, update, and delete functionality using JavaScript arrays.
- Added form validation and a custom 404 page.

**V2 — PostgreSQL Integration**
- Migrated all CRUD operations to PostgreSQL.
- Implemented persistent database storage.
- Added asynchronous, parameterized SQL queries.
- Improved error handling and introduced a custom 500 page.

**V3 — Authentication (Planned)**
- User accounts, secure login, sessions, and post ownership.

## Author

Created by [AlexYPB](https://github.com/AlexYPB).
