var express = require('express');
var router = express.Router();

const Book = require('../models').Book;
const { Op } = require('sequelize')

const AsyncHandler  = (cb)=>{
  return async (req, res, next)=>{
    try {
      return cb(req, res, next);
    } catch (error) {
      next(error)
    }
  }
}

let pagination = []; 
let Book_Results = [];

// Sets the ammount of books shown per page
let Book_Limit = 6;

function Reset_Pagination(){
  pagination = [];
  Book_Results = [];
}

/* GET home page. */
router.get('/', (req, res)=> res.redirect('/books'))
router.get('/books', AsyncHandler(async (req, res, next)=>{
  try {
    Reset_Pagination();
    let books = await Book.findAll()
    let count = Math.ceil(books.length / Book_Limit);
    for (let x = 0;  x < count; x++) {
      pagination.push(x);
    }

    // Seperates Search results in arrays for each page
    let offsets = 0;
    for (let i = 0; i < pagination.length; i++) {
      let Books = await Book.findAll({
        limit: Book_Limit,
        offset: offsets,
        order: [['year', 'ASC']]
      })
      Book_Results.push(Books);
      offsets+= Book_Limit;
    }

    res.render('index', {books: Book_Results[0], pagination})
  } catch (error) {
    next(error);
  }
}));

// Books List home pagination or pages
router.get('/books/page/:id', AsyncHandler(async(req, res)=>{
  let page = parseInt(req.params.id) - 1;
  res.render('index', {books: Book_Results[page], pagination})
}))

// Search Books
router.post('/books/search/page/1', AsyncHandler( async(req, res, next)=>{
  let books;
  try {
    Reset_Pagination();
    books = await Book.findAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: '%' + req.body.search + '%'
            }
          },
          {
            author: {
              [Op.like]: '%' + req.body.search + '%'
            }
          },
          {
            genre: {
              [Op.like]: '%' + req.body.search + '%'
            }
          },
          {
            year: {
              [Op.like]: '%' + req.body.search + '%'
            }
          },
        ],
      },
      order: [['year', 'ASC']]
    })

    if(books.length !== 0){
    let count = Math.ceil(books.length / Book_Limit);
    for (let x = 0;  x < count; x++) {
      pagination.push(x);
    }

    // Seperates Search results in arrays for each page
    let offsets = 0;
    for (let i = 0; i < pagination.length; i++) {
      let Books = await Book.findAll({
            where: {
              [Op.or]: [
                {
                  title: {
                    [Op.like]: '%' + req.body.search + '%'
                  }
                },
                {
                  author: {
                    [Op.like]: '%' + req.body.search + '%'
                  }
                },
                {
                  genre: {
                    [Op.like]: '%' + req.body.search + '%'
                  }
                },
                {
                  year: {
                    [Op.like]: '%' + req.body.search + '%'
                  }
                },
              ],
            },
            limit: Book_Limit,
            offset: offsets,
            order: [['year', 'ASC']]
      })
      Book_Results.push(Books);
      offsets+= Book_Limit;
    }
    } else {
      Book_Results.push([]);
    }

    res.render('index', {books: Book_Results[0], pagination, result: true})
  } catch (error) {
    next(error);
  }
}))

// Search Results Pagination Or Pages
router.get('/books/search/page/:id', AsyncHandler( async(req, res, next)=>{
  try {
    let page = parseInt(req.params.id) - 1;
    res.render('index', {books: Book_Results[page], pagination, result: true})
  } catch (error) {
    next(error);
  }
}))

// Create New Book
router.get('/books/new', AsyncHandler(async(req, res, next)=>{
  res.render('new-book');
}))

// Post New Book
router.post('/books/new', AsyncHandler(async(req, res, next)=>{
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/books/' + book.id)
  } catch (error) {
    if(error.name === 'SequelizeValidationError'){
      book = await Book.build(req.body);
      res.render('new-book', {book, errors: error.errors})
    } else {
      throw error
    }
  }
}))

// Update Detail Form
router.get('/books/:id', AsyncHandler(async(req, res, next)=>{
  let book= await Book.findByPk(req.params.id);
  if(book){
    res.render('update-book', {book})
  }
  else{
    const error = new Error('Book was not found');
    error.status = 404;
    next(error)
  }
}))

// Update Book Details
router.post('/books/:id', AsyncHandler(async(req, res, next)=>{
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book){
      await book.update(req.body);
      res.render('update-book', {book})
    } else {
      res.sendStatus(404)
    }
  } catch (error) {
    if(error.name === 'SequelizeValidationError'){
      res.render('update-book', { book, errors: error.errors})
    } else {
      throw error
    }
  }
}))

// Delete A Book
router.post('/books/:id/delete', AsyncHandler(async(req, res, next)=>{
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    await book.destroy();
    res.redirect('/books')
  } catch (error) {
    next(error);
  }
}))


module.exports = router;
