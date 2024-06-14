import { token } from "morgan"
import { transporter } from "../config/nodemailer"


interface IEmail {
    email:string,
    name:string,
    token:string
}
export class AuthEmail {

    static sendConfirmationEmail  =async (user:IEmail) => {


        await transporter.sendMail({
            from: 'UpTask <admin@uptask.com',
            to: user.email,
            subject: 'Confirma tu cuenta',
            text: 'Uptask- Confirma tu cuenta',
            html: `<p>Hola ${user.name}, has creado tu cuenta en Upstaks, ya casi esta todo listo, solo debes confirmar 
            tu cuenta</p>
            <p>Visita el siguiente enlace : </p>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
            <p>E ingresa el codigo : <b>${user.token}</b></p>
            <p>Este Token expira en 10 min</p>
            `
        })
        console.log('mensaje enviado')

    }


    static sendPasswordResetToken  =async (user:IEmail) => {


        await transporter.sendMail({
            from: 'UpTask <admin@uptask.com',
            to: user.email,
            subject: 'Restablece tu Password',
            text: 'Uptask- Restablece tu Password',
            html: `<p>Hola ${user.name}, Has solicitado reestablecer tu passsword</p>
            <p>Visita el siguiente enlace : </p>
            <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer Password</a>
            <p>E ingresa el codigo : <b>${user.token}</b></p>
            <p>Este Token expira en 10 min</p>
            `
        })
        console.log('mensaje enviado')

    }


}