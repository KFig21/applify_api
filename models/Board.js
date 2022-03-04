const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BoardSchema = new Schema(
  {
    boardname: { required: true, type: String, minlength: 3, maxlength: 25 },
    user: { required: true, type: Schema.Types.ObjectId, ref: "User" },
    jobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
    favorite: { required: true, type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Board", BoardSchema);
