
let data = require("./reservoir_att_NEW.json").features

let _ = require("lodash")

data = data.map( item => {
	// console.log(_.keys(item.properties))
	
	item.properties = 
	_.extend({}, item.properties, {
		measurement_type: "nominal",
		script: "water_detection.py",
		task: "Water Level Monitoring"
	})

	return item

}) 


console.log(JSON.stringify(data,null," "))