# CoveBlog

A responsive blogging web application built with **Node.js, Express, EJS, JavaScript, and CSS**. CoveBlog lets users create, browse, edit, and delete blog posts through a straightforward web interface.

## Features

- **Create posts** with a title and body, including validation for empty input.
- **Browse posts** on the homepage with previews and publication dates.
- **Read individual posts** on dedicated pages.
- **Edit existing posts** and save changes.
- **Delete posts** with a confirmation prompt.
- **Responsive design** for desktop and mobile screens.
- **Custom 404 page** for invalid routes or missing posts.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Templating:** EJS
- **Frontend:** HTML, CSS, JavaScript
- **Package management:** npm
- **Version control:** Git and GitHub

## Getting Started

### Prerequisites

Install [Node.js](https://nodejs.org/) and npm.

### Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/AlexYPB/CoveBlog.git
   cd CoveBlog
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   node blog-web-app.js
   ```

4. Open the local URL printed by the server in your browser.

## How It Works

CoveBlog uses Express routes to handle requests and EJS templates to render pages. Posts are stored in a JavaScript array on the server, and each post has an ID, title, content, and creation date.

**V1 limitation:** Posts are stored **in memory**, so they are lost when the Node.js server restarts. V1 also does not include user accounts or a hosted live demo.

## Project Structure

```text
CoveBlog/
├── blog-web-app.js       # Express server and routes
├── public/
│   ├── blog-web-app.css  # Styles
│   └── script.js         # Client-side interactions
├── views/
│   ├── partials/         # Shared header and footer
│   └── *.ejs             # Page templates
├── package.json
└── README.md
```

## Future Improvements

- Store posts in a relational database so they persist across server restarts.
- Add user registration and login.
- Associate posts with their authors and support comments.
- Deploy the application for public access.

## Author

Created by [AlexYPB](https://github.com/AlexYPB).
