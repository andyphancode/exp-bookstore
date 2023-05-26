process.env.NODE_ENV = "test"

const request = require("supertest");


const app = require("../app");
const db = require("../db");

let book_isbn;


beforeEach(async () => {
  let result = await db.query(`
    INSERT INTO
      books (isbn, amazon_url,author,language,pages,publisher,title,year)
      VALUES(
        '987654321',
        'test.com/test',
        'Andy',
        'English',
        100,
        'Johnnys Publishing Co',
        'A fake book', 
        2000)
      RETURNING isbn`);

  book_isbn = result.rows[0].isbn
});

afterEach(async function () {
  await db.query("DELETE FROM BOOKS");
});


afterAll(async function () {
  await db.end()
});

describe("POST /books", function () {
  test("Create a new book", async function () {
    const response = await request(app)
        .post(`/books`)
        .send({
          isbn: '123456789',
          amazon_url: "test.com",
          author: "tester",
          language: "english",
          pages: 1,
          publisher: "test",
          title: "test title",
          year: 1999
        });
    expect(response.statusCode).toBe(201);
    expect(response.body.book).toHaveProperty("isbn");
  });

  test("Prevent invalid book.", async function () {
    const response = await request(app)
        .post(`/books`)
        .send({isbn: '123456789'});
    expect(response.statusCode).toBe(400);
  });
});


describe("GET /books", function () {
  test("Get list of books (only one)", async function () {
    const response = await request(app).get(`/books`);
    const books = response.body.books;
    expect(books).toHaveLength(1);
    expect(books[0]).toHaveProperty("isbn");
  });
});


describe("GET /books/:isbn", function () {
  test("Gets a single book", async function () {
    const response = await request(app)
        .get(`/books/${book_isbn}`)
    expect(response.body.book.isbn).toBe(book_isbn);
  });

  test("404 error handling", async function () {
    const response = await request(app)
        .get(`/books/12345`)
    expect(response.statusCode).toBe(404);
  });
});


describe("PUT /books/:id", function () {
  test("Updates a book", async function () {
    const response = await request(app)
        .put(`/books/${book_isbn}`)
        .send({
            amazon_url: "test.com",
            author: "tester",
            language: "english",
            pages: 1,
            publisher: "test",
            title: "test title",
            year: 1999
        });
    expect(response.body.book).toHaveProperty("isbn");
    expect(response.body.book.title).toBe("test title");
  });

  test("Prevents invalid book update", async function () {
    const response = await request(app)
        .put(`/books/${book_isbn}`)
        .send({
            isbn: "12233213",
            amazon_url: "test.com",
            author: "tester",
            language: "english",
            pages: 1,
            publisher: "test",
            title: "test title",
            year: 1999,
            invalid_field: "wrong"
        });
    expect(response.statusCode).toBe(400);
  });

  test("404 error handling (book not found)", async function () {
    await request(app)
        .delete(`/books/${book_isbn}`)
    const response = await request(app).delete(`/books/${book_isbn}`);
    expect(response.statusCode).toBe(404);
  });
});


describe("DELETE /books/:id", function () {
  test("Delete a book", async function () {
    const response = await request(app)
        .delete(`/books/${book_isbn}`)
    expect(response.body).toEqual({message: "Book deleted"});
  });
});


