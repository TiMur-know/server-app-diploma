const fs = require('fs').promises;
const path = require('path');
const tf = require('@tensorflow/tfjs');
const dataFilePath = path.join(__dirname, '../data/data.json');

const calculateFuelPricePerKm = (fuelConsumptionPer100Km, pricePerLiter) => {
  return (fuelConsumptionPer100Km / 100) * pricePerLiter;
};

const calculateBaseTicketPrice = (
  distance,
  fuelPricePerKm,
  companyProfit,
  additionalExpenses
) => {
  const fuelCost = distance * fuelPricePerKm;
  const basePrice = fuelCost + additionalExpenses;
  const finalPrice = basePrice + basePrice * (companyProfit / 100);
  return finalPrice;
};

const getRoutes = async (filter = {}) => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    let routes = JSON.parse(data).routes;

    if (filter.start !== undefined && filter.end !== undefined) {
      routes = routes.filter(
        (route) =>
          route.route_id >= filter.start && route.route_id <= filter.end
      );
    }

    return routes;
  } catch (error) {
    console.error('Error reading route data:', error);
    throw new Error('Failed to retrieve route data');
  }
};

const getRoutesWithTransportName = async (filter = {}) => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const dataJson = JSON.parse(data);
    const routesWithDetails = dataJson.routes.map((route) => {
      const transport = dataJson.transports.find(
        (t) => t.id === route.transport_id
      );
      return {
        route_id: route.route_id,
        date: route.date,
        start_location: route.start_location,
        end_location: route.end_location,
        transport_name: transport ? transport.name : 'Unknown',
        start_time: route.start_time,
        end_time: route.end_time,
        fare_amount: route.fare_amount,
        fare_amount_currency: route.fare_amount_curency,
        bus_id: route.transport_id,
      };
    });
    return routesWithDetails;
  } catch (error) {
    console.error('Error retrieving routes with details:', error);
    throw new Error('Failed to retrieve routes with details');
  }
};
const parseFilterString = (filterString) => {
  const filterObj = {};
  const pairs = filterString.split('&');
  pairs.forEach((pair) => {
    const [key, value] = pair.split('=');
    filterObj[key] = value;
  });
  return filterObj;
};

const addRoute = async (route) => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const routes = JSON.parse(data).routes;
    routes.push(route);
    await fs.writeFile(dataFilePath, JSON.stringify({ routes }, null, 2));
    console.log('Route added successfully');
  } catch (error) {
    console.error('Error adding route:', error);
    throw new Error('Failed to add route');
  }
};
const updateRoute = async (id, route) => {
  const data = await fs.readFile(dataFilePath, 'utf-8');
  const routes = JSON.parse(data).routes;
  const index = routes.findIndex((r) => r.id === id);
  if (index !== -1) {
    routes[index] = { ...routes[index], ...route };
    await fs.writeFile(dataFilePath, JSON.stringify({ routes }, null, 2));
    console.log('Route updated successfully');
  } else {
    console.error('Route not found');
  }
};
const deleteRoute = async (id) => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    let routes = JSON.parse(data).routes;
    routes = routes.filter((route) => route.id !== id);
    await fs.writeFile(dataFilePath, JSON.stringify({ routes }, null, 2));
    console.log('Route deleted successfully');
  } catch (error) {
    console.error('Error deleting route:', error);
    throw new Error('Failed to delete route');
  }
};
const calculateAll = async () => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const parsedBusData = JSON.parse(data);
    const routesData = parsedBusData.routes;

    for (let i = 0; i < routesData.length; i++) {
      const route = routesData[i];
      const distance = route.route_distance;
      const transport = parsedBusData.transports.find(
        (t) => t.id === route.transport_id
      );

      if (transport) {
        const fuelPricePerKm = calculateFuelPricePerKm(
          transport.fuel_consumption,
          route.fuel_price_per_litter
        );
        let baseTicketPrice = calculateBaseTicketPrice(
          distance,
          fuelPricePerKm,
          transport.company_tax,
          transport.maintenance_cost
        );
        baseTicketPrice = baseTicketPrice / 30;
        route.fare_amount = Math.floor(baseTicketPrice * 100) / 100;
      }
    }

    const resultFilePath = path.join(__dirname, '../data/calc.json');
    await fs.writeFile(resultFilePath, JSON.stringify(parsedBusData, null, 2));
  } catch (error) {
    console.error('Error calculating prices:', error);
    throw new Error('Failed to calculate prices');
  }
};

module.exports = {
  getRoutes,
  addRoute,
  updateRoute,
  deleteRoute,
  calculateAll,
  getRoutesWithTransportName,
};
