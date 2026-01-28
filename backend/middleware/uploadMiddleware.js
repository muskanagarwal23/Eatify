const mutler = require("multer");

const storage = mutler.memoryStorage();

const upload = mutler({
    storage,
    limits: { fileSize: 5*1024*1024},
    fileFilter:(req,file,cb) => {
        if(!file.mimetype.startsWith("image/")) {
            cb(new Error("only images allowed"), false);        
        }
         cb(null,true);
    }
   
});

module.exports = upload;