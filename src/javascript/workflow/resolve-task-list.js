const {PythonShell} = require('python-shell')
const _ = require('lodash')
const config  = require('../../../config')
const v4 = require("uuid").v4

const saveResults = require("./save-results")
let logger = require("../logger")

let Queue = require("queue-promise")
const queue = new Queue({
  concurrent: 1,
  interval: 2
});
 
 

let createTask = task => () => new Promise((resolve,reject) => {
    
    task = _.extend( task, {_id:v4()} )
    logger.print(`Starts task for ${task.properties.Name}`)
    let pyproc = new PythonShell(task.properties.script, config.python);
    
    pyproc.once("message", message => {
        let data = JSON.parse(message)
        task.result = data
        pyproc.end(() => { pyproc.kill()})
    })

    pyproc.once("close", () => {
        logger.print(`${task.result.length} records saves`)
        saveResults(task).then( res => {
            logger.print(`Task for ${task.properties.Name} is completed`)
            // console.log(`Task for ${JSON.stringify(task.result)} is completed`)
            resolve(res)
        })
    })
    
    pyproc.send(JSON.stringify(task.params), { mode: 'json' });

})


module.exports = taskList => new Promise( ( resolve, reject ) => {
    let res = []
    
    queue.on("start", () => {
        // console.log(`Queue started at ${new Date()}`)
    });
    
    queue.on("stop", () => {
        resolve(_.flatten(res))
    });
     
    queue.on("resolve", data => {
        res.push(data)
    });
    
    queue.on("reject", error => console.error(error));

    taskList.forEach( task => {
        queue.enqueue(createTask(task))
    })
})