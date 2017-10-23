# node-express-boilerplate

A Node.js boilerplate to get you off the ground and running.

## About

This setup may very well not be for you, but this is how I have structured my Node.js projects in the past.

## Command Line Dependencies:

* Gulp
* Node/NVM

## Included Client-Side Libraries:

* [jQuery 3.2.1](https://jquery.com/)
* [Bootstrap 3.3.7](https://getbootstrap.com/)
* [Sweet Alert 2 v6.6.5](https://limonte.github.io/sweetalert2/)

## Getting Started

Clone this repository, `cd` into the repo directory then run `npm install`.

# Client-Side Application JS

For client-side JavaScript, edit files in the `/src/js/` directory. Typically, for each view I create an `app.js` file where I create an application object that is stored in the window context. The app class composes any components needed for each page. For instance, an index page with a search page could have an `app.results` instance of a `Results` component with relevant functionality like `app.results.search().then(app.results.renderResults)`.

The `main.js` file has a function enclosed in a jQuery constructor so that it fires on page load. This file instantiates the `App` class as a global variable (the only one) and adds any additional listeners to the page that can now reference the app object. Optionally, the app can be a locally declared variable and can be passed to the listeners by closure. For development, though, it is useful to have the app object stored in the global context so that it can be accessed via the developer console.

These files `main.js` and `app.js` are loaded in the view for each page by using the `append userScripts` block in the relevant pug file located in `/views`. Make sure to include scripts using the `/public/js/` (`/js/` as seen by the client) directory path and not the `/src/js/` as files are compiled from the latter to the former using Gulp.

# Components

Components are abstract views/logic that typically deal with user interaction and building elements of the DOM. I typically build components in their own directory located in `/src/js/components/`. The component directory name should match the component JS filename. To make things easy, compiled component JS files should be loaded in the base `layout.pug` in `/views/` as every view should inherit from the layout and consequently will have those components available to those scripts.

# Compiling

After editing JavaScript files in `/src/js/`, compile the files by running `gulp` in the repository root. The included `gulpfile.js` will use globbing to search for any files added and compile them isomorphically (with respect to directory/file structure) to the `/public/js/` directory.

# Running

Run the application with `npm start` in the repository root.
