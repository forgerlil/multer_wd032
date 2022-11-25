require('dotenv').config();
const express = require('express');
const server = express();
const port = process.env.PORT || 5000;
const upload = require('./lib/multerConfig.js');
const pool = require('./DB/dbConnection.js');

server.use(express.static('views'));
server.use(express.static('.'));

// Level 1 - POST request for single image without database interaction
// server.post(
//   '/upload-profile-pic',
//   upload.single('profile_pic'),
//   async (req, res) => {
//     try {
//       if (!req.file) throw new Error('Please upload something');
//       return res
//         .status(200)
//         .send(
//           `<h2>Here is the picture:</h2><img src="${req.file.path}" alt="something"/>`
//         );
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// Level 2 - POST request for multiple images without database interaction
server.post('/upload-cat-pics', upload.array('cat_pics', 3), (req, res) => {
  try {
    if (!req.files) throw new Error('Please upload many cat pics!');
    const allCatPics = req.files
      .map((image) => `<div><img src="${image.path}" alt="something"/></div>`)
      .join('');
    return res.status(200).send(allCatPics);
  } catch (error) {
    next(error);
  }
});

// Level 3 - POST request for single image with database interaction
server.post(
  '/upload-profile-pic',
  upload.single('profile_pic'),
  async (req, res) => {
    try {
      if (!req.file) throw new Error('Please upload something');
      const { originalname, path, filename } = req.file;
      const {
        rows: [fileDetails],
      } = await pool.query(
        `INSERT INTO pictures (name, path, filename) VALUES ($1, $2, $3) RETURNING *`,
        [originalname, path, filename]
      );
      return res
        .status(200)
        .send(
          `<h2>Here is the picture:</h2><img src="${fileDetails.path}" alt="something"/>`
        );
    } catch (error) {
      next(error);
    }
  }
);

// Level 3 - POST request for multiple images with database interaction
// upcoming feature :D

// Level 3 - GET request for all images referenced in the database
server.get('/get-pics', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pictures');
    const allCatPics = rows
      .map((image) => `<li><a href="${image.path}">${image.name}</a></li>`)
      .join('');
    return res.status(200).send(`<ul>${allCatPics}</ul>`);
  } catch (error) {
    next(error);
  }
});

// Error handler middleware
server.use((err, req, res, next) => {
  return res.status(500).send(`<h2>${err.message}</h2>`);
});

server.listen(port, () => console.log(`Connected to port ${port}`));
