import * as analyticsService from "../services/analytics.service.js";

export const getStats = async (req, res, next) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
};