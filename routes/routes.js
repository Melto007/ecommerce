import express from 'express'
const router = express.Router()
import { isLoggedIn } from '../middlewares/auth.middleware.js'
import { signup, login, logout, forgotpassword, resetPassword, changePassword } from '../controllers/auth.controller.js'

router.post('/api/auth/signup', signup)
router.post('/api/auth/login', login)
router.post('/api/auth/logout', logout)
router.post('/api/auth/password/forgot', forgotpassword)
router.post('/api/auth/password/reset/:token', resetPassword)
router.post('/api/auth/password/changepassword', isLoggedIn, changePassword)

export default router