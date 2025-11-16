


import express from 'express'
import { handleUserRegistered, TokenVerify } from '../../helpers/v1/controllers/auth.controllers'
import { Authentications } from '../../helpers/v1/middlewares/auth.m'


const router = express.Router()

router.route('/authenticate').post( handleUserRegistered)
router.route('/verify').get(Authentications , TokenVerify)


export default router