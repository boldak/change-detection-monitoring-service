const path = require("path")

module.exports = {

	service:{
		lang: process.env.NER_LANG || "en",
		mode: process.env.NODE_ENV || "development",
		port: process.env.PORT || 3001,
		host: process.env.HOST || "localhost",
		public:"./.public"
	},

	storage:{
		"provider": process.env.STORAGE_PROVIDER || "mongodb",
		"url": process.env.STORAGE_URL || "mongodb+srv://jace:jace@cluster0.lswzn.mongodb.net/test",
		"database": process.env.STORAGE_DATABASE || "cdms",
		"collection": process.env.STORAGE_COLLECTION || "data"
	},


	task: {
		"Water Level Monitoring": {
			data:{
				startsAt:"2021.01.01",
				measurement_type:"experimental"
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
