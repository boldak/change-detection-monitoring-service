// const {PythonShell} = require('python-shell')
const _ = require('lodash')
const moment = require("moment")

const config  = require('../../config')
const v4 = require("uuid").v4

const mongo = require('mongodb').MongoClient

const jsoncsv = require('json-csv')

const logger = require("./logger")

let parseQuery = query => {
	let res = _.extend({}, query)
	_.keys(res).forEach( key => {
		try {
			res[key] = JSON.parse(res[key])
		} catch (e) {
			delete res[key]
		}
		
	})
	return res
}
	
const excludeFromQuery = ["properties", "excludeGeometry", "download"]

let prepareDbRequest = query => {
	let res =[]
	
	query = parseQuery(query)
	let properties = query.properties
	let excludeGeometry = query.excludeGeometry

	excludeFromQuery.forEach(key => {
		delete query[key]
	})

	_.keys(query).forEach(key => {
		if(_.isArray(query[key])) {
			let min = {}
			min[`properties.${key}`] = {$gte:query[key][0]}
			let max = {}
			max[`properties.${key}`] = {$lte:query[key][1]}
			 
			res.push(
				{ 	$match: {
						$and:[min,max]
					}
				}	
			)
		} else {
			let match = {}
			match[`properties.${key}`] = query[key]
			
			res.push(
				{ 	$match: match}
			)
		}
	})

	let projector = {
		_id:0,
		type:1
	}

	if (!excludeGeometry) projector.geometry = 1


	if(!properties || (_.isArray(properties) && properties.length == 0)){
		projector.properties = 1
	} else {
		properties = (_.isArray(properties)) ? properties : [properties]
		properties.forEach( prop => {
			projector[`properties.${prop}`] = 1
		})
	}

	if(!projector.properties){
		projector["properties.task"] = projector["properties.task"] || 1
	}

	res.push({
		$project: projector
	})

	// console.log(JSON.stringify(res))
	return res
}


let processActualRecords = data => {

	if( !_.head(data)) return data

	let options = config.task[_.head(data).properties.task].data.actuality_options	
	
	let lastDate = _.groupBy(data, d => d.properties[options.group])
	_.keys(lastDate).forEach( key => {
		lastDate[key] = _.orderBy(lastDate[key].map( d => d.properties[options.date]), d => d ,"desc").filter( d => d)[0]
	})

	data.forEach( row => {
		if(row.properties[options.date] && lastDate[row.properties[options.group]] && row.properties[options.date] == lastDate[row.properties[options.group]]){
			row.properties[options.field] = 1
		}
	})

	return data
}


let executeRequest = query => new Promise ( (resolve, reject) => {
	let client
	// console.log("process ", config.storage.url)
	mongo.connect(config.storage.url, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
    })
    	.then( c => {
	    	client = c
	    	let db = client.db(config.storage.database)
	        let collection = db.collection(config.storage.collection)
	        
	        // console.log(query, parseQuery(query), prepareDbRequest(query))

	        collection.aggregate(prepareDbRequest(query)).toArray()
                        .then(res => {
                        	res = processActualRecords(res)
                        	
                        	// console.log(res)
                        	
                        	res.forEach( row => {
                        		config.task[row.properties.task].data.exclude_properties.forEach(p => {
                        			delete row.properties[p]
                        		})
                        	})

                            resolve({
                            	// "query":parseQuery(query),
                            	// "request":prepareDbRequest(query),	
							  "type": "FeatureCollection",
							  "name": "reservoir_att",
							  "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },

							  "features": res
                            })
                            client.close()
                        })    
                        .catch( e => {
                            reject(e.toString())    
                        })
        })
		.catch( e => {
			if(client) client.close()
    		reject(e.toString())	
		})
})



let convertToCsv = json => {
	let data = json.features

	let filter = value => (_.isArray(value) || _.isObject(value)) ? JSON.stringify(value) : value

	let mapper = []

	mapper.push({
      name : 'type',
      label : 'type',
      filter
	})

	let props = []
	data.forEach( d => {
		props = _.union(props,_.keys(d.properties))
	})

	mapper = mapper.concat(props.map(p => ({
		name: `properties.${p}`,
		label: p,
		filter
	})))

	if(data[0].geometry) mapper.push({
		  name : 'geometry',
	      label : 'geometry',
	      filter
	})

	
	return jsoncsv.buffered(data,{
		fields : mapper,
		fieldSeparator: ",",
		ignoreHeader: false,
		buffered: true,
		encoding: "utf8"
	}) 	
}



module.exports = [
	{
		method: "get",
		path: "/api/json",
		handler: (req, res, next) => {
			next()
		}	
	},
	
	{
		method: "get",
		path: "/api/json",
		handler: (req, res) => {
			// let download = req.query.download
			executeRequest(req.query)
				.then( result => {
					// if(download) {
					// 	res.attachment('cdms-data.json').send(result)
					// } else {
						// res.set("apppication/json")
						res.send(result)	
					// }
					
				})
				.catch( e => res.send(e.toString()))
		}
	},

	{
		method: "get",
		path: "/api/update",
		handler: (req, res) => {
			require("./resolver").run()
			res.redirect("/log-listener.html")
			// res.send(`Monitoring Data Update starts at ${moment(new Date()).format("YYYY.MM.DD hh:mm:ss")}`)
		}
	},

	{
		method: "get",
		path: "/api/csv",
		handler: (req, res) => {
			// let download = req.query.download
			executeRequest(req.query)
				.then( result => convertToCsv( result ))
				.then( result => {
					// if(download) {
						res.attachment('cdms-data.csv').send(result)
					// } else {
						// res.type("text/csv")
						// res.send(result)
					// }	
				})
				.catch( e => res.send(e.toString()))
		}
	},

	{
		method: "get",
		path: "/api/log",
		handler: (req, res) => {
			res.redirect("/log-listener.html")
		}
	},

	{
		method: "get",
		path: "/api/view-log",
		handler: (req, res) => {
			let sse = res.sse()
			logger.on( messages => {
				messages.forEach( m => {
					sse.send(m)
				})
			})
		}
	}

	
]

