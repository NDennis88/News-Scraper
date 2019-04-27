const mongoose = require("mongoose");
const express = require("express");
const logger = require("morgan");
const moment = require("moment");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const cheerio = require("cheerio");
const axios = require("axios");
var db = require('./models/Index');


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
app.get("/", function(req, res) {
    res.send(index.html);
  });

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
        const articleCreated = moment().format("YYYY MM DD h:mm:ss");
        // Save the results in an object that we'll push into the results array
        const result = {
            image: image,
            title: title,
            link: link,
            teaser: summary,
            articleCreated: articleCreated
        }


    db.Article.findOne({title:title}).then(function(data){
    
        console.log(data);

        if(data === null) {
            db.Article.create(result).then(function(dbarticle){
                res.json(dbArticle);
            });
        }
    }).catch(function(err) {
        res.json(err);
     });
   });
 });
 
 res.send("Scrape Complete");
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  
    db.Article
      .find({})
      .sort({articleCreated:-1})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {

    db.Article
      .findOne({ _id: req.params.id })
      .populate("note")
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  
  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
  
    db.Note
      .create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Route for saving/updating article to be saved
app.put("/saved/:id", function(req, res) {

    db.Article
      .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: true }})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  
  // Route for getting saved article
  app.get("/saved", function(req, res) {
  
    db.Article
      .find({ isSaved: true })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  
  // Route for deleting/updating saved article
  app.put("/delete/:id", function(req, res) {
  
    db.Article
      .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: false }})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

    var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

    mongoose.connect(MONGODB_URI);


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});