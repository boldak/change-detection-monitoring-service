const _ = require('lodash')
const moment = require("moment")

const config  = require('../../../config')
const mongo = require('mongodb').MongoClient

let logger = require("../logger")

const START_DATE = "2021.01.01"

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
                                      'properties.measurement_type': 'observed'
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
                                                        ? res[0].properties.measurement_date || moment(new Date(START_DATE)) 
                                                        : moment(new Date(START_DATE)) 

                                        // logger.print(minDate)       

                                        minDate = (moment(new Date()).subtract(1, 'months').isSameOrAfter(minDate)) 
                                                        ? minDate 
                                                        : moment(new Date()).subtract(1, 'months') 
                                        
                                        dateRange = [
                                            minDate.format("YYYY.MM.DD"),
                                            maxDate.format("YYYY.MM.DD")
                                        ]
                                        logger.print(`Time range is ${JSON.stringify(dateRange)}`)
                                        return _.extend( task, {
                                            params: {
                                                Id:task.properties.Id,
                                                geometry: task.geometry,
                                                dateRange,
                                                startDate: moment(minDate,"YYYY.MM.DD").format("DD/MM/YYYY"),
                                                endDate: moment(maxDate,"YYYY.MM.DD").format("DD/MM/YYYY"),
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
