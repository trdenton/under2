const { Client } = require('pg')
var express = require('express');
var path = require('path')
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

connstr='postgres://odw2017:odw2017@10.194.0.13:5432/tax_map'
const client = new Client(connstr)
client.connect()



app.use(express.static(path.resolve(__dirname, 'www')));
app.post('/geojson',function(req,res){

	var latitude = req.body.latitude;
	var longitude = req.body.longitude;
	var radius = req.body.radius;
	console.log(latitude);
	console.log(longitude);
	console.log(radius);

	const text = "SELECT ST_AsText(wkb_geometry) as polygon, total_assessed_value, ST_AsText(geom) as location from taxes_map where ST_Distance_Sphere(geom, ST_MakePoint($1,$2)) <= $3;"
	var values = [longitude,latitude,radius]

	client.query(text,values, (err, dat)=>
	{
		console.log(dat);
		if (err)
		{
			res.send("ERROR " + err)
		}
		else
		{
			res.send(dat);
		}
	})

})
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
 console.log('listening to Port', app.get('port'));
});
