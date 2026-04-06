const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log("MIMETYPE:", file.mimetype);
    // const allowedTypes = [
    //   "image/jpeg",
    //   "image/png",
    //   "image/jpg",
    //    "image/webp",     
    //    "image/avif",     
    //   "image/heic",     
    //   "image/heif",   
    //   "application/pdf",
    // ];
    if(
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ){
      cb(null,true);
    }
   else {
      cb(new Error("Only images or PDF files are allowed"));
    }
  },
});

module.exports = upload;
