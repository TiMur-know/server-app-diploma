const routeService =require('../services/routesService')
const getAllRoutes = async (req, res) => {
  try {
    const routes = await routeService.getRoutes();
    res.status(200).json(routes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
const getAllRoutesWithBusName = async (req, res) => {
  try {
    const data = await routeService.getRoutesWithTransportName();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getCalculateAll = async (req, res) => {
  try {
    await routeService.calculateAll();
    res.status(200).json({ message: 'Calculate Good' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports={
	getAllRoutes,getAllRoutesWithBusName,getCalculateAll
}