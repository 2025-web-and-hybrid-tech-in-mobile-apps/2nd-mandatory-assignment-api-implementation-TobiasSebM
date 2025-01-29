const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON requests

// ------ WRITE YOUR SOLUTION HERE BELOW ------ //

const users = [];
const authorizedTokens = new Set();
const highScores = [];

app.post("/signup", (req, res) => {
  const { userHandle: username, password } = req.body;
  
  if (!username || !password || username.length < 6 || password.length < 6 || typeof username !== "string" || typeof password !== "string") {
    return res.status(400).send("Invalid request body");
  }
  
  users.push({ username, password });
  console.log(users);
  res.status(201).send("User registered successfully");
});

app.post("/login", (req, res) => {
  const { userHandle: username, password } = req.body;
  
  if (!username || !password || username.length < 6 || password.length < 6 || typeof username !== "string" || typeof password !== "string" || Object.keys(req.body).length !== 2) {
    return res.status(400).send("Bad Request");
  }

  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).send("Unauthorized, incorrect username or password");
  }

  const token = `${username}${Date.now()}`;
  authorizedTokens.add(token);
  res.status(200).json({ jsonWebToken: token });
});

app.post("/high-scores", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Unauthorized, JWT token is missing or invalid");
  }

  const token = authHeader.split(" ")[1];
  if (!authorizedTokens.has(token)) {
    return res.status(401).send("Unauthorized, JWT token is missing or invalid");
  }

  const { level, userHandle: username, score, timestamp } = req.body;
  if (!level || !username || !score || !timestamp) {
    return res.status(400).send("Invalid request body");
  }

  highScores.push({ level, username, score, timestamp });
  res.status(201).send("High score posted successfully");
});

app.get("/high-scores", (req, res) => {
  const { level } = req.query;
  const page = Number(req.query.page) || 1;

  const filteredScores = highScores.filter(score => score.level === level);
  const paginatedScores = filteredScores.sort((a, b) => b.score - a.score).slice((page - 1) * 20, page * 20);
  
  res.status(200).json(paginatedScores);
});

//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  },
  close: function () {
    if (serverInstance) serverInstance.close();
  },
};