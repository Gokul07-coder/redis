const express = require("express");
const app = express();
const axios = require("axios");

const redis = require("redis");
const redisClient = redis.createClient({
  socket: {
    host: "localhost",
    port: "6379",
  },
});

redisClient.on("error", (err) => console.log("Redis Server Error", err));

let id = redisClient.address;
console.log(id);

app.get("/photos", async (req, res) => {
  //checking for the server if contains the data will be outputed
  
  redisClient.get("photos", async (error, photos) => {
    if (error) {
      console.log(error);
      res.status(500);
    } else {
      //if available getting from the redis-server
      if (photos != null) {
        console.log("cache HIT !!!!!!");
        
        //it stores as an string so we are parsing
        return res.status(200).json(JSON.parse(photos));
      }
      
      //else fetching the data and setting it in the server on second api call this wont work :)
      else {
        console.log("cache misss !!!!");
        const { data } = await axios.get(
          "https://jsonplaceholder.typicode.com/photos"
        );
        
        //it accepts String format so we are converting into string
        redisClient.setex("photos", 3600, JSON.stringify(data));
        res.json(data);
      }
    }
  });
});

app.listen(8000, () => {
  console.log("http://localhost:8000");
});
