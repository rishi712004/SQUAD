import User from "../models/User.js";
import Project from "../models/Project.js";
import Message from "../models/Message.js";

export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalProjects,
    totalMessages,
    recentUsers,
    projectsByStatus,
    userGrowth,
    topSkills,
  ] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Message.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(7).select("name avatar createdAt"),
    Project.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]),
    User.aggregate([
      { $unwind: "$skills" },
      { $group: { _id: "$skills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  return {
    totalUsers,
    totalProjects,
    totalMessages,
    recentUsers,
    projectsByStatus,
    userGrowth,
    topSkills,
  };
};