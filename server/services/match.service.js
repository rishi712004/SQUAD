import User from "../models/User.js";
import Project from "../models/Project.js";
import { buildVector, cosineSimilarity } from "../utils/matching.js";
import { ApiError } from "../utils/ApiError.js";

export const getMatchedUsers = async (userId) => {
  const currentUser = await User.findById(userId).select("skills");
  if (!currentUser) throw new ApiError(404, "User not found");

  if (!currentUser.skills.length)
    return { matches: [], message: "Add skills to your profile to see matches" };

  const candidates = await User.find({
    _id: { $ne: userId },
    skills: { $exists: true, $ne: [] },
  }).select("name avatar bio skills github linkedin");

  const universe = [
    ...new Set([
      ...currentUser.skills,
      ...candidates.flatMap((c) => c.skills),
    ]),
  ];

  const queryVec = buildVector(currentUser.skills, universe);

  const matches = candidates
    .map((c) => ({
      user: c,
      score: parseFloat(
        cosineSimilarity(queryVec, buildVector(c.skills, universe)).toFixed(3)
      ),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return { matches };
};

export const getMatchedProjects = async (userId) => {
  const currentUser = await User.findById(userId).select("skills");
  if (!currentUser) throw new ApiError(404, "User not found");

  if (!currentUser.skills.length)
    return { matches: [], message: "Add skills to your profile to see project matches" };

  const projects = await Project.find({ status: "open" }).populate(
    "owner",
    "name avatar skills"
  );

  const matches = projects
    .map((p) => {
      const universe = [
        ...new Set([...currentUser.skills, ...p.requiredSkills]),
      ];
      const userVec = buildVector(currentUser.skills, universe);
      const projVec = buildVector(p.requiredSkills, universe);
      return {
        project: p,
        score: parseFloat(cosineSimilarity(userVec, projVec).toFixed(3)),
      };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  return { matches };
};