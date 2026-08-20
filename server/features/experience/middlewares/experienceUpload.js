import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.join(process.cwd(), "uploads", "experience");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },

  filename(req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/", "video/", "audio/"];

  const isAllowedMedia = allowedTypes.some((type) =>
    file.mimetype.startsWith(type),
  );

  if (isAllowedMedia) {
    cb(null, true);
    return;
  }

  const allowedExtensions = [".pdf", ".doc", ".docx", ".txt", ".zip", ".rar"];

  const extension = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
    return;
  }

  cb(new Error("This file type is not supported."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

export default upload;
