import Project from "../models/Project.js";
import Notification from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";

export const createProject = async (ownerId, data) => {
  const project = await Project.create({ ...data, owner: ownerId });
  return project.populate("owner", "name avatar skills");
};

export const getProjectById = async (id) => {
  const project = await Project.findById(id)
    .populate("owner", "name avatar skills bio")
    .populate("members", "name avatar skills")
    .populate("applicants", "name avatar skills");
  if (!project) throw new ApiError(404, "Project not found");
  return project;
};

export const getProjectFeed = async ({
  skills,
  status = "open",
  page = 1,
  limit = 10,
}) => {
  const filter = { status };
  if (skills) {
    filter.requiredSkills = { $in: skills.split(",").map((s) => s.trim()) };
  }

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate("owner", "name avatar skills")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Project.countDocuments(filter),
  ]);

  return { projects, total, pages: Math.ceil(total / limit) };
};

export const updateProject = async (projectId, ownerId, updates) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");
  if (project.owner.toString() !== ownerId)
    throw new ApiError(403, "Only the owner can update this project");

  const ALLOWED = [
    "title", "description", "requiredSkills", "techStack",
    "tags", "maxMembers", "duration", "lookingFor", "status",
  ];
  const sanitized = Object.fromEntries(
    Object.entries(updates).filter(([k]) => ALLOWED.includes(k))
  );

  Object.assign(project, sanitized);
  await project.save();
  return project;
};

export const deleteProject = async (projectId, ownerId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");
  if (project.owner.toString() !== ownerId)
    throw new ApiError(403, "Only the owner can delete this project");
  await project.deleteOne();
};

export const applyToProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");
  if (project.owner.toString() === userId)
    throw new ApiError(400, "Owner cannot apply to their own project");
  if (project.members.includes(userId))
    throw new ApiError(409, "Already a member");
  if (project.applicants.includes(userId))
    throw new ApiError(409, "Already applied");
  if (project.status !== "open")
    throw new ApiError(400, "Project is not accepting applications");

  project.applicants.push(userId);
  await project.save();

  // notify owner
  await Notification.create({
    recipient: project.owner,
    sender: userId,
    type: "project_apply",
    ref: project._id,
    refModel: "Project",
    message: `Someone applied to your project "${project.title}"`,
  });

  return project;
};

export const acceptApplicant = async (projectId, applicantId, ownerId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");
  if (project.owner.toString() !== ownerId)
    throw new ApiError(403, "Only the owner can accept applicants");
  if (!project.applicants.map((id) => id.toString()).includes(applicantId))
    throw new ApiError(400, "User has not applied to this project");
  if (project.members.length >= project.maxMembers)
    throw new ApiError(400, "Project is already full");

  project.members.addToSet(applicantId);
  project.applicants = project.applicants.filter(
    (id) => id.toString() !== applicantId
  );
  await project.save();

  await Notification.create({
    recipient: applicantId,
    sender: ownerId,
    type: "project_accepted",
    ref: project._id,
    refModel: "Project",
    message: `You were accepted into "${project.title}"`,
  });

  return project;
};

export const rejectApplicant = async (projectId, applicantId, ownerId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");
  if (project.owner.toString() !== ownerId)
    throw new ApiError(403, "Only the owner can reject applicants");

  project.applicants = project.applicants.filter(
    (id) => id.toString() !== applicantId
  );
  await project.save();

  await Notification.create({
    recipient: applicantId,
    sender: ownerId,
    type: "project_rejected",
    ref: project._id,
    refModel: "Project",
    message: `Your application to "${project.title}" was not accepted`,
  });

  return project;
};