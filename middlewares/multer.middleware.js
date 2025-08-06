import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const resumename = Date.now() + "-" + Math.floor(Math.random() * 100000);
    cb(null, file.originalname + "-" + resumename);
  },
});

export const upload = multer({ storage });
