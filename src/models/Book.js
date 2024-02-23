// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pageCount: { type: Number, required: true },
  language: String,
  authors: [String],
  publisher: String,
  isbn: { type: String, required: true, unique: true }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
