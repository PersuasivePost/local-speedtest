const express = require("express");
const path = require("path");
const app = express();
const port = 1976;

// Serve static files (index.html, script.js, favicon.ico, etc.) from project root
app.use(express.static(__dirname));

// 1 HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 2 Ping
app.get("/ping", (req, res) => {
  res.send("pong");
});

// 3 Dummy Data Download
app.get("/download", (req, res) => {
  const fileSizeMB = 100;
  const chunkSize = 1024 * 1024; // 1 MB

  const dummyChunk = Buffer.alloc(chunkSize, "a");

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", fileSizeMB * chunkSize);

  for (let i = 0; i < fileSizeMB; i++) {
    res.write(dummyChunk);
  }

  res.end();
});

// 4 Upload Endpoint
app.post("/upload", (req, res) => {
  let totalBytes = 0;

  req.on("data", (chunk) => {
    totalBytes += chunk.length;
  });

  req.on("end", () => {
    console.log(`(Server) Received ${totalBytes} bytes of upload data.`);
    res.send("Upload Complete");
  });
});

// 5 Start Server
app.listen(port, "0.0.0.0", () => {
  console.log(`Speed Test Server is Running!`);
  console.log(`Open on your mobile browser:`);
  console.log(`http://[PC-IP-ADDRESS]:${port}`);
});
