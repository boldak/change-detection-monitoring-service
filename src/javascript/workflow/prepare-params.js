const _ = require('lodash')
const moment = require("moment")

const config  = require('../../../config')
const mongo = require('mongodb').MongoClient

let logger = require("../logger")

const START_DATE = config.task[config.DEFAULT_TASK].data.startsAt

let client

module.exports =  taskList  => new Promise( (resolve, reject) => {
	mongo.connect(config.storage.url, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
    })
    	.then( c => {
	    	client = c
	    	let db = client.db(config.storage.database)
	        let collection = db.collection(config.storage.collection)
	        Promise.all(
    	        taskList.map( task => collection.aggregate([
                                {
                                    '$match': {
                                      'properties.Id': task.properties.Id, 
                                      'properties.measurement_type': config.task[config.DEFAULT_TASK].data.measurement_type
                                    }
                                  }, {
                                    $sort:{
                                     'properties.measurement_date': -1  
                                    }
                                  }
                                ]).toArray()
                                    .then( res => {
                                        // logger.print(JSON.stringify(res[0]))
                                        let maxDate = moment(new Date())
                                        let minDate = ( res[0] ) 
                                                        ? moment(res[0].properties.measurement_date,"YYYY.MM.DD") || moment(new Date(START_DATE)) 
                                                        : moment(new Date(START_DATE)) 

                                        // logger.print(minDate)       

                                        minDate = (moment(new Date()).subtract(1, 'months').isSameOrAfter(minDate)) 
                                                        ? minDate 
                                                        : moment(new Date()).subtract(1, 'months') 
                                        
                                        let dateRange = [
                                            minDate.format("YYYY.MM.DD"),
                                            maxDate.format("YYYY.MM.DD")
                                        ]
                                        logger.print(`Task "${config.DEFAULT_TASK} for ${task.properties.Name}" time range [${moment(minDate,"YYYY.MM.DD").format("MM/DD/YYYY")}, ${moment(maxDate,"YYYY.MM.DD").format("MM/DD/YYYY")}]`)
                                        return _.extend( task, {
                                            params: {
                                                Id:task.properties.Id,
                                                access_settings: config.task[task.properties.task].access,
                                                properties: task.properties,
                                                geometry: task.geometry,
                                                dateRange,
                                                startDate: moment(minDate,"YYYY.MM.DD").format("MM/DD/YYYY"),
                                                endDate: moment(maxDate,"YYYY.MM.DD").format("MM/DD/YYYY"),
                                            }
                                        })
                                    })    
                            
            ))
            .then(taskListWithParams => {
                resolve(taskListWithParams)
                client.close()
            })
        })    
		.catch( e => {
			if(client) client.close()
    		reject(e)	
		})
})
