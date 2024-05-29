const { trainModel, sendStructure,processCsvData,validateDataStructure,predict } = require("../services/utilService");

const getStandartUtil=async(req,res)=>{
  try {
    res.send('<h1>Utils Work</h1>')
    res.status(200);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
const getDataStructure=async(req,res)=>{
  try{
    const dataStructure = await sendStructure();
    res.status(200).json(dataStructure);
  }catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

const postSetAndTrainData = async (req, res) => {
  try {
    const { type } = req.query;
    const data = req.body;

    if (!data || !type) {
      return res.status(400).json({ message: 'No data or type provided' });
    }

    let parsedData;

    if (type === 'json') {
      const expectedStructure = await sendStructure();
      const isValid = validateDataStructure(data, expectedStructure);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid data structure' });
      }
      parsedData = data;
    } else if (type === 'csv') {
      parsedData = await  processCsvData(data);
    } else {
      return res.status(400).json({ message: 'Unsupported data type' });
    }

    await saveData(parsedData, dataFilePath);
    const modelPath = await trainModel();
    res.status(200).json({ modelPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
const getTrainData=async(req,res)=>{
  try {
    const modelPath = await trainModel();
    res.status(200).json({ modelPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
const postPredictValues = async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ message: 'No data provided' });
    }

    const isValid = await validateDataStructure(data);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid data structure' });
    }

    const modelPath = `${modelsPath}/best_model`;
    const predictions = await predict(data, modelPath);
    res.status(200).json({ predictions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports={
	getStandartUtil,postSetAndTrainData,postPredictValues,getDataStructure,getTrainData
}