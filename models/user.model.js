const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: [4, 'Username is shorter than 4 chars'],
      maxlength: 25
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ]
  })
);

module.exports = User;