const fs=require('fs').promises
const path =require('path')
const tf = require('@tensorflow/tfjs');
const dataFilePath=path.join(__dirname,'../data/data.json')

const getAllTransports = async (filter = {}) => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    let transports = JSON.parse(data).transports;

    if (filter.start !== undefined && filter.end !== undefined) {
      transports = transports.filter(
        (transport) =>
          transport.id >= filter.start && transport.id <= filter.end
      );
    }

    return transports;
  } catch (error) {
    console.error('Error reading bus data:', error);
    throw new Error('Failed to retrieve bus data');
  }
};
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
const getTransportById = async (id) => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const transports = JSON.parse(data).transports;
    return transports.find((transport) => transport.id === id);
  } catch (error) {
    console.error('Error reading transport data:', error);
    throw new Error('Failed to retrieve transport data');
  }
};

const getRoutesByTransportId = async (id) => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const routes = JSON.parse(data).routes;
    return routes.filter((route) => route.transport_id === parseInt(id));
  } catch (error) {
    console.error('Error reading route data:', error);
    throw new Error('Failed to retrieve route data');
  }
};
module.exports = {
  getAllTransports,
  transportsWithRoutes,
  getTransportById,
  getRoutesByTransportId
};