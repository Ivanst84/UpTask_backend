import type { Request, Response } from 'express'
import Note, { INote } from '../models/Note'
import { Types } from 'mongoose'


type NoteParams = {
    noteId: Types.ObjectId
}
export class NoteController {
    static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
        const { content } = req.body
        const note = new Note()
        note.content = content
        note.createdBy = req.user.id
        note.task = req.task.id
        req.task.notes.push(note.id)
        try {
            await Promise.allSettled([ req.task.save(),note.save()])
            res.send('Nota creada correctamente')
        } catch (error) {
            return res.status(500).json({ error: 'Error creating note' })
        }

    }

    static getTaskNotes = async (req: Request, res: Response) => {
        try {
            const notes = await Note.find({ task: req.task.id })
            res.json(notes)

        } catch (error) {
            res.status(500).json({ error: 'Error getting notes' })
        }
    }

    static deleteNote = async (req: Request<NoteParams>, res: Response) => {
        const { noteId } = req.params
        const note = await Note.findById(noteId)
        if (!note) {
            const error = new Error('Note not found')
            return res.status(404).json({ error: error.message })
        }
        if (note.createdBy.toString() !== req.user._id.toString()) {

            const error = new Error('Accion no válida')
            return res.status(401).json({ error: error.message })
        }
            req.task.notes =req.task.notes.filter((note)=>note.toString()!==noteId.toString())
        try {
                await Promise.allSettled([note.deleteOne(),req.task.save()])
                res.send('Nota eliminada correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Error deleting note' })
        }

    }
}