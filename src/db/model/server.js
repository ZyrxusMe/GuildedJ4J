const mongoose = require("mongoose");
module.exports = mongoose.model("server", new mongoose.Schema({ 
  id: String,
  hak: Number,
  desc: String,
  kalan: Number,
  time: Date,
  giren: Array,
  disabled: {type: String, default: "false"}
}));