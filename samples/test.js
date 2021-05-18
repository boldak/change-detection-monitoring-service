
const jsoncsv = require('json-csv')
const data = require("./object.json")

const options = {
  //field definitions for CSV export
  fields :
  [
    {
      //required: field name for source value
      name : 'properties.id',

      //required: column label for CSV header
      label : 'id',

      //optional: filter to transform value before exporting
      filter : value => value
     },
     {
     	name : 'geometry',

      //required: column label for CSV header
      label : 'geometry',

      //optional: filter to transform value before exporting
      filter : value => JSON.stringify(value).toString()
     }

  ],

  // Other default options:
  fieldSeparator: ","
  ,ignoreHeader: false
  ,buffered: true
  ,encoding: "utf8"
}

jsoncsv.buffered(data, options)
	.then(csv => {
		console.log(csv)
	})


