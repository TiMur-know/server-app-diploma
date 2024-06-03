const transportService =require('../services/transportService')

const getAllTransports = async (req, res) => {
  try {
    const { id, start, end } = req.query;

    if (id) {
      const transport = await transportService.getTransportById(parseInt(id, 10));
      if (!transport) {
        return res.status(404).json({ message: 'Transport not found' });
      }
      const routes = await transportService.getRoutesByTransportId(parseInt(id, 10));
      return res.status(200).json({ transport, routes });
    }

    const transports = await transportService.getAllTransports({
      start: start ? parseInt(start, 10) : undefined,
      end: end ? parseInt(end, 10) : undefined,
    });
    return res.status(200).json(transports);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
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