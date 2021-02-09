const express = require("express");
const Author = require("../models/author");
const router = express.Router();

// All Authors routes
router.get("/", async (req, res) => {
  let searchOption = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOption.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOption);
    res.render("authors/index", {
      authors: authors,
      searchOption: req.query.name,
    });
  } catch (error) {
    res.redirect("/");
  }
});

// New Authors routes
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

// Create Author routes
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });
  try {
    const newAuthor = await author.save();
    res.redirect(`authors`);
  } catch (error) {
    res.render("authors/new", {
      author: author,
      errorMessage: "Error while creating author",
    });
  }
});

module.exports = router;
