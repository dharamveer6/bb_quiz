const express = require('express');
const path = require("path");
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
require('./db')
const cors = require("cors");
const { categoryRoute } = require('./routes/categoryRoute');
const { questionbankRoute } = require('./routes/questionbankroutes');
const { connectToRabbitMQ } = require('./rabbit_config');
const { azurestreamroute } = require('./routes/azurestreamroutes');
const { formfillroutes } = require('./routes/formfillroutes');
const { triviaRoute } = require('./routes/triviaQuizzRoutes');
const { quizRoute } = require('./routes/quizRoutes');
const { studymaterialRoute } = require('./routes/studymaterialroutes');
const { dailyupdateRoute } = require('./routes/dailyupdateroutes');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// hii

app.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});

app.use(limiter)
app.use(express.json({ limit: '5mb' }));
app.use('/', express.static(path.join(__dirname, 'public')));

connectToRabbitMQ()


app.use('/category', categoryRoute);
app.use('/questionbank', questionbankRoute);
app.use('/formfill', formfillroutes)
app.use('/stream', azurestreamroute)
app.use('/trivia', triviaRoute)
app.use('/active/quiz', quizRoute)  
app.use('/study', studymaterialRoute)  
app.use('/updates', dailyupdateRoute)  




// chnages made


app.get("/check", async (req, res) => {
  res.send({ status: "8421", Backend_Error: "quiz microservice is working" });
});

app.use("*", async (req, res) => {
  res.send({ status: "6320", Backend_Error: "there is no route like this" });
});

app.listen(process.env.port, () => {
  console.log("server is running on ", process.env.port)
})