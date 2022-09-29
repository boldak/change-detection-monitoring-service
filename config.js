const path = require("path")

module.exports = {

	service:{
		mode: process.env.NODE_ENV || "development",
		port: process.env.PORT || 3001,  //TODO
		host: process.env.HOST || "localhost", //TODO
		public:"./.public"
	},

	storage:{
		"provider": process.env.STORAGE_PROVIDER || "mongodb",
		"url": process.env.STORAGE_URL || "mongodb+srv://jace:jace@cluster0.lswzn.mongodb.net/cdms?retryWrites=true&w=majority", //TODO
		"database": process.env.STORAGE_DATABASE || "cdms",
		"collection": process.env.STORAGE_COLLECTION || "data"
	},


	task: {
		"Water Level Monitoring": {
			data:{
				startsAt:"2020.05.01",
				measurement_type:"experimental",
				exclude_properties:["OBJECTID","Id","ObjectId"],
				object_identity:"Name",
				actuality_options:{
					group:"Name",
					date:"measurement_date",
					field:"Actual"
				}	
			},


// OAuth clients mapw ID: 8f1f3407-ab2a-4a08-8130-aba44fce3a76 
// CLIENT_SECRET: O#^tqTpnzPBf~8BA]t1JoJb_7*/h<[p3*CZrZ1@: 
// User ID: 57a81c98-a767-4aa0-9080-05b468b78a94 
// Account ID: 07164548-e835-4192-b48c-d6ca598f25a0
// Instance_id: 1187721c-e72d-4f13-a93f-383f63a291e4 


			access:{
				CLIENT_ID: process.env.SENTINELHUB_CLIENT_ID || "8f1f3407-ab2a-4a08-8130-aba44fce3a76", 
				CLIENT_SECRET: process.env.SENTINELHUB_CLIENT_SECRET || "O#^tqTpnzPBf~8BA]t1JoJb_7*/h<[p3*CZrZ1@:",
				instance_id: process.env.SENTINELHUB_INSTANCE_ID || "1187721c-e72d-4f13-a93f-383f63a291e4"
			},



			script:{
				path: "./src/python/",
				file: "water_detection.py"
			}

		}	
	},

	DEFAULT_TASK: "Water Level Monitoring", 	


	python: {
		mode: 'text',
		encoding: 'utf8',
		pythonOptions: ['-u'],
		scriptPath: './src/python/',
		pythonPath: (process.env.NODE_ENV && process.env.NODE_ENV == "production") ? 'python' : 'python.exe'
	}
}
