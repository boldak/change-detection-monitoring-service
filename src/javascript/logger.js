
const moment = require("moment")
const { isFunction } = require('lodash')

let messages = []

let logger = {
	
	listeners:[],

	on: listener => {
		logger.listeners.push({
			callback: listener,
			index: 0
		})
	},

	print: message => {
		message = message || ""
		console.log(`[ ${moment(new Date()).format("YYYY.MM.DD HH:mm:ss")} ]: ${message}`)
		// console.log("PRINT", message.split("\n").length)
		message.split("\n").forEach( (m, index) => {
			messages.push((index == 0) ? `[ ${moment(new Date()).format("YYYY.MM.DD HH:mm:ss")} ]: ${m}` : `\t${m}`)
		})
		
		logger.listeners.forEach( listener => {
			if( isFunction(listener.callback)) listener.callback(messages.slice(listener.index))
			listener.index = messages.length
		})
	
	},

	clear: () => {
		messages = []
	},

	get: () => `<pre> ${messages.join("<br/>")} </pre>`,

	last: () => messages[messages.length-1]

}

module.exports = logger