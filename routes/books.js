const express = require("express");
const Book = require("../models/book");
const Author = require("../models/author");

const router = express.Router();

const imageMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

// All Books routes
router.get("/", async (req, res) => {
  let query = Book.find();

  if (req.query.title != null && req.query.title != "")
    query = query.regex("title", new RegExp(req.query.title, "i"));

  if (req.query.publishedAfter != null && req.query.publishedAfter != "")
    query = query.gte("publishDate", req.query.publishedAfter);

  if (req.query.publishedBefore != null && req.query.publishedBefore != "")
    query = query.lte("publishDate", req.query.publishedBefore);

  try {
    const books = await query;
    res.render("books/index", {
      books: books,
      searchOption: req.query,
    });
  } catch (error) {
    res.redirect("/");
  }
});

// New Books routes
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

// Create Book routes
router.post("/", async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });

  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    res.redirect("books");
  } catch (error) {
    renderNewPage(res, book, true);
  }
});

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) {
      params.errorMessage = "Error creating book";
    }
    res.render("books/new", params);
  } catch (error) {
    res.redirect("/books");
  }
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) {
    return;
  }

  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
