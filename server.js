var cheerio = require("cheerio");
var axios = require("axios");

console.log("\n*************************************************\n" +
            "Grabbing every article title, summary, original url\n" +
            "from npr's news board" +
            "\n*************************************************\n");

// Make request via axios for npr's news board
axios.get("https://www.npr.org/sections/news/").then(function(response) {
    // Load response to cheerio and save it to a varialble
    var $ = cheerio.load(response.data);
    // An empty array to save the scraped data
    var results = [];
    // With cheerio, find each h2-tag with the "title" class
    $(h2.title).each(function(i, element) {
        // Save the text of the element in a "title" variable
        var title = $(element).text();
        // Save the values of any "href" attributes
        var link = $(element).children().attr("href");
        // Save the results in an object that we'll push into the results array
        results.push({
            title: title,
            link: link
        });
    });

    // With cheerio, find each p-tag with the "teaser" class
    $(p.teaser).each(function(i, element) {
        var summary = $(element).text();
        // Save the results in an object that we'll push into the results array
        results.push({
            summary: teaser
        });
    });

    console.log(results);
});