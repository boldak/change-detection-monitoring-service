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
		"url": process.env.STORAGE_URL ||  "mongodb+srv://jace:jace@cdms.jm8vq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", //"mongodb+srv://jace:jace@cluster0.lswzn.mongodb.net/cdms?retryWrites=true&w=majority",
		"database": process.env.STORAGE_DATABASE || "cdms",
		"collection": process.env.STORAGE_COLLECTION || "data"
	},


	task: {
		"Water Level Monitoring": {
			data:{
				startsAt:"2020.01.01",
				measurement_type:"experimental",
				exclude_properties:["OBJECTID","Id","ObjectId"],
				object_identity:"Name",
				actuality_options:{
					group:"Name",
					date:"measurement_date",
					field:"Actual"
				}	
			},

			// access:{
			// 	CLIENT_ID: process.env.SENTINELHUB_CLIENT_ID || "a44f965e-9afd-4ff8-b6b2-32536c40dcfb", 
			// 	CLIENT_SECRET: process.env.SENTINELHUB_CLIENT_SECRET || "yh.d1_P@.)a|[@@|JWAx>kN~GX#SN5GgO^<E|)MH", 
			// 	instance_id: process.env.SENTINELHUB_INSTANCE_ID || "8dcd8d01-01fb-419a-adbe-cd7b1b838b68"
			// },

			access:{
				CLIENT_ID: process.env.SENTINELHUB_CLIENT_ID || "cfdffbe9-c2e0-4191-a91e-2db4d7722ed8", 
				CLIENT_SECRET: process.env.SENTINELHUB_CLIENT_SECRET || "(S>FC9]k{yp53W@!zo]KX@3vRx&IR,[KEO-~^zd:", 
				instance_id: process.env.SENTINELHUB_INSTANCE_ID || "f7f5b0a8-07c5-46be-a6e8-1a44cc1bb22a"
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
