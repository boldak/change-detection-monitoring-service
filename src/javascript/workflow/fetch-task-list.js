const _ = require('lodash')
const config  = require('../../../config')
const mongo = require('mongodb').MongoClient

let client

module.exports = () => new Promise((resolve, reject) => {
	mongo.connect(config.storage.url, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
    })
    	.then( c => {
	    	client = c
	    	let db = client.db(config.storage.database)
	        let collection = db.collection(config.storage.collection)
	        
	        collection.find({"properties.measurement_type":"nominal"}).toArray()
                        .then(res => {
                            resolve(res)
                            client.close()
                        })    
                        .catch( e => {
                            reject(e)    
                        })
        })
		.catch( e => {
			if(client) client.close()
    		reject(e)	
		})
})
