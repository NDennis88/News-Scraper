const mongoose = require("mongoose");
const express = require("express");
const logger = require("morgan");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const cheerio = require("cheerio");
const axios = require("axios");
var db = require('./models');


// Require all models
// const db = require("./models");

const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/article", { useNewUrlParser: true });

console.log("\n*************************************************\n" +
            "Grabbing every article title, summary, original url\n" +
            "from npr's news board" +
            "\n*************************************************\n");

// Routes
// app.get("/", function(req, res) {
//     res.send(index.html);
//   });

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
// Make request via axios for npr's news board
axios.get("https://www.npr.org/sections/news/").then(function(response) {
    // Load response to cheerio and save it to a varialble
    const $ = cheerio.load(response.data);
    // An empty array to save the scraped data

    // With cheerio, find each div with the "item" class
    $(".item").each(function(i, element) {
        // Save the image of the element in a "scr" variable
        const image = $(element).find(".imagewrap").children("img").attr("src");
        // Save the text of the element in a "title" variable
        const title = $(element).find("h2.title").text();
        // Save the values of any "href" attributes
        const link = $(element).find(".title").children("a").attr("href");
        // Save the values of any "teaser" attributes
        const summary = $(element).find(".teaser").text();
        // Save the results in an object that we'll push into the results array
        const result = {
            image: image,
            title: title,
            link: link,
            teaser: summary
        }


    db.Article.findOne({title:title}).then(function(data){
    
        console.log(data);

        if(data === null) {
            db.Article.create(result).then(function(dbarticle){
                res.json(dbarticle);
            });
        }
    }).catch(function(err) {
        // res.json(err);
     });
   });
 });
 res.send("Scrape Complete");
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});