const _ = require('lodash')
const moment = require("moment")

const config  = require('../../../config')
const mongo = require('mongodb').MongoClient
let logger = require("../logger")

const Promise = require("bluebird")


let prepare = (data, task) => {
    let savedObject = {
        type:"Feature",
        properties: _.extend({}, task.properties, data.properties),
        geometry: data.geometry,
        createdAt: moment(new Date()).format("YYYY.MM.DD")
    }

    savedObject.properties.measurement_date = moment(savedObject.properties.measurement_date,"DD/MM/YYYY").format("YYYY.MM.DD")
    savedObject.properties.measurement_type = config.task[config.DEFAULT_TASK].data.measurement_type

    return savedObject
}

module.exports = task => new Promise( ( resolve, reject ) => {
    
    let client
    let dataArray = task.result

    mongo.connect(config.storage.url, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
    })
        .then( c => {
            client = c
            let db = client.db(config.storage.database)
            let collection = db.collection(config.storage.collection)

            Promise.reduce(
                dataArray,
                (result, data) => {
                    let savedObject = prepare(data, task)
                    return collection.replaceOne(
                        {
                            "properties.measurement_date": savedObject.properties.measurement_date,
                            "properties.Id": savedObject.properties.Id,
                        }, 
                        savedObject, 
                        {upsert: true}
                    )
                    .then( r => {
                        result.push(r.result.nModified)
                        return result
                    })
                    .catch( e => {
                        client.close()
                    })
                },
                []
            )
            .then( res => {
                let temp = _.flattenDeep(res)
                let updated = temp.reduce((s,d) => s+d, 0)
                let created = temp.length - updated
                logger.print(`${updated} records updated, ${created} records created`)
                 
                if(client) client.close()
                resolve(temp)
            })
            .catch( e => {
                if(client) client.close()
                reject(e)
            })



                    
        })    
})

