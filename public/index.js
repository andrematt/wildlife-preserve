/**
 * This module manage the loading of data from database and loads the map app
 *  
 */

function app(){

	let svg;
	let mappedData=[];
	let map=mapApp();


    // Dom manipulation functions
	//
	function me(selection){

		// Fetch data
		//
		let points=[];
		let pointNames=[];
		let sensors;	
		const urlPoints="data/points.csv"
		const urlSensor = 'http://localhost:3000/sensors/';
		let sensorData=fetch(urlSensor).then((resp) => resp.json());
		sensorData.then(function(values){
		if (values){	
			let mapViz = selection
				.datum(values)
				.call(map);

		}
		else {
			throw new Error("error fetching data!");
		}
		});
			
	}
	
	
	return me;

}



var myApp = app();
d3.select("#viz")
.call(myApp);

