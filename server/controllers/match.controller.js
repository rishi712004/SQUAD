import * as matchService from "../services/match.service.js";

export const getMatchedUsers = async (req, res, next) => {
  try {
    const result = await matchService.getMatchedUsers(req.user.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getMatchedProjects = async (req, res, next) => {
  try {
    const result = await matchService.getMatchedProjects(req.user.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};