const express = require("express");
const Author = require("../models/author");
const Book = require("../models/book");
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

// Get Specific Author
router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id }).limit(6).exec();
    res.render(`authors/show`, { author: author, booksByAuthor: books });
  } catch (error) {
    res.redirect("/authors");
  }
});

// Edit Specific Author
router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/edit", { author: author });
  } catch (error) {
    res.redirect("/authors");
  }
});

// Update Specific Author
router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${req.params.id}`);
  } catch (error) {
    if (author == null) {
      res.redirect("/");
    } else {
      res.redirect("/authors/new", {
        author: author,
        errorMessage: "Error while updating author",
      });
    }
  }
});

// Delete Specific Author
router.delete("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    await author.remove();
    res.redirect(`/authors`);
  } catch (error) {
    if (author == null) {
      res.redirect("/");
    } else {
      res.redirect(`/authors/${author.id}`);
    }
  }
});

module.exports = router;
