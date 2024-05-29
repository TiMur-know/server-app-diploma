const fs=require('fs').promises
const path =require('path')

const dataFilePath = path.join(__dirname, '../data/data.json');
const modelsPath = path.join(__dirname, '../models');
const tf =require('@tensorflow/tfjs')

const preprocessData = (data) => {
	const weatherConditions = { 'Snowy': 3, 'Rain': 1, 'Clear': 0, 'Fog': 2 };
	const trafficConditions = { 'High': 2, 'Light': 0, 'Medium': 1 };

	const features = [];
	const labels = [];

	data.routes.forEach(route => {
			const featureVector = [
					weatherConditions[route.weather_condition],
					trafficConditions[route.traffic_condition],
					route.passenger_count,
					route.route_distance
			];
			const label = route.fare_amount;
			features.push(featureVector);
			labels.push(label);
	});

	return { features, labels };
};
const createMlpModel = () => {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [4] }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
    return model;
};

const createCnnModel = () => {
    const model = tf.sequential();
    model.add(tf.layers.reshape({ targetShape: [2, 2, 1], inputShape: [4] }));
    model.add(tf.layers.conv2d({ filters: 32, kernelSize: 3, activation: 'relu' }));
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
    return model;
};

const createRnnModel = () => {
    const model = tf.sequential();
    model.add(tf.layers.reshape({ targetShape: [1, 4], inputShape: [4] }));
    model.add(tf.layers.lstm({ units: 64, returnSequences: true }));
    model.add(tf.layers.lstm({ units: 64 }));
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
    return model;
};
const meanSquaredError = (predictions, actuals) => {
	const errors = predictions.map((pred, index) => Math.pow(pred[0] - actuals[index], 2));
	return errors.reduce((a, b) => a + b, 0) / errors.length;
};

const determineBestModel = (mlpPredictions, cnnPredictions, rnnPredictions, y_test) => {
	const mlpMSE = meanSquaredError(mlpPredictions, y_test);
	const cnnMSE = meanSquaredError(cnnPredictions, y_test);
	const rnnMSE = meanSquaredError(rnnPredictions, y_test);

	console.log(`MLP Model MSE: ${mlpMSE}`);
	console.log(`CNN Model MSE: ${cnnMSE}`);
	console.log(`RNN Model MSE: ${rnnMSE}`);

	const bestModel = Math.min(mlpMSE, cnnMSE, rnnMSE);
	if (bestModel === mlpMSE) {
			return 'MLP';
	} else if (bestModel === cnnMSE) {
			return 'CNN';
	} else {
			return 'RNN';
	}
};
const trainModel = async (model, features, labels) => {
	const X = tf.tensor2d(features);
	const y = tf.tensor2d(labels, [labels.length, 1]);

	await model.fit(X, y, {
			epochs: 10,
			batchSize: 32,
			validationSplit: 0.2
	});

	return model;
};
const saveModel = async (model, modelName) => {
	const modelSavePath = `file://${path.resolve(modelsPath, modelName)}`;

  try {
    await model.save(modelSavePath);
    console.log(`Model ${modelName} saved successfully.`);
  } catch (error) {
    console.error(`Error saving model ${modelName}: ${error}`);
    throw error;
  }
};

const loadModel = async (modelName) => {
	const modelLoadPath = path.join(modelsPath, modelName, 'model.json');
	return await tf.loadLayersModel(`file://${modelLoadPath}`);
};

const predict = (model, features) => {
	const X_test = tf.tensor2d(features);
	return model.predict(X_test).arraySync();
};

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
module.exports={
	loadModel , predict, trainModel,saveModel,createMlpModel,createCnnModel,createRnnModel,determineBestModel,preprocessData,sendStructure,loadData
}