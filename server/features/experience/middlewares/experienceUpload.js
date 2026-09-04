import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.join(
  process.cwd(),
  "uploads",
  "experience",
);

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
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}`;

    const extension = path
      .extname(file.originalname || "")
      .toLowerCase();

    cb(
      null,
      `${uniqueName}${extension}`,
    );
  },
});

const fileFilter = (
  req,
  file,
  cb,
) => {
  const mimetype = String(
    file?.mimetype || "",
  ).toLowerCase();

  const isAllowed =
    mimetype.startsWith("image/") ||
    mimetype.startsWith("audio/") ||
    mimetype.startsWith("video/");

  if (!isAllowed) {
    cb(
      new Error(
        "Only images, recorded audio, and approved video uploads are supported.",
      ),
    );

    return;
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize:
      100 * 1024 * 1024,

    files: 20,
  },
});

export default upload;