import asyncHandler from "express-async-handler";
import Poll from "../models/Poll.js";
import User from "../models/User.js";

// @desc    Get poll data
// @route   GET /api/poll
// @access  Public
export const getPoll = asyncHandler(async (req, res) => {
  let poll = await Poll.findOne().populate('voters.user', 'name email');
  if (!poll) {
    // Reset all users' votedPlayer field when creating a new poll
    await User.updateMany({}, { $unset: { votedPlayer: 1 } });
    poll = await Poll.create({ totalMessi: 0, totalRonaldo: 0, voters: [] });
  }
  res.json({
    totalMessi: poll.totalMessi,
    totalRonaldo: poll.totalRonaldo,
    voters: poll.voters || []
  });
});

// @desc    Vote in poll
// @route   POST /api/poll/vote
// @access  Private
export const votePoll = asyncHandler(async (req, res) => {
  const { player } = req.body; // "messi" or "ronaldo"
  const userId = req.user._id;

  if (!["messi", "ronaldo"].includes(player)) {
    res.status(400);
    throw new Error("Invalid player selection");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.votedPlayer) {
    res.status(400);
    throw new Error("You have already voted");
  }

  // Update poll
  let poll = await Poll.findOne();
  if (!poll) {
    // Reset all users' votedPlayer field when creating a new poll
    await User.updateMany({}, { $unset: { votedPlayer: 1 } });
    poll = await Poll.create({ totalMessi: 0, totalRonaldo: 0, voters: [] });
  }

  if (player === "messi") {
    poll.totalMessi += 1;
  } else {
    poll.totalRonaldo += 1;
  }

  // Add voter to the array
  poll.voters = [...poll.voters, {
    user: userId,
    player: player,
    votedAt: new Date()
  }];

  await poll.save();

  // Mark user as voted
  user.votedPlayer = player;
  await user.save();

  res.json({
    message: "Vote recorded successfully",
    totalMessi: poll.totalMessi,
    totalRonaldo: poll.totalRonaldo,
    voters: poll.voters
  });
});
