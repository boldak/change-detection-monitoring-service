
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

		console.log(`[ ${moment(new Date()).format("YYYY.MM.DD HH:mm:ss")} ]: ${message}`)
		messages.push(`[ ${moment(new Date()).format("YYYY.MM.DD HH:mm:ss")} ]: ${message}`)
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