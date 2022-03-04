const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: { required: true, type: String, minlength: 6, maxlength: 14 },
    email: { required: true, type: String, minlength: 6, maxlength: 200 },
    firstname: { required: true, type: String, minlength: 1, maxlength: 20 },
    lastname: { required: true, type: String, minlength: 1, maxlength: 20 },
    password: { required: true, type: String, minlength: 6, maxlength: 200 },
    boards: [{ type: Schema.Types.ObjectId, ref: "Board" }],
    isAdmin: { type: Boolean, default: false },
    theme: { required: true, type: String, default: "dark default" },
    limit: { required: true, type: Number, default: 30 },
    quicklinks: {
      type: Array,
      default: [
        { name: "GitHub", value: "", type: "link", id: 0 },
        { name: "Portfolio", value: "", type: "link", id: 1 },
        { name: "LinkedIn", value: "", type: "link", id: 2 },
        { name: "Blog", value: "", type: "link", id: 3 },
        { name: "Twitter", value: "", type: "link", id: 4 },
        { name: "LeetCode", value: "", type: "link", id: 5 },
        { name: "Resume", value: "", type: "text", id: 6 },
        { name: "Cover Letter", value: "", type: "text", id: 7 },
        { name: "New", value: "", type: "link", id: 8 },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
