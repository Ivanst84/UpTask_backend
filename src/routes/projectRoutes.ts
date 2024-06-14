import { Router } from 'express';
import { ProjectControllers } from '../controllers/ProjectController';
import {body,param} from 'express-validator';
import { handleInputError } from '../middleware/validation';
import Task from '../models/Task';
import { TaskController } from '../controllers/TaskController';
import {projectExists } from '../middleware/project';
import { hasAuthorization, taskBelongsToProject, taskExists } from '../middleware/task';
import { authenticate } from '../middleware/auth';
import { TeamMemberController } from '../controllers/TeamController';
import { NoteController } from '../controllers/NoteController';
const router = Router();
 router.use(authenticate)

router.post('/',
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto es requerido'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente es requerido'),
    body('description')
        .notEmpty().withMessage('La descripción del proyecto es requerida'),
    handleInputError,
    ProjectControllers.createProject);


router.get('/',ProjectControllers.getAllProject);


router.get('/:id',
param('id').isMongoId().withMessage('El id del proyecto no es válido'),
handleInputError,
ProjectControllers.getProjectById);
router.param('projectId', projectExists);


router.put('/:projectId',
param('projectId').isMongoId().withMessage('El id del proyecto no es válido'),

body('projectName')
.notEmpty().withMessage('El nombre del proyecto es requerido'),
body('clientName')
.notEmpty().withMessage('El nombre del cliente es requerido'),
body('description')
.notEmpty().withMessage('La descripción del proyecto es requerida'),
handleInputError,
hasAuthorization,
ProjectControllers.updateProject);

router.delete('/:projectId',
param('projectId').isMongoId().withMessage('El id del proyecto no es válido'),
handleInputError,
hasAuthorization,
ProjectControllers.deleteProject);

// Rutas para las tareas de un proyecto

router.post('/:projectId/tasks',
    hasAuthorization,
  body('name')
    .notEmpty().withMessage('El nombre de la tarea es requerido'),
    body('description')
    .notEmpty().withMessage('La descripción de la tarea es requerida'),
 TaskController.createTask

);

router.get('/:projectId/tasks',
    TaskController.getProjectTasks
    );

   router.param('taskId',taskExists)
   router.param('taskId',taskBelongsToProject)
    router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('El id de la tarea no es válido'),
    handleInputError,
    TaskController.getTaskById
    );
    router.put('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('El id de la tarea no es válido'),
    
    body('name')
    .notEmpty().withMessage('El nombre de la tarea es requerido'),
    body('description')
    .notEmpty().withMessage('La descripción de la tarea es requerida'),
    handleInputError,
    TaskController.updateTask
    );
    router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('El id de la tarea no es válido'),
    handleInputError,
    TaskController.deleteTask
    );
    router.post('/:projectId/tasks/:taskId/status',

    param('taskId').isMongoId().withMessage('El id de la tarea no es válido'),
    body('status')
    .notEmpty().withMessage('El status de la tarea es requerido'),  
    handleInputError,
    TaskController.updateStatus
    )

    /**   Routes for teams   */

    router.post('/:projectId/team/find',
    body('email')
    .isEmail().withMessage('El email no es válido'),
    handleInputError,
    TeamMemberController.findMemberByEmail

       
    )

    router.get('/:projectId/team',
    TeamMemberController.getProjectTeam

    )
    router.post('/:projectId/team/',
    body('id')
    .isMongoId().withMessage('El id del miembro del equipo no es válido'),
    handleInputError,
    TeamMemberController.addMemberById
    )
    router.delete('/:projectId/team/:userId',
    param('userId').isMongoId().withMessage('El id del miembro del equipo no es válido'),
    handleInputError,
    TeamMemberController.removeMemberById
    )
 // Routes for Notes
  router.post('/:projectId/tasks/:taskId/notes',
    body('content')
    .notEmpty().withMessage('El contenido de la nota es requerido'),
    handleInputError,
    NoteController.createNote
  )
    router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
                )

    router.delete('/:projectId/tasks/:taskId/notes/:noteId',
        param('noteId').isMongoId().withMessage('El id de la nota no es válido'),
        handleInputError,
        NoteController.deleteNote
    )

export default router