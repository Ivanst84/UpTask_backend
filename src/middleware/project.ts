import type {Request, Response, NextFunction} from 'express';
import Project, { IProject } from '../models/Project';
declare global {
    namespace Express {
        interface Request {
            project:IProject
        }
    }
}
export async function projectExists(req: Request, res: Response, next: NextFunction) {
    try {
        const {projectId} = req.params; // Cambiado a minúsculas
        const project = await Project.findById(projectId); // Cambiado a minúsculas
        console.log(project)
        if (!project) {
            return res.status(404).json({message: 'Project not found'});
        }
        req.project = project;
        next();
    } catch(error) {
        console.log(error)
        res.status(500).json({message: 'Internal server error'})
    }
}
