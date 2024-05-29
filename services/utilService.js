
const fs=require('fs').promises
const path =require('path')

const dataFilePath = path.join(__dirname, '../data/data.json');
const modelsPath = path.join(__dirname, '../models');
const tf =require('@tensorflow/tfjs')
const getType = (value) => {
  if (Array.isArray(value)) {
    return 'array';
  } else if (typeof value === 'object' && value !== null) {
    return 'object';
  } else {
    return typeof value;
  }
};
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const getStructure = (obj, typeDefinitions = {}, parentKey = 'Root') => {
  const typeName = capitalize(parentKey);
  if (!typeDefinitions[typeName]) {
    typeDefinitions[typeName] = {};
  }

  for (const key in obj) {
    const value = obj[key];
    const type = getType(value);

    if (type === 'object') {
      const nestedTypeName = `${typeName}${capitalize(key)}`;
      getStructure(value, typeDefinitions, `${typeName}${capitalize(key)}`);
      typeDefinitions[typeName][key] = nestedTypeName;
    } else if (type === 'array') {
      if (value.length > 0) {
        const arrayType = getType(value[0]);
        if (arrayType === 'object') {
          const nestedTypeName = `${typeName}${capitalize(key)}Item`;
          getStructure(value[0], typeDefinitions, `${typeName}${capitalize(key)}Item`);
          typeDefinitions[typeName][key] = `${nestedTypeName}[]`;
        } else {
          typeDefinitions[typeName][key] = `${arrayType}[]`;
        }
      } else {
        typeDefinitions[typeName][key] = 'any[]';
      }
    } else {
      typeDefinitions[typeName][key] = type;
    }
  }

  return typeDefinitions;
};
const sendStructure = async () => {
  try {
    const rawData = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(rawData);

    const typeDefinitions = getStructure(data);

    let result = '';
    for (const [typeName, fields] of Object.entries(typeDefinitions)) {
      result += `interface ${typeName} {`;
      for (const [field, type] of Object.entries(fields)) {
        result += `  ${field}: ${type};`;
      }
      result += '}';
    }

    return result;
  } catch (error) {
    console.error(`Error reading or processing data: ${error}`);
  }
};
const loadData=async()=>{
	try{
		const rawData = await fs.readFile(dataFilePath);
    return JSON.parse(rawData);
	}
	catch(error){
		console.error('Error loading data:', error);
    return null;

	}
}
const saveData = async (data, filePath = dataFilePath) => {
  try {
    const jsonData = JSON.stringify(data, null, 2); 
    await fs.writeFile(filePath, jsonData, 'utf8');
    console.log(`Data successfully saved to ${filePath}`);
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
  }
};
const uniteData = (transports, routes) => {
	const unitedData = {};

  routes.forEach(route => {
    const transportId = route.transport_id;
    if (!unitedData[transportId]) {
      unitedData[transportId] = {
        transport: transports.find(transport => transport.id === transportId),
        routes: []
      };
    }
    unitedData[transportId].routes.push(route);
  });

  return unitedData;
};
const preprocess_data=(data)=>{
	  const weatherConditions = { 'Snow': 3, 'Rain': 1, 'Clear': 0, 'Fog': 2 };
    const trafficConditions = { 'High': 2, 'Light': 0, 'Medium': 1 };

    const features = [];
    const labels = [];

    data.routes.forEach(route => {
        const transport = data.transports.find(t => t.id === route.transport_id);

        if (transport) {
            const feature = [
                route.passenger_count,
                route.route_distance,
                weatherConditions[route.weather_condition] ?? 0,
                trafficConditions[route.traffic_condition] ?? 0,

            ];

            features.push(feature);
            labels.push(route.fare_amount);
        }
    });

    return { features, labels };
}
const create_neural_model=async(modelType,features)=>{
  const model = tf.sequential();
  if (modelType === 'MLP') {
    model.add(tf.layers.dense({ units: 10, inputShape: [features[0].length], activation: 'relu' }));
    model.add(tf.layers.dense({ units: 10, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));
  }
  else if(modelType === 'CNN'){
    model.add(tf.layers.conv2d({ inputShape: [28, 28, 1], kernelSize: 3, filters: 16, activation: 'relu' }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 10, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));
  }
  else if(modelType === 'RNN'){
    model.add(tf.layers.simpleRNN({ units: 10, inputShape: [features[0].length], activation: 'relu' }));
    model.add(tf.layers.dense({ units: 5, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));
  }
  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
  return model;
}
const determine_best_model = async (data, modelTypes) => {
  let bestModel = null;
    let bestModelType = null;
    let bestModelAccuracy = 0;

    const { features, labels } = preprocess_data(data);

    const splitIndex = Math.floor(features.length * 0.8);
    const xTrain = features.slice(0, splitIndex);
    const yTrain = labels.slice(0, splitIndex);
    const xVal = features.slice(splitIndex);
    const yVal = labels.slice(splitIndex);

    for (const modelType of modelTypes) {
        const model = await create_neural_model(modelType, xTrain);
        const accuracy = await trainModel(model, xTrain, yTrain, xVal, yVal);
        if (accuracy > bestModelAccuracy) {
            bestModel = model;
            bestModelType = modelType;
            bestModelAccuracy = accuracy;
        }
    }
    return { bestModel, bestModelType, bestModelAccuracy };
}
const trainModel=async()=>{
  try{
    const data = await loadData();
    if (!data) {
      console.error('Failed to load data');
      return;
    }
    const modelTypes = ['MLP', 'CNN', 'RNN'];
    const { bestModel, bestModelType, bestModelAccuracy  } = await determine_best_model(data, modelTypes);

    console.log(`Best model type: ${bestModelType} with MSE: ${bestModelAccuracy}`);
    const modelSavePath = `${modelsPath}/${bestModelType}_model`;
    await bestModel.save(modelSavePath);
    console.log(`Model saved to ${modelSavePath}`);
}
catch(error){
  console.error('Error making train:', error);
    return null;
}
}

const predict=async(data)=>{
	try {
    const model = await tf.loadLayersModel('path_to_your_model');
    const { features } = preprocess_data(data);
    const xPredict = tf.tensor2d(features);
    const predictions = model.predict(xPredict).dataSync();
    return predictions;
  } catch (error) {
    console.error('Error making predictions:', error);
    return null;
  }
}
const validateDataStructure = (data, expectedStructure) => {
  const validateObject = (obj, structure) => {
    for (const key in structure) {
      if (!(key in obj)) {
        return false;
      }
      const type = getType(obj[key]);
      if (type === 'object' && structure[key] === 'object') {
        if (!validateObject(obj[key], structure[key])) {
          return false;
        }
      } else if (type !== structure[key]) {
        return false;
      }
    }
    return true;
  };
  return validateObject(data, expectedStructure);
};
const processCsvData = async (csvData) => {
  const jsonData = await csv().fromString(csvData);
  return jsonData;
};
module.exports={
	sendStructure,trainModel,predict,saveData,validateDataStructure,processCsvData
}

