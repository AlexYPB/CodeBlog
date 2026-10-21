# CoveBlog

**CoveBlog** is a responsive blogging web application built with Node.js, Express, EJS, and PostgreSQL. It supports creating, reading, updating, and deleting blog posts through a custom-designed interface.

Originally developed as *CodeBlog*, the project has evolved from an in-memory CRUD application into a database-backed web app. User authentication is the next major feature under development.

## Features

- **Create posts** with a title and body, with validation for missing input.
- **Browse posts** on the homepage, including previews and publication dates.
- **Read individual posts** on dedicated pages.
- **Edit and delete posts** through the web interface, with a confirmation prompt for deletion.
- **Persistent storage** using PostgreSQL, so posts remain available after the server restarts.
- **Responsive frontend** with custom CSS, reusable EJS partials, and interactive button styling.
- **Custom error pages**, including a 404 page for invalid routes or missing posts.
- **Registration page UI** as the starting point for the upcoming authentication system.

> **Development status:** Post CRUD and PostgreSQL persistence are implemented. The registration page currently provides the interface only; account creation, login, and authorization are not yet functional.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Templates | EJS |
| Frontend | HTML, CSS, JavaScript |
| Development | npm, Git, GitHub |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and npm
- [PostgreSQL](https://www.postgresql.org/)

### Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/AlexYPB/CoveBlog.git
   cd CoveBlog
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up a local PostgreSQL database and configure the database connection settings used by `blog-web-app.js`. Create a local `.env` file for the required credentials, including `DB_PASSWORD`. **Never commit `.env` or database credentials.**

   The project currently uses a database named `coveblog`. Its tables must be created before running the application; an automated database setup script is not yet documented.

4. Start the server:

   ```bash
   node --env-file=.env blog-web-app.js
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

Express handles HTTP requests and interacts with PostgreSQL to store and retrieve blog posts. EJS renders server-side HTML using shared header and footer templates, while custom CSS and JavaScript provide the visual design and browser interactions.

The application began with in-memory post storage (V1), then introduced PostgreSQL persistence (V2). V3 is focused on adding user accounts and controlling who can manage each post.

## Project Structure

```text
CoveBlog/
├── blog-web-app.js       # Express server and routes
├── public/
│   ├── blog-web-app.css  # Application styles
│   └── script.js         # Client-side interactions
├── views/
│   ├── partials/         # Shared header and footer
│   └── *.ejs             # Page templates
├── package.json
└── README.md
```

## Roadmap

- [x] V1: Build the blogging interface and CRUD routes.
- [x] V2: Persist blog posts in PostgreSQL.
- [x] Refresh the frontend and rebrand as CoveBlog.
- [x] Create the registration page interface.
- [ ] Implement registration with secure password hashing.
- [ ] Add login, logout, and session management.
- [ ] Add Google OAuth sign-in.
- [ ] Enforce post ownership and authorization rules.
- [ ] Add public user profiles and admin moderation.
- [ ] Deploy the application.

## Author

Created by [AlexYPB](https://github.com/AlexYPB).
