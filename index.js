const express = require('express');
const path = require("path");
const rateLimit = require('express-rate-limit');
require('dotenv').config();

require('./db')
const cors = require("cors")
 
const app = express();


app.use(cors());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 500, 
  });

app.use(limiter)
app.use(express.json({ limit:'5mb' }));
app.use('/', express.static(path.join(__dirname, 'public')));



app.get("/check", async (req, res) => {
    res.send({ status: "8421", Backend_Error: "quiz microservice is working" });
  });
  
app.use("*", async (req, res) => {
    res.send({ status: "6320", Backend_Error: "there is no route like this" });
  });

app.listen(process.env.port, () => {    
    console.log("server is running on ", process.env.port)
})