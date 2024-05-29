const transportService =require('../services/transportService')

const getAllTransports = async (req, res) => {
  try {
    const transportes = await  transportService.getAllTransports();
    res.status(200).json(transportes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getTransportsWithRoutes=async(req,res)=>{
  try{
    const data=await transportService.transportsWithRoutes()
    res.status(200).json(data)
  }
  catch(error){
    res.status(500).json({message:''})
  }
}

module.exports={
	getAllTransports,getTransportsWithRoutes
}