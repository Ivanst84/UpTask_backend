import mongoose, {Schema,Document,PopulatedDoc,Types} from "mongoose";
import Task, { ITask } from "./Task";
import { IUser } from "./User";
import Note from "./Note";
// este es modelo  de typescript
export interface IProject extends  Document {
    projectName: string;
    clientName: string;
    description:string;
   tasks:PopulatedDoc<ITask & Document>[]
   manager:PopulatedDoc<IUser & Document>
   team:PopulatedDoc<IUser & Document>[]


}
// tipo de datos de la base de datos de MongoDB
const ProjectSchema = new Schema({
    projectName: {type: String, required: true,trim:true},
    clientName: {type: String, required: true,trim:true},
    description: {type: String, required: true},
    tasks: [
        {
            type: Types.ObjectId,
            ref: 'Task'
        }
    ],
    manager: {
        type: Types.ObjectId,
        ref: 'User'
    },
    team: [
        {
            type: Types.ObjectId,
            ref: 'User'
        }
    ],
}, { timestamps: true })

ProjectSchema.pre('deleteOne', { document: true}, async function () {
const projectId=this._id
if(!projectId) return
const tasks = await Task.find({project : projectId})
for(const task of tasks){

    await Note.deleteMany({task:task._id})
}
//borrar las tareas asociadas al proyecto
await Task.deleteMany({project:projectId})
})
 

const Project=mongoose.model<IProject>('Project',ProjectSchema)
export default Project