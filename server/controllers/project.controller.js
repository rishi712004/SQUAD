import * as projectService from "../services/project.service.js";

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.user.id, req.body);
    res.status(201).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

export const getFeed = async (req, res, next) => {
  try {
    const result = await projectService.getProjectFeed(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(
      req.params.id, req.user.id, req.body
    );
    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id, req.user.id);
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    next(err);
  }
};

export const applyToProject = async (req, res, next) => {
  try {
    await projectService.applyToProject(req.params.id, req.user.id);
    res.json({ success: true, message: "Application submitted" });
  } catch (err) {
    next(err);
  }
};

export const acceptApplicant = async (req, res, next) => {
  try {
    const project = await projectService.acceptApplicant(
      req.params.id, req.params.applicantId, req.user.id
    );
    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

export const rejectApplicant = async (req, res, next) => {
  try {
    const project = await projectService.rejectApplicant(
      req.params.id, req.params.applicantId, req.user.id
    );
    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
};