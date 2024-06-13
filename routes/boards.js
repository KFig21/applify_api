require("dotenv");
const router = require("express").Router();
const User = require("../models/User");
const Board = require("../models/Board");
const Job = require("../models/Job");
const joi = require("joi");

// create new board
router.post("/new", async (req, res, next) => {
  const schema = joi.object({
    boardname: joi.string().min(3).max(40).required(),
    user: joi.required(),
  });
  // Extract the validation errors from a request.
  const { error } = schema.validate(req.body);
  if (!error) {
    try {
      const boardname = req.body.boardname;
      const userId = req.body.user;
      // get user
      const user = await User.findById(userId);
      // check if board name is already in use
      const isBoardnameInDB = await Board.find({
        boardname: boardname,
        user: userId,
      });
      if (isBoardnameInDB.length > 0) {
        return res.status(500).json("Board name already in use");
      }
      // create new board
      const newBoard = await new Board({
        boardname: boardname,
        user: userId,
        jobs: [],
      });
      const savedBoard = await newBoard.save();
      // save user and return response
      try {
        user.boards = [...user.boards, savedBoard._id];
        user = await user.save();
        res.status(200).json(savedBoard);
      } catch (err) {
        res.status(500).json(err);
      }
    } catch (err) {
      return next(err);
    }
  } else {
    res.status(500).send(error.details[0].message);
  }
});

// GET single board
router.get("/:id/:filter/:filterCol", async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id).populate("jobs");
    let filter = req.params.filter;
    const filterCol = req.params.filterCol;
    let waiting = 0;
    let applications = board.jobs.length;

    const pipeline = [{ $match: { _id: board._id } }];
    const data = await Board.aggregate(pipeline);

    // check if filtered
    if (filter !== "none" && filterCol !== "none") {
      applications = 0;
      // check if a boolean
      if (filter === "true") {
        filter = true;
      }
      if (filter === "false") {
        filter = false;
      }
      board.jobs.forEach((job) => {
        if (job[filterCol] === filter) {
          applications++;
        }
        if (job[filterCol] === filter && job.result === "waiting") {
          waiting++;
        }
      });
    } else {
      board.jobs.forEach((job) => {
        if (job.result === "waiting") {
          waiting++;
        }
      });
    }

    data[0]["waiting"] = waiting;
    data[0]["applications"] = applications;
    res.status(200).json(...data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET all boards from a user
router.get("/all/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("boards");

    let boards = [];
    let boardsPipeline = [];

    const getUserBoards = async () => {
      await Promise.all(
        user.boards.map(async (board_id) => {
          let board = await Board.findById(board_id);
          return boards.push({ _id: board._id });
        })
      );
    };

    const buildPipeline = async () => {
      let pipeline;
      if (boards.length > 0) {
        pipeline = [
          {
            $match: {
              $or: await boards,
            },
          },
          { $sort: { favorite: -1, updatedAt: -1 } },
        ];
        boardsPipeline = await Board.aggregate(pipeline);
        res.status(200).json(boardsPipeline);
      } else {
        boardsPipeline = [];
        res.status(200).json(boardsPipeline);
      }
    };

    getUserBoards().then(() => buildPipeline());
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// UPDATE board name
router.put("/:id", async (req, res, next) => {
  try {
    let board = await Board.findById(req.body.boardId);
    board.boardname = req.body.boardname;
    // check if board name is already in use
    const isBoardnameInDB = await Board.find({
      boardname: req.body.boardname,
      user: req.body.user,
    });
    if (isBoardnameInDB.length > 0) {
      return res.status(500).json("Board name already in use");
    }
    // save the new boardname
    const savedBoard = await board.save();
    res.status(200).json(savedBoard);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// FAV a board
router.put("/favorite/:id", async (req, res, next) => {
  let board = await Board.findById(req.params.id);
  if (board) {
    board.favorite = !board.favorite;
    board = await board.save();

    res.status(200).json(board);
  } else {
    console.log(error.details[0].message);
    res.status(500).send(error.details[0].message);
  }
});

// DELETE a board
router.delete("/delete", async (req, res, next) => {
  const schema = joi.object({
    user: joi.required(),
    board: joi.required(),
  });
  // Extract the validation errors from a request.
  const { error } = schema.validate(req.body.data);
  if (!error) {
    try {
      // get the board
      let board = await Board.findById(req.body.data.board).populate("jobs");

      // delete jobs in board from jobs collection
      const removeFromJobsCollection = async () => {
        board.jobs.forEach(async (job_index) => {
          let job = await Job.findById(job_index._id);
          job.deleteOne();
        });
      };

      // delete board from user
      const removeFromUser = async () => {
        let user = await User.findById(req.body.data.user);
        let newBoards = await user.boards.filter(
          (board_index) =>
            board_index.toString() !== req.body.data.board.toString()
        );
        user.boards = [...newBoards];
        user = await user.save();
      };

      // delete board
      const removeBoard = async () => {
        await board.deleteOne();
      };

      removeFromJobsCollection()
        .then(() => removeFromUser())
        .then(() => removeBoard());

      return res.status(200).json("Board has been deleted");
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
