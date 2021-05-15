const mongoose = require("mongoose");

const Gif = mongoose.model(
  "Gif",
  new mongoose.Schema({
    url: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      unique: true
    },
    tags: [{
      type: String,
      required: true,
    }]
  })
)


module.exports = Gif;