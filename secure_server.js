
const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
const PORT = 3000;

const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const allowedTypes = {
  ".jpg": {
    mime: "image/jpeg",
    signature: (b) =>
      b.length >= 3 &&
      b[0] === 0xff &&
      b[1] === 0xd8 &&
      b[2] === 0xff
  },
  ".jpeg": {
    mime: "image/jpeg",
    signature: (b) =>
      b.length >= 3 &&
      b[0] === 0xff &&
      b[1] === 0xd8 &&
      b[2] === 0xff
  },
  ".png": {
    mime: "image/png",
    signature: (b) =>
      b.length >= 8 &&
      b.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      )
  },
  ".pdf": {
    mime: "application/pdf",
    signature: (b) =>
      b.length >= 5 && b.subarray(0, 5).toString() === "%PDF-"
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, crypto.randomUUID());
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const rule = allowedTypes[ext];

    if (!rule || file.mimetype !== rule.mime) {
      return cb(new Error("Only JPEG, PNG and PDF files are allowed."));
    }

    cb(null, true);
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.post("/upload", (req, res) => {
  upload.single("myfile")(req, res, (err) => {
    if (err) {
      const status = err instanceof multer.MulterError &&
        err.code === "LIMIT_FILE_SIZE" ? 413 : 400;

      return res.status(status).send(`
        <h2>Upload Rejected</h2>
        <p>${status === 413
          ? "File exceeds the 2 MB limit."
          : "Invalid file or upload request."}</p>
        <a href="/">Try again</a>
      `);
    }

    if (!req.file) {
      return res.status(400).send("Please select a file.");
    }

    const filePath = path.join(uploadDir, req.file.filename);
    const ext = path.extname(req.file.originalname).toLowerCase();
    const rule = allowedTypes[ext];

    const header = Buffer.alloc(16);

    fs.open(filePath, "r", (openErr, fd) => {
      if (openErr) {
        fs.unlink(filePath, () => {});
        return res.status(500).send("Could not validate the upload.");
      }

      fs.read(fd, header, 0, header.length, 0, (readErr, bytesRead) => {
        fs.close(fd, () => {});

        const bytes = header.subarray(0, bytesRead);

        if (readErr || !rule.signature(bytes)) {
          return fs.unlink(filePath, () => {
            res.status(400).send(`
              <h2>Upload Rejected</h2>
              <p>File contents do not match the allowed file type.</p>
              <a href="/">Try again</a>
            `);
          });
        }

        res.send(`
          <h2>Upload Successful!</h2>
          <p>Your file passed the configured checks.</p>
          <p>Original filename: ${path.basename(req.file.originalname)
            .replace(/[&<>"']/g, "")}</p>
          <p>Stored using a random server-generated filename.</p>
          <a href="/">Upload another file</a>
        `);
      });
    });
  });
});

// Final error handler for unexpected server errors.
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).send("An unexpected server error occurred.");
});

app.listen(PORT, () => {
  console.log(`Secure server running at http://localhost:${PORT}`);
});
