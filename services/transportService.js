const fs=require('fs').promises
const path =require('path')
const tf = require('@tensorflow/tfjs');
const dataFilePath=path.join(__dirname,'../data/data.json')

const getAllTransports=async(filter={})=>{
	try{
		const data=await fs.readFile(dataFilePath,'utf-8')
		let transports=JSON.parse(data).transports

		if (filter) {
      transports = transports.filter(transport => {
        let match = true;
        for (const key in filter) {
          if (filter.hasOwnProperty(key)) {
            if (transport[key] !== filter[key]) {
              match = false;
              break;
            }
          }
        }
        return match;
      });
    }
		return transports;
	}
	catch(error){
		console.error('Error reading bus data:', error);
    throw new Error('Failed to retrieve bus data');
	}
}
const transportsWithRoutes = async () => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const parsedData = JSON.parse(data);
    const transports = parsedData.transports;
    const routes = parsedData.routes;
    const result = transports.map(transport => {
      const associatedRoutes = routes.filter(route => route.transport_id === transport.id);
      return {
        ...transport,
        routes: associatedRoutes
      };
    });
    return result;
  } catch (error) {
    console.error('Error retrieving transports with routes:', error);
    throw new Error('Failed to retrieve transports with routes');
  }
};

module.exports = {
  getAllTransports,
  transportsWithRoutes
};


module.exports={
	getAllTransports,transportsWithRoutes
}