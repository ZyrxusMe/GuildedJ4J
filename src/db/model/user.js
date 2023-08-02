const mongoose = require("mongoose");
module.exports = mongoose.model("user", new mongoose.Schema({ 
  id: String,
  coin: {type: mongoose.Types.Decimal128, default: 0.0}
}));