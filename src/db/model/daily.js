const mongoose = require("mongoose");
module.exports = mongoose.model("daily", new mongoose.Schema({ 
  id: String,
  timestamp: String,
}));