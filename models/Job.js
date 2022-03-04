const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JobSchema = new Schema(
  {
    user: { required: true, type: Schema.Types.ObjectId, ref: "User" },
    board: { required: true, type: Schema.Types.ObjectId, ref: "Board" },
    company: { required: true, type: String, minlength: 3, maxlength: 50 },
    position: { required: true, type: String, minlength: 3, maxlength: 50 },
    applied: { required: true, type: Boolean }, // applied or not
    appDate: { required: true, type: String }, // date applied
    city: { required: true, type: String, minlength: 3, maxlength: 50 },
    locationState: {
      required: true,
      type: String,
      minlength: 1,
      maxlength: 50,
    },
    remote: { required: true, type: String, minlength: 1, maxlength: 20 }, // is the position remote
    status: { required: true, type: String, minlength: 3, maxlength: 50 }, // current status/how far the application has progressed
    result: { required: true, type: String, minlength: 3, maxlength: 50 }, // end result
    jobtype: { required: true, type: String, minlength: 3, maxlength: 50 }, // full-time, part-time, contract
    jobsite: { required: true, type: String, minlength: 3, maxlength: 50 }, // what site was used
    username: { type: String, minlength: 0, maxlength: 50 }, // optional, website login info
    password: { type: String, minlength: 0, maxlength: 50 }, // optional, website login info
    link: { required: true, type: String, minlength: 3, maxlength: 500 }, // link to listing
    payType: { required: true, type: String, minlength: 1, maxlength: 100 }, // salary, hourly
    payScale: { required: true, type: String, minlength: 1, maxlength: 100 }, // amount, range
    payMin: { required: true, type: Number, minlength: 1, maxlength: 100 }, // if range, min
    payMax: { required: true, type: Number, minlength: 1, maxlength: 100 }, // if range, max
    pay: { required: true, type: Number, minlength: 1, maxlength: 100 }, // if amount
    notes: { type: String, minlength: 0, maxlength: 10000 }, // end result
    favorite: { required: true, type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
