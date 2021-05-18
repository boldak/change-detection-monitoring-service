
const moment = require("moment")

let messages = []

module.exports = {
	
	print: message => {
		console.log(`[ ${moment(new Date()).format("YYYY.MM.DD HH:mm:ss")} ]: ${message}`)
		messages.push(`[ ${moment(new Date()).format("YYYY.MM.DD HH:mm:ss")} ]: ${message}`)
	},

	clear: () => {
		messages = []
	},

	get: () => `<pre> ${messages.join("<br/>")} </pre>`,

	last: () => messages[messages.length-1]

}