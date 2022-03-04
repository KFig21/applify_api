require("dotenv");
const router = require("express").Router();
const User = require("../models/user");
const Board = require("../models/Board");
const Job = require("../models/Job");
const joi = require("joi");
const bodyParser = require("body-parser");

// create new job
router.post("/new", async (req, res, next) => {
  const schema = joi.object({
    user: joi.required(),
    board: joi.required(),
    company: joi.string().min(3).max(50).required(),
    position: joi.string().min(3).max(50).required(),
    applied: joi.boolean().required(),
    appDate: joi.string().min(0).max(50).required(),
    city: joi.string().min(3).max(50).required(),
    locationState: joi.string().min(1).max(50).required(),
    remote: joi.string().required(),
    status: joi.string().required(),
    result: joi.string().required(),
    jobtype: joi.string().required(),
    jobsite: joi.string().min(3).max(50).required(),
    username: joi.string().min(0).max(50).required(),
    password: joi.string().min(0).max(50).required(),
    link: joi.string().min(3).max(500).required(),
    payType: joi.string(),
    payScale: joi.string(),
    payMin: joi.number(),
    payMax: joi.number(),
    pay: joi.number(),
    notes: joi.string().min(0).max(10000).required(),
    favorite: joi.boolean().required(),
  });
  // Extract the validation errors from a request.
  const { error } = schema.validate(req.body);
  if (!error) {
    try {
      const user = await User.findById(req.body.user);
      let board = await Board.findById(req.body.board);

      // create new job
      const newJob = await new Job({
        user: user,
        board: board,
        company: req.body.company,
        position: req.body.position,
        applied: req.body.applied,
        appDate: req.body.appDate,
        city: req.body.city,
        locationState: req.body.locationState,
        remote: req.body.remote,
        status: req.body.status,
        result: req.body.result,
        jobtype: req.body.jobtype,
        jobsite: req.body.jobsite,
        username: req.body.username,
        password: req.body.password,
        link: req.body.link,
        payType: req.body.payType,
        payScale: req.body.payScale,
        payMin: req.body.payMin,
        payMax: req.body.payMax,
        pay: req.body.pay,
        notes: req.body.notes,
        favorite: req.body.favorite,
      });
      const savedJob = await newJob.save();
      // save board and return response
      try {
        board.jobs = [...board.jobs, savedJob._id];
        board = await board.save();
        res.status(200).json(savedJob);
      } catch (err) {
        res.status(500).json(err);
      }
    } catch (err) {
      return next(err);
    }
  } else {
    console.log(error.details[0].message);
    res.status(500).send(error.details[0].message);
  }
});

// GET all jobs from a single board
router.get(
  "/:id/:skip/:sort/:order/:limit/:filter/:filterCol",
  async (req, res, next) => {
    try {
      const board = await Board.findById(req.params.id).populate("jobs");
      let sortBy = req.params.sort;
      let order = parseInt(req.params.order);
      let skip = parseInt(req.params.skip);
      let limit = parseInt(req.params.limit);
      let filter = req.params.filter;
      let filterCol = req.params.filterCol;
      if (
        sortBy === "city" ||
        sortBy === "locationState" ||
        sortBy === "company" ||
        sortBy === "position"
      ) {
        order = order * -1;
      }
      let jobs = [];
      let jobsPipeline = [];

      const getBoardJobs = async () => {
        await Promise.all(
          board.jobs.map(async (jobId) => {
            let job = await Job.findById(jobId);
            return jobs.push({ _id: job._id });
          })
        );
      };

      const buildPipeline = async () => {
        let pipeline;

        // set the sort obj
        var sort = {};
        sort[sortBy] = order;
        if (sortBy !== "appDate") {
          sort["appDate"] = -1;
        }
        sort["createdAt"] = -1;

        if (jobs.length > 0) {
          // check if filtered
          if (filter !== "none" && filterCol !== "none") {
            // check if a boolean
            if (filter === "true") {
              filter = true;
            }
            if (filter === "false") {
              filter = false;
            }
            pipeline = [
              {
                $match: {
                  $or: await jobs,
                  [filterCol]: filter,
                },
              },
              { $sort: sort },
              { $skip: skip },
              { $limit: limit },
            ];
          } else {
            pipeline = [
              {
                $match: {
                  $or: await jobs,
                },
              },
              { $sort: sort },
              { $skip: skip },
              { $limit: limit },
            ];
          }
          jobsPipeline = await Job.aggregate(pipeline);
          res.status(200).json(jobsPipeline);
        } else {
          jobsPipeline = [];
          res.status(200).json(jobsPipeline);
        }
      };

      getBoardJobs().then(() => buildPipeline());
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// EDIT a job
router.put("/edit", async (req, res, next) => {
  const schema = joi.object({
    user: joi.required(),
    job: joi.required(),
    board: joi.required(),
    company: joi.string().min(3).max(50).required(),
    position: joi.string().min(3).max(50).required(),
    applied: joi.boolean().required(),
    appDate: joi.string().min(0).max(50).required(),
    city: joi.string().min(3).max(50).required(),
    locationState: joi.string().min(1).max(50).required(),
    remote: joi.string().required(),
    status: joi.string().required(),
    result: joi.string().required(),
    jobtype: joi.string().required(),
    jobsite: joi.string().min(3).max(50).required(),
    username: joi.string().min(0).max(50).required(),
    password: joi.string().min(0).max(50).required(),
    link: joi.string().min(3).max(500).required(),
    payType: joi.string(),
    payScale: joi.string(),
    payMin: joi.number(),
    payMax: joi.number(),
    pay: joi.number(),
    notes: joi.string().min(0).max(10000).required(),
    favorite: joi.boolean().required(),
  });
  // Extract the validation errors from a request.
  const { error } = schema.validate(req.body);
  if (!error) {
    try {
      // update job
      const job = await Job.findByIdAndUpdate(req.body.job, {
        $set: req.body,
      });
      // update board
      let board = await Board.findById(req.body.board);
      board.updatedAt = Date.now();
      board = await board.save();

      return res.status(200).json("Job has been updated");
    } catch (err) {
      return next(err);
    }
  } else {
    console.log(error.details[0].message);
    res.status(500).send(error.details[0].message);
  }
});

// FAV a job
router.put("/favorite/:id", async (req, res, next) => {
  let job = await Job.findById(req.params.id);
  if (job) {
    job.favorite = !job.favorite;
    job = await job.save();
    // update board
    let board = await Board.findById(job.board);
    board.updatedAt = Date.now();
    board = await board.save();

    res.status(200).json(job);
  } else {
    console.log(error.details[0].message);
    res.status(500).send(error.details[0].message);
  }
});

// DELETE a job
router.delete("/delete", async (req, res, next) => {
  const schema = joi.object({
    user: joi.required(),
    job: joi.required(),
    board: joi.required(),
  });
  // Extract the validation errors from a request.
  const { error } = schema.validate(req.body.data);
  if (!error) {
    // update board
    let board = await Board.findById(req.body.data.board);
    let newJobs = await board.jobs.filter(
      (job_index) => job_index.toString() !== req.body.data.job.toString()
    );
    board.jobs = [...newJobs];
    board = await board.save();

    try {
      await Job.findByIdAndDelete(req.body.data.job);
      res.status(200).json("Job has been deleted");
    } catch (err) {
      console.log(error);
      return next(err);
    }
  } else {
    console.log(error.details[0].message);
    res.status(500).send(error.details[0].message);
  }
});

module.exports = router;
