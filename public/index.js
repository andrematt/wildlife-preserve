/*
a) buttare tutto dentro map, compresa la parte di ottenere i dati dal server
b) fare diversi component (ma come li faccio comunicare? alla onclick in map deve succedere qualcosa in stat)
c) faccio un unico component, ma prendo i dati da index.js e li passo insieme (come?)
*/

function app(){

	let svg;
	let mappedData=[];
	let map=mapApp();
	let charts=chartsApp();
	
	function me(selection){

		console.log('selction',selection.node());

		// Loading local and remote data
		//
		let points=[];
		let pointNames=[];
		let sensors;	
		const urlPoints="data/points.csv"
		const urlSensor = 'http://localhost:3000/sensors/';
		let pointData=fetch(urlPoints).then((resp) => resp.json());
		let sensorData=fetch(urlSensor).then((resp) => resp.json());
		Promise.all([sensorData,pointData]).then(function(values){
		if (values[0]&&values[1]) {
			sensors=values[0]; 
			// Prepare data fetched from local
			values[1].forEach(function(val){
				points.push(val);
			});

			/*
			let firstComponent = svg.append("g")
				.attr("class","reports")
				.datum(points)
				.call(map);
			*/

			
			let staticViz = selection
				.datum(points)
				.call(map);
			
			let dinamicGraphs = selection //come passo la possibilità di cambiare?
				.datum(sensors)
				.call(charts);

			//dopo puoi rifare selectAll etc..

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


