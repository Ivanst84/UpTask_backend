import {Router} from 'express';
import  {body, param} from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { handleInputError } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
const router = Router();


router.post('/create-account',
body('name').notEmpty().withMessage('Nombre es requerido'),
body('email').isEmail().withMessage('Email no válido'),
body('password').isLength({min:8}).withMessage('Password debe tener al menos 6 caracteres'),
body('password_confirmation').custom((value,{req}) => {
    if(value !== req.body.password){
        throw new Error('Password y confirmación no coinciden')
    }
    return true
}
),
handleInputError,
AuthController.createAccount

)
router.post('/confirm-account',
body('token').notEmpty().withMessage('Token es requerido'),
handleInputError,
AuthController.confirmAccount
)

router.post('/login',
body('email').isEmail().withMessage('Email no válido'),
body('password').notEmpty().withMessage('Password es requerido'),
handleInputError,
AuthController.login
)

router.post('/request-code',
body('email').isEmail().withMessage('Email no válido'),
handleInputError,
AuthController.requestConfirmationCode
)


router.post('/forgot-password',
body('email').isEmail().withMessage('Email no válido'),
handleInputError,
AuthController.forgotPassword
)

router.post('/validate-token',
body('token').notEmpty().withMessage('El token no puede ir vacio'),
handleInputError,
AuthController.validateToken
)
router.post('/update-password/:token',
param('token').isNumeric().withMessage('Token no válido'),
body('password').isLength({min:8}).withMessage('Password debe tener al menos 6 caracteres'),
body('password_confirmation').custom((value,{req}) => {
    if(value !== req.body.password){
        throw new Error('Password y confirmación no coinciden')
    }
    return true
}),
handleInputError,
AuthController.updatePasswordWithToken
)
router.get('/user',
    authenticate,
    AuthController.user
)

/**Profile */
router.put('/profile',
    authenticate,
body('name').notEmpty().withMessage('Nombre es requerido'),
body('email').isEmail().withMessage('Email no válido'),
handleInputError,
    AuthController.updateProfile
)
router.post('/update-password',
    authenticate,
    body('current_password')
    .notEmpty().withMessage('Password actual es requerido'),
    body('password')
    .isLength({min:8}).withMessage('Password debe tener al menos 8 caracteres'),
    body('password_confirmation').custom((value,{req}) => {
        if(value !== req.body.password){
            throw new Error('Password y confirmación no coinciden')
        }
        return true
    }
    ),
    handleInputError,
    AuthController.updateCurrentUserPassword
)
router.post('/check-password',

    authenticate,
    body('password')
    .notEmpty().withMessage('Password es requerido'),
    handleInputError,
    AuthController.checkPassword
)


export default router;