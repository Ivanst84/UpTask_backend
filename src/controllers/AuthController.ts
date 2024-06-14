
import type { Request, Response } from 'express'
import User from '../models/User'
import bcrypt from 'bcrypt'
import { checkPassword, hashPassword } from '../util/auth'
import Token from '../models/Token'
import { generateToken } from '../util/token'
import { AuthEmail } from '../emails/AuthEmail'
import { generateJWT } from '../util/jwt'
export class AuthController {


    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body

            // prevenir duplicados
            const userExists = await User.findOne({ email })
            if (userExists) {
                const error = new Error('El usuario ya esta registrado')
                return res.status(409).json({ msg: error.message })
            }
            // crea el usuario
            const user = new User(req.body)

            //Hashear el password
            user.password = await hashPassword(password)
            //Crear un token de confirmación
            const token = new Token()
            token.token = generateToken()
            token.user = user._id

            //Enviar email de confirmación
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })



            //Guardar en la base de datos
            await Promise.all([token.save(), user.save()])
            res.send('Cuenta creada, revisa tu email para comprobarla')

        } catch (error) {
            console.error(error)
            res.status(500).json({ msg: "Hubo un error" })
        }
    }


    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token
                .findOne({ token })
                .populate('user')
            if (!tokenExists) {
                const error = new Error('Token no válido')
                return res.status(400).json({ error: error.message })
            }
            const user = await User.findById(tokenExists.user)
            user.confirmed = true
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('Cuenta confirmada correctamente')
        } catch (error) {
            console.error(error)
            res.status(500).json({ msg: "Hubo un error" })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {

            const { email, password } = req.body
            const user = await User
                .findOne({ email })
                .select('+password')
            if (!user) {
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({ error: error.message })
            }
            if (!user.confirmed) {
                const token = new Token()
                token.user = user._id
                token.token = generateToken()
                await token.save()
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })
                const error = new Error('Cuenta no confirmada, se a mandado un token reciba tu correo')
                return res.status(400).json({ error: error.message })
            }
            const isPasswordCorrect = await checkPassword(password, user.password)
            if (!isPasswordCorrect) {
                const error = new Error('Password incorrecto')
                return res.status(400).json({ error: error.message })
            }

            const token = generateJWT({ id: user._id })
            res.send(token)
        } catch (error) {
            console.error(error)
            res.status(500).json({ msg: "Hubo un error" })
        }


    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            //  usuario existe
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('El usuario no esta registrado')
                return res.status(404).json({ error: error.message })
            }
            if (user.confirmed) {
                const error = new Error('La cuenta ya esta confirmadda')
                return res.status(403).json({ error: error.message })
            }


            //Crear un token de confirmación
            const token = new Token()
            token.token = generateToken()
            token.user = user._id

            //Enviar email de confirmación
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })



            //Guardar en la base de datos
            await Promise.all([token.save(), user.save()])
            res.send('Se envio el nuevo token a tu email')

        } catch (error) {
            console.error(error)
            res.status(500).json({ msg: "Hubo un error" })
        }
    }


    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            const user = await
                User.findOne({
                    email
                })
            if (!user) {
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({ error: error.message })
            }
            const token = new Token()
            token.token = generateToken()
            token.user = user._id
            await token.save()
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })
            res.send('Revista tu email para instrucciones')
        } catch (error) {
            console.error(error)
            res.status(500).json({ msg: "Hubo un error" })
        }


    }


    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token
                .findOne({ token })
                .populate('user')
            if (!tokenExists) {
                const error = new Error('Token no válido')
                return res.status(400).json({ error: error.message })
            }

            res.send('Token válido,Define tu nuevo password')
        } catch (error) {
            console.error(error)
            res.status(500).json({ msg: "Hubo un error" })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const tokenExists = await Token
                .findOne({ token })
                .populate('user')
            if (!tokenExists) {
                const error = new Error('Token no válido')
                return res.status(400).json({ error: error.message })
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(req.body.password)
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.send('Password se modifico correctamente')
        } catch (error) {
            console.error(error)
            res.status(500).json({ msg: "Hubo un error" })
        }
    }



    static user = async (req: Request, res: Response) => {
        return res.json(req.user)

    }

    static updateProfile = async (req: Request, res: Response) => {
        try {
            const { name, email } = req.body
            const userExists = await User.findOne({ email   })
            if (userExists && userExists._id.toString() !== req.user.id.toString()){
                const error = new Error('El email ya esta en uso')
                return res.status(409).json({ error: error.message })
            }
            const user = await User.findById(req.user.id)
            user.name = name
            user.email = email
            await user.save()
            res.send('Perfil actualizado correctamente')
                } catch (error) {
            console.error(error)
            res.status(500).send( "Hubo un error" )
        }

    }


    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        try {
            const {current_password, password } = req.body
            const user = await User.findById(req.user.id
            )
            const isPasswordCorrect = await checkPassword(current_password, user.password)

            if (!isPasswordCorrect) {
                const error = new Error('Password actual incorrecto')
                return res.status(401).json({ error: error.message })
            }
            user.password = await hashPassword(password)
            await user.save()
            res.send('Password actualizado correctamente')
         } catch (error) {
            console.error(error)
            res.status(500).send("Hubo un error")
        }
    }   
    
    static checkPassword = async (req: Request, res: Response) => {
        try {
            const { password } = req.body
            const user = await User.findById(req.user.id)
            const isPasswordCorrect = await checkPassword(password, user.password)
            if (!isPasswordCorrect) {
                const error = new Error('Password incorrecto')
                return res.status(401).json({ error: error.message })
            }
            res.send('Password correcto')
        } catch (error) {
            console.error(error)
            res.status(500).send("Hubo un error")
        }

}}