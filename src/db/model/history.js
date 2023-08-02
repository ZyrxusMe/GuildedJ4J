const mongoose = require("mongoose");
module.exports = mongoose.model("history", new mongoose.Schema({ 
  id: String,
  gecmis: Array
}));