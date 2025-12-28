const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 10000;

// Simple homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Basic Authentication Middleware for /vps
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.set("WWW-Authenticate", 'Basic realm="Protected"');
    return res.status(401).send("Authentication required.");
  }

  const encoded = authHeader.split(" ")[1];
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const [user, pass] = decoded.split(":");

  if (user === "vps1" && pass === "1234") {
    return next();
  }

  res.set("WWW-Authenticate", 'Basic realm="Protected"');
  return res.status(401).send("Invalid credentials.");
}

// Protect only /vps
app.use("/vps", auth);

// Proxy /vps → ttyd on internal port 7681
app.use(
  "/vps",
  createProxyMiddleware({
    target: "http://127.0.0.1:7681",
    ws: true,
    changeOrigin: true,
    pathRewrite: { "^/vps": "" }
  })
);

app.listen(PORT, () => {
  console.log("Reverse proxy running on PORT=" + PORT);
});
