const { query } = require('./helpers/db');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { userRouter } = require('./routes/user.js');
const { contactRouter } = require('./routes/contact');
const { inboxRouter } = require('./routes/inbox');
const { jobRouter } = require('./routes/job.js');
const { applyRouter } = require('./routes/apply.js');
const app = express();
//const profileRoutes = require("./routes/profile");
app.use(cors());
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({extended: false}));
app.use('/uploads', express.static('uploads'));
const port = process.env.PORT;
app.use('/user', userRouter);
app.use('/contact', contactRouter);
app.use('/inbox', inboxRouter);
app.use('/job', jobRouter);
app.use('/application', applyRouter);
//app.use("/profile", profileRoutes);
app.get('/', (req, res) => {
  res.json({ message: "Hello world" });
});

query('SELECT NOW()')
  .then(res => console.log("DB connected:", res.rows))
  .catch(err => console.error("DB error:", err));

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});