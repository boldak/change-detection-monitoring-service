

let workflow = require("./workflow")
let logger = require("./logger")

module.exports = {
	run: () => {
		logger.print("Starts update process")
		workflow.fetchTaskList()
		.then( res => {
			logger.print(`Detected: ${res.length} tasks`)
			return workflow.prepareParams(res)
		})
		.then( res => {
			logger.print("Task params is prepared")
			return workflow.resolveTaskList(res)
		})
		.then( res => {
			logger.print("Update process is completed")
				
			// console.log(JSON.stringify(res, null, " "))
		})


		.catch( e => {
			logger.print(`Update process is interrupted: ${e.toString()}`)
			console.log(e.toString())
		})
	} 
}
