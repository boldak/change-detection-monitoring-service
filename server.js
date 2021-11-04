const bodyParser = require('body-parser')
const express = require('express')
const CORS = require("cors")

const config  = require('./config')

let logger = require("./src/javascript/logger")

const app = express();
app.use(CORS())

// app.all("/*",  (req, res, next) => {  
//     req.fullUrl = req.protocol + '://' + req.hostname + ":"+ config.service.port+req.originalUrl
//     res.header('Access-Control-Allow-Origin', '*');
//     next()
// })

app.use(express.static(config.service.public));



app.use(bodyParser.json({
	limit: '50mb'
}));


// app.use(express.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require("./src/javascript/routes").forEach( route => {
	app[route.method](route.path, route.handler)
})

app.listen(config.service.port, () => {
  logger.print(`!!! Changes Detection Monitoring Service starts on port ${config.service.port} in ${config.service.mode} mode.`)	
  console.log(`!!! Changes Detection Monitoring Service starts on port ${config.service.port} in ${config.service.mode} mode.`);
});
