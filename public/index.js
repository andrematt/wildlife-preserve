/*

REFACTORING
parte 1
che cosa:
overview generale con mappa, paths e tabella riassuntiva (es avg e max path lenghth + id e data inizio e fine, tutti i diversi veicoli...)

parte 2
chi, dove, quando



slide eventi: eventi generati dal dom (es onclick..), per far reagire la pagina servono dei listener: es .text(function(d))... d = data embedded in button*
a) buttare tutto dentro map, compresa la parte di ottenere i dati dal server
b) fare diversi component (ma come li faccio comunicare? alla onclick in map deve succedere qualcosa in stat)
c) faccio un unico component, ma prendo i dati da index.js e li passo insieme (come?)
d3 dispach: compoennt non visibile, specie di broadcaster per events (ma non hanno data). registri un nuovo evento con nome, funzione eseguita. Il bottone è attivo se la stringa mandata da function è uguale a .classed...d=""
server per attaccare più function(d).. ad un singolo event(changerecordType). Aggiungi un namespace (.map .chart) per specificare subfamily di eventi
 

stateful descriptor: state, es year e recordtype selezionati. Nella nostra app lo state è tenuto da crossfilter.
 
pan e zoom: si fanno muovendo l'elemento g che racchiude gli elementi con traslate

brush: clicca e trascina per fare selection

 */


function app(){

	let svg;
	let mappedData=[];
	let map=mapApp();
	let charts=chartsApp();

    // Dom manipulation functions
	//
	
	
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
			
			//mettere switch per far vedere components singoli sensor o path!
			let dinamicGraphs = selection //come passo la possibilità di cambiare?
				.datum(sensors)
				.call(charts);

	

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


