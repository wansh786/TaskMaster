const mongoose = require("mongoose");

const googleSchema = new mongoose.Schema(
  {
    googleId: String,
    displayName: String,
    email: String,
    image: String,
  },
  {
    versionkey: false,
    timestamps: true,
  }
);

const GoogleModel = new mongoose.model("user", googleSchema);

module.exports = {
  GoogleModel,
};
