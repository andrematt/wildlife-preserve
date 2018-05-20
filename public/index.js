/*
a) buttare tutto dentro map, compresa la parte di ottenere i dati dal server
b) fare diversi component (ma come li faccio comunicare? alla onclick in map deve succedere qualcosa in stat)
c) faccio un unico component, ma prendo i dati da index.js e li passo insieme (come?)
*/

function app(){

	let svg;
	let mappedData=[];
	let map=mapApp();

	function me(selection){

		console.log('selction',selection.node());

		/*
		// Creation of the containing SVG element for the map
		//
		svg = selection.append("svg")
			.attr('height',500)
			.attr('width',"100%");
		*/
		
		// Loading geographical data
		//
		let points=[];
		const urlPoints="data/points.csv"
		let pointData=fetch(urlPoints).then((resp) => resp.json());
		pointData.then(function(values){
		if (values) {
			values.forEach(function(val){
				points.push(val);
			});


			/*
			//Map coordinates to names
			//
			function getX(search){
				//console.log(points[0].coord[0]);
				let result;
				points.forEach(function(d){
					if (d.fullname==search){
						result=d.coord[0];
					}
				});
				return result;
			}

			function getY(search){
				//console.log(points[0].coord[0]);
				let result;
				points.forEach(function(d){
					if (d.fullname==search){
						result=d.coord[1];
					}
				});
				return result;
			}

			mappedData = sensors.map(function (data){
				//console.log(data);
				temp={};
				temp.type= data.type;
				temp.timestamp=data.timestamp;
				temp.id=data.id;
				temp.gate=data.gate;
				temp.x=getX(temp.gate);
				temp.y=getY(temp.gate);
				return temp;
			});			

			
			let dataArr=[];
			dataArr.push(points);
			let shifted=mappedData.shift();
			dataArr.push(mappedData);
			*/

			console.log(points);


			/*
			let gReports = svg.append("g")
				.attr("class","reports")
				.datum(points)
				.call(map);
			*/
			let gReports = selection
				.datum(points)
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


