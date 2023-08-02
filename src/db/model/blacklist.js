const mongoose = require("mongoose");
module.exports = mongoose.model("blacklist", new mongoose.Schema({ 
  id: String,
  admin: String,
  reason: String,   
}));