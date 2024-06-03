const utilService =require('../services/util1Service')
const getDataStructure=async(req,res)=>{
  try{
    const dataStructure = await utilService.sendStructure();

    res.status(200).json(dataStructure);
  }catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
const postTrain = async (req, res) => {
	try {
		const data=await utilService.loadData()

		const { features, labels } = utilService.preprocessData(data);
		console.log('Work 1')
		const mlpModel = utilService.createMlpModel();
		const mlpModelTrained = await utilService.trainModel(mlpModel, features, labels);
		await utilService.saveModel(mlpModelTrained, 'mlp_model');
		console.log('Work 3')
		/*const rnnModel = utilService.createRnnModel();
		await utilService.trainModel(rnnModel, features, labels);
		await utilService.saveModel(rnnModel, 'rnn_model');
		console.log('Work 4')
		
		const cnnModel = utilService.createCnnModel();
		await utilService.trainModel(cnnModel, features, labels);
		await utilService.saveModel(cnnModel, 'cnn_model');*/
		console.log('Work 2')
		res.status(200).json({ message: 'Models trained and saved successfully' });
} catch (error) {
		res.status(500).json({ error: error.message });
}
};

const postPredict = async (req, res) => {
	try {
		const data = req.body;

		if(data!=null||data!=''){

		const {features} =utilService.preprocessData(data);
		const loadedMlpModel = await utilService.loadModel('mlp_model');
		/*const loadedCnnModel = await utilService.loadModel('cnn_model');
		const loadedRnnModel = await utilService.loadModel('rnn_model');*/
		const mlpPredictions = await utilService.predict(loadedMlpModel, features);
		/*const cnnPredictions = utilService.predict(loadedCnnModel, features);
		const rnnPredictions = utilService.predict(loadedRnnModel, features);

		const bestModel = utilService.determineBestModel(mlpPredictions, cnnPredictions, rnnPredictions, labels);*/
		res.status(200).json(mlpPredictions);
		}
		else{
			res.status(200).json({message:"The data do not match the sample"});
		}
		
} catch (error) {
		res.status(500).json({ error: error.message });
}
};

module.exports = { postTrain, postPredict ,getDataStructure};