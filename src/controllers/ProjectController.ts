import type { Request, Response } from 'express'
import Project from '../models/Project'

export class ProjectControllers {



    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)
        // Asignar un manager
        project.manager = req.user.id


        try {
            await project.save()
            res.send('proyecto creado correctamente')
        } catch (error) {
            console.log(error)


        }

    }

    static getAllProject = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                $or: [
                    { manager: { $in: req.user.id } },
                    { team: { $in: req.user.id } }
                ]
            })
            res.json(projects)
        } catch (error) {
            console.log(error)
        }


    }

    static getProjectById = async (req: Request, res: Response) => {

        const { id } = req.params

        try {
            const project = await Project.findById(req.params.id).populate('tasks')

            if (!project) {
                return res.status(404).json({ msg: 'Proyecto no encontrado' })
            }

            if (project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {
                const error = new Error('No autorizado')
                return res.status(401).json({ error: error.message })

            }
            res.json(project)
        } catch (error) {
            console.log(error)
        }
    }
    static updateProject = async (req: Request, res: Response) => {
        try {



            req.project.clientName = req.body.clientName
            req.project.projectName = req.body.projectName
            req.project.description = req.body.description
            await req.project.save()
            res.send('Proyecto actualizado correctamente')
        } catch (error) {
            console.log(error)
        }

    }
    static deleteProject = async (req: Request, res: Response) => {
        try {


            await req.project.deleteOne()
            res.send('Eliminado correctamente')
        }
        catch (error) {
            console.log(error)
        }
    }

}