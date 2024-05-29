const express =require('express')
const router=express.Router()
const transportController=require('../controllers/transportController')


router.get('/',transportController.getAllTransports)


module.exports=router 