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
  redisClient.get("photos", async (error, photos) => {
    if (error) {
      console.log(error);
      res.status(500);
    } else {
      if (photos != null) {
        console.log("cache HIT !!!!!!");
        return res.status(200).json(JSON.parse(photos));
      } else {
        console.log("cache misss !!!!");
        const { data } = await axios.get(
          "https://jsonplaceholder.typicode.com/photos"
        );
        redisClient.setex("photos", 3600, JSON.stringify(data));
        res.json(data);
      }
    }
  });
});

app.listen(8000, () => {
  console.log("http://localhost:8000");
});
