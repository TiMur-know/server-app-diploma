const express =require('express')
const router=express.Router()
const utilsController=require('../controllers/utilController')
const utils1Controller=require('../controllers/util1Controller')

router.get('/',utilsController.getStandartUtil)
router.get('/structure',utils1Controller.getDataStructure)
router.get('/train',utils1Controller.postTrain)
router.post('/predict',utils1Controller.postPredict)
module.exports=router 