const mongoose = require('mongoose');


mongoose.connect(process.env.db_url)
  .then(()=>{
    console.log("Connected to MongoDB")
  })
  .catch((err)=>{
    console.log("Error connecting ", `${err}`)
  })


