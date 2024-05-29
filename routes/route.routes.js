const express =require('express')
const router=express.Router()
const routeController=require('../controllers/routeController')

router.get('/',routeController.getAllRoutes)
router.get('/pasang',routeController.getAllRoutesWithBusName)
router.get('/calculate',routeController.getCalculateAll)
module.exports=router 