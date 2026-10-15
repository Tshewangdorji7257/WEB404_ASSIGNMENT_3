
const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 3000;

// Vulnerable: accepts files without validating their type or size.
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

app.use(express.static("public"));

app.post("/upload", upload.single("myfile"), (req, res) => {
  res.send(`
    <h2>Upload Successful!</h2>
    <p>File: ${path.basename(req.file.originalname)}</p>
    <p>The server accepted the file without security checks.</p>
    <a href="/">Upload another file</a>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
