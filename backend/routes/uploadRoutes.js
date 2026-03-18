const express = require("express");
const multer = require("multer");
const protect = require("../middleware/authMiddleware");
const cloudinary = require("../middleware/uploadMiddleware");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/image", protect, upload.single("file"), async (req, res) => {

  try {

    const fileName = req.file.originalname;
    const ext = fileName.split(".").pop().toLowerCase();
    const baseName = fileName.replace(`.${ext}`, "");

    const isImage = req.file.mimetype.startsWith("image");

    const result = await new Promise((resolve, reject) => {

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "mern-chat",
          resource_type: isImage ? "image" : "raw",   // <-- FIX
          public_id: `${Date.now()}-${baseName}`,
          format: ext
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);

    });

    res.json({
      url: result.secure_url,
      name: fileName
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Upload failed" });

  }

});

module.exports = router;