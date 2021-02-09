const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Book = require("../models/book");
const Author = require("../models/author");
const router = express.Router();

const uploadPath = path.join("public", Book.coverImageBasePath);

const imageMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  },
});

// All Books routes
router.get("/", async (req, res) => {
  let query = Book.find();

  if (req.query.title != null && req.query.title != "")
    query = query.regex("title", new RegExp(req.query.title, "i"));

  if (req.query.publishedAfter != null && req.query.publishedAfter != "")
    query = query.gte("publishDate", req.query.publishedAfter);

  if (req.query.publishedBefore != null && req.query.publishedBefore != "")
    query = query.lte("publishDate", req.query.publishedBefore  );

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
router.post("/", upload.single("cover"), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null;

  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImage: fileName,
    description: req.body.description,
  });

  try {
    const newBook = await book.save();
    res.redirect("books");
  } catch (error) {
    if (book.coverImage != null) {
      removeBookCover(book.coverImage);
    }
    renderNewPage(res, book, true);
  }
});

function removeBookCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), (err) => {
    if (err) {
      console.error(err);
    }
  });
}

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

module.exports = router;
