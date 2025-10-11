import {Router} from 'express'
import { getChat } from './chat.service.js'
import { authenticate } from '../../middleware/auth.js'

export const chatRouter=Router()

// userId can be the sender or receiver but that's be goot to put it as receiver
chatRouter.get("/getchat/:userId",authenticate,getChat)