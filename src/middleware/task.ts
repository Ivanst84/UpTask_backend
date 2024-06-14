import type {Request, Response, NextFunction} from 'express';
import Task, { ITask } from '../models/Task';
declare global {
    namespace Express {
        interface Request {
            task:ITask
        }
    }
}
export async function taskExists(req: Request, res: Response, next: NextFunction) {
    try {
        const {taskId} = req.params; // Cambiado a minúsculas
        const task = await Task.findById(taskId); // Cambiado a minúsculas
        if (!task) {
            const error = new Error('Tarea no encontrada');
            return res.status(404).json({message: error.message});
        }
        req.task= task;
        next();
    } catch(error) {
        console.log(error)
        res.status(500).json({message: 'Internal server error'})
    }
}

    export async  function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
        if(req.task.project.toString() !== req.project._id.toString()){
            return res.status(403).json({message:'Accion no valida'})
        }
        next();
    }
    export async function hasAuthorization(req: Request, res: Response, next: NextFunction) {
        if(req.user.id.toString() !== req.project.manager.toString()){
        const error = new Error('Accion no valida');    }
        next();
    }
    

