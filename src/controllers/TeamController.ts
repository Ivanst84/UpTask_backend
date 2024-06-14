import type { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamMemberController {
    static findMemberByEmail = async(req:Request,res:Response)=>{
        const {email}=req.body;
        try {
            const user=await
            User.findOne({email}).select('id email name');
            if(!user){
                const error = new Error('Usuario no encontrado');   
                return res.status(404).json({error:error.message})
            }
            res.status(200).json(user)
        } catch (error) {
            console.log(error)
            res.status(500).json({msg:'Error en el servidor'})
        }
    }


 static  addMemberById = async(req:Request,res:Response)=>
    {
    const {id}=req.body;
    const {projectId}=req.params;
    
        const project=await Project.findById(projectId);
        if(!project){
            const error = new Error('Proyecto no encontrado');   
            return res.status(404).json({error:error.message})
        }
        const user=await User.findById(id).select('id');
        if(!user){
            const error = new Error('Usuario no encontrado');   
            return res.status(404).json({error:error.message})
        }
        if(project.team.some(team=>team.toString()===user.id.toString())){
            const error = new Error('Usuario ya es miembro del equipo');
            return res.status(409).json({error:error.message})
        }

                    req.project.team.push(user.id)

await req.project.save();
res.send('Usuario agregado correctamente ')
   
}

static getProjectTeam = async(req:Request,res:Response)=>{
    const project = await Project.findById(req.project.id).populate ({
    path:'team',
    select:' id name email'
    })

  res.json(project.team)
}


static removeMemberById = async(req:Request,res:Response)=>{

    const {userId}=req.params;
    if(!req.project.team.some(team=>team.toString()===userId)){
        const error = new Error('Usuario no es miembro del equipo');
        return res.status(409).json({error:error.message})
    }
    req.project.team=req.project.team.filter(team=>team.toString()!==userId);

    await req.project.save();
    res.send('Usuario eliminado correctamente')
        
}
}