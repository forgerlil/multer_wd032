const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image'))
    return cb(new Error('Invalid file type. Please upload an image'));
  const allowedExtensions = ['.png', '.jpg', '.jpeg'];
  const extension = path.extname(file.originalname);
  return allowedExtensions.includes(extension)
    ? cb(null, true)
    : cb(new Error('Type of image not accepted!'));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
