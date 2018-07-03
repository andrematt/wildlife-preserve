
/**
 * TODO: mappa e filtro per veicolo. Aggiungere stats: totale attraversamenti, totale paths, longest path
 *  This module will display a map with a symbol encoding for a set of geographical elements
 */

//.reverse!


function mapApp(){
	const padding=80;
	const leftMargin=50;
	//const sensorNames=["","camping0","camping1","camping2","camping3","camping4","camping5","camping6","camping7","camping8","entrance0","entrance1","entrance2","entrance3","entrance4","gate0" ,"gate1" ,"gate2", "gate3","gate4","gate5","gate6","gate7","gate8","general-gate0","general-gate1","general-gate2","general-gate3","general-gate4","general-gate5","general-gate6","general-gate7", "ranger-base","ranger-stop0","ranger-stop1","ranger-stop2","ranger-stop3","ranger-stop4","ranger-stop5","ranger-stop6","ranger-stop7"];
	const originalSize=982;
	const pointsData={'camping0':[259, 206],'camping1':[634,250], 'camping2':[219,318], 'camping3':[225,338], 'camping4':[240,440], 'camping5':[103,595], 'camping6':[735,868], 'camping7':[888,712], 'camping8':[898,240], 'entrance0':[309,69], 'entrance1':[89,331],'entrance2':[898,430], 'entrance3':[567,819], 'entrance4':[688,902], 'gate0':[312,166], 'gate1':[289,222], 'gate2':[123,269],'gate3':[731,298],'gate4':[806,561],'gate5':[645,717],'gate6':[572,741],'gate7':[479,786],'gate8':[678,887],'general-gate0':[543,50],'general-gate1':[318,128],'general-gate2':[512,162],'general-gate3':[912,273],'general-gate4':[342,482],'general-gate5':[610,546],'general-gate6':[668,673],'general-gate7':[322,707],'ranger-base':[629,857],'ranger-stop0':[440,85],'ranger-stop1':[99,122],'ranger-stop2':[396,176],'ranger-stop3':[726,225],'ranger-stop4':[95,470],'ranger-stop5':[740,582],'ranger-stop6':[605,721], 'ranger-stop7':[493,746]};
	const days = ["monday","thuesdays","wednesday","thursday","friday","saturnday","sunday"];
	console.log(pointsData.gate1);
	console.log("ARGHH");
	console.log(pointsData.camping0);
	// Utils functions
	//
	function toggleTotal(){
	$("#dc-timeline-chart-daily").attr("style", "display: none");
  	$("#dc-timeline-chart-full").attr("style", "display: block");
}

function toggleDaily(){
	$("#dc-timeline-chart-full").attr("style", "display: none");
	$("#dc-timeline-chart-daily").attr("style", "display: block");
}

function remove_empty_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return d.value != 0;
            });
        }
    };
}


	function checkNameStart(d){
		if(d.startsWith('ga')){
			return 'gate';
		}
		else if(d.startsWith('ge')){
			return 'general-gate';
		}
		else if(d.startsWith('ca')){
			return 'camping';
		}
		else if(d.startsWith('ent')){
			return 'entering';
		}
		else if(d.startsWith('ge')){
			return 'general-gate';
		}
		else if(d.startsWith('ranger-b')){
			return 'ranger-base';
		}
		else if(d.startsWith('ranger-s')){
			return 'ranger-stop';
		}
		else {
			return 'other';
		}
	}

	function resize(n, width){
		return n*(width-padding)/originalSize;
	}
	

	// minimap coords 
	//
	function xScalePoints(minX, maxX, w){ //restituisce una scala con rapporto tra il dominio (valori min e max) e range (larghezza dell'svg - il padding)
		let xScale = d3.scaleLinear()
		.domain([minX, maxX])
		.range([0+padding/2, w-padding/2]);
		return xScale;
	}
	
	function yScalePoints(minY, maxY, h){ //stesso ma per l'altezza
		let yScale = d3.scaleLinear()
		.domain([minY, maxY])
		.range([0+padding/2, h-padding/2]);
		return yScale;	
	}

	function xScaleMap(minX,maxX, w){
		let xScale = xScalePoints(minX,maxX, w);
		let xMap = function (d){return xScale(d.coord[0])};
		return xMap;
	}

	function yScaleMap(minY,maxY, h){
		let yScale = yScalePoints(minY,maxY, h);
		let yMap = function (d){return yScale(d.coord[1])};
		return yMap;
}

	function parse(data){
		let splitted=data.split(/,|\n|\r\n/); //divide a ogni "," o a nuova linea. Carriage return diverso per linux e windows
		let cloned=[];
		for (i = 0; i < splitted.length; i=i+4) { //ricostruisce la row originaria del csv
    		cloned.push(splitted.slice(i, i+4));
  		}
 		return(cloned);
	}

	function sort(data){
		let sortedVehicles=data.sort(function(a,b){ //ordina l'array in base all'id del veicolo
		if (a.id < b.id) {
    	return -1;
  	}
  	if (a.id > b.id) {
    	return 1;
  	}
  	return 0;
	});
		return sortedVehicles;
	}



	function makePath(sortedVehicles){
	let arrayPath=[];
	let singlePath=new Object();
	singlePath.vehicleId=sortedVehicles[0].id;
	singlePath.vehicleType=sortedVehicles[0].type;
	singlePath.path=[];
	let timeStamp=new Object();
	timeStamp.time=sortedVehicles[0].timestamp;
	timeStamp.gate=sortedVehicles[0].gate;
	singlePath.path.push(timeStamp);
	console.log(singlePath);
	for (var i=1; i<sortedVehicles.length;i++){
		if (sortedVehicles[i].id!==sortedVehicles[i-1].id || (singlePath.path.length>1&&((sortedVehicles[i].gate.startsWith('entrance')&&sortedVehicles[i-1].gate.startsWith('entrance'))))){ //ARGH :D condizioni di terminazione: il veicolo seguente ha targa diversa oppure c'è un path di lunghezza >1 con due ingressi consecutivi
			arrayPath.push(singlePath);
			singlePath=new Object();
			singlePath.path=[];
			singlePath.vehicleId=sortedVehicles[i].id;
			singlePath.vehicleType=sortedVehicles[i].type;
		}
		timeStamp=new Object();
		timeStamp.time=sortedVehicles[i].timestamp;
		timeStamp.gate=sortedVehicles[i].gate;
		singlePath.path.push(timeStamp);
		if (i===sortedVehicles.length-1){
			arrayPath.push(singlePath);
		}
	}
	return arrayPath;
}

//	From the array of gates and the object of vehicles paths, generates a matrix representing the traffic coming out from each node in form of {vehicleType, destinationNode} 
//
function createMatrixOld(points, pathData){
let resultMatrix=[];
points.forEach(function(d){ //iterates the 'original' array of 40 gates 
	//console.log("searching "+d)
	let singleResult=new Object();
	singleResult.name=d;
	singleResult.data=[];
	pathData.forEach(function(j){ //iterates the list of paths 
	//for(let i=0; i<5; i++){
	//let j=pathData[i];
	//console.log(j);
		j.path.forEach(function(z, index){ //iterate each single path
			//console.log(j.path.length);
			if(z.gate==d){ //if the gate in the path match the 'original' gate, take the following node and the vehicle type 
				if(index+1<j.path.length){
				//console.log("OK!");
				//console.log("searching "+d);
				//console.log(j);
				let gate = j.path[index+1].gate;
				let vehicleType = j.vehicleType; 
				singleResult.data.push({'vehicleType':vehicleType, 'gate':gate}); // push them in the 'data' array of the 'original' gate 
				}
				else { //se è l'ultimo elemento di un path, il successivo sarà una uscita dal parco
					let gate = "exit";
				let vehicleType = j.vehicleType; 
				singleResult.data.push({'vehicleType':vehicleType, 'gate':gate}); // push them in the 'data' array of the 'original' gate 
				}

			}
			
		});
	//}
	});
	resultMatrix.push(singleResult);
});

return resultMatrix;
}


//	From the array of gates and the object of vehicles paths, generates a matrix representing the traffic coming out from each node in form of {vehicleType, destinationNode} 
//
function createMatrix(pathData){ //flatten the array of paths
let resultMatrix=[];
	//console.log("searching "+d)

	pathData.forEach(function(d){ //iterates the list of paths 
	//for(let i=0; i<5; i++){
	//let j=pathData[i];
	//console.log(j);
		//d.path.forEach(function(z, index){ 
			//console.log(j.path.length);
				//console.log("OK!");
				//console.log("searching "+d);
				//console.log(j);
		let counter=0;
		for(i = 0; i<d.path.length-1; i++){
				counter=i;
				//let singleResult=new Object();
				let name = d.path[i].gate;
				let timeStamp = d.path[i].time;
				let linkTo = d.path[i+1].gate;
				let vehicleType = d.vehicleType;
				let vehicleId=d.vehicleId;
				let pathLength=d.path.length;
				let start=d.path[0].time;
				let end=d.path[d.path.length-1].time;

				resultMatrix.push({'name':name, 'id':vehicleId, 'start':start, 'end':end, 'pathLength':pathLength, 'timeStamp':timeStamp, 'linkTo':linkTo, 'vehicleType':vehicleType});
				//singleResult.data.push({name:name, 'linkTo':linkTo, 'vehicleType':vehicleType}); // push them in the 'data' array of the 'original' gate 
			
		}	

		resultMatrix.push({'name':d.path[counter+1].gate, 'id':d.vehicleId, 'start':d.path[0].time, 'end':d.path[d.path.length-1].time, 'pathLength':d.path.length, 'timeStamp':d.path[counter+1].time,  'linkTo':'other', 'vehicleType':d.vehicleType}); //if is the last element in the path array we don't know where it's destination
		//});
	//}
	});
	

return resultMatrix;
}

		
	function me(selection){


			// Data setup
			//
	
			let values=selection.datum();
    		values.shift(); // Just remove heading
    		let sorted=sort(values);
    		let pathData=makePath(sorted); //paths, useful for statistics
    		console.log(pathData);
    		let pointMatrix=createMatrix(pathData);
    		console.log(pointMatrix);
				
   			let gatesData = crossfilter(pointMatrix);
			let parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S"); //set dateTime format

		

			// Crossfilter dimentioning and grouping
			//		
 
				//gate dimention and group
      			let gateDimension = gatesData.dimension(function(d){ //links in uscita
   					 return d.name;
				});
				
				let gateGroup = gateDimension.group().reduceCount(function(d){ //qua
    				return d.name;
				});

				//gate dimention and group
      			let pathDimension = gatesData.dimension(function(d){ 
   					 
   					 return d.pathLength;
				});
				
				let pathGroup = pathDimension.group().reduceCount(function(d){ 
    				
    				return d.pathLength;
				
				});
				console.log(pathGroup.all());


								
				//linkTo dimention and group
      			let linkDimension = gatesData.dimension(function(d){
   					 return d.linkTo;
				});
				
				let linkGroup = linkDimension.group().reduceCount(function(d){ //qua
    				return d.linkTo;
				});
				let filtered_linkGroup = remove_empty_bins(linkGroup);

				//Vehicle type dimention and group
      			let vehicleDimension = gatesData.dimension(function(d){
   					 return d.vehicleType;
				});


				// week dimenstion and group
  				let volumeByWeek =  gatesData.dimension(function(d) {
    				return d3.timeWeek(parseDate(d.timeStamp));
  				});

  			// map/reduce to group sum
  			let volumeByWeekGroup = volumeByWeek.group()
    		.reduceCount(function(d) { return parseDate(d.timeStamp); });	

    		// Group data by week day
  			let volumeByDay =  gatesData.dimension(function(d) {
 				let parsedDate = d3.timeDay(parseDate(d.timeStamp));
    			return parsedDate.getDay();
  			});

  			// map/reduce to group sum (how much traffic on each mondays, thuesdays...)
  			let volumeByDayGroup = volumeByDay.group()
    		.reduceCount(function(d) { return (parseDate(d.timeStamp)); });
				
			

			// Graphs and containing html structure
			//
				let introDiv=selection.append("span")
				.attr("id","nodes-chart-info")
				.attr("class", "svg-container-large")
				.html("<h3>Introducing the dashboard</h3>  <p> This project is built for help Mitch Vogel to investigate the possibile causes of the decrease in the number of nesting pairs of the Rose-Crested Blue Pipit in the the Boonsong Lekagul Nature Preserve, throu the analisys of the park vehicle traffic recorded by sensors. </p><p>To get more information out of data, the single sensor informations are grouped in paths, basing on the ID of the vehicle and the enter and exit gate.</p> <p> You can explore the data yourself, or look in the 'results' section to get an idea about the strange patterns that emerged during the analysis. ");
   		
 
			// Container for svg map and bubble overlay
			//

				let nodesDiv=selection.append("span")
				.attr("id", "overlay")
				.attr("class", "svg-container-medium")
				.html("<h4>Lekagul Park Roadways </h4><p>The map represent the allowed routes throu the park, and the points of interest in which a sensor is present. Click on a point for the distribution of traffic outgoing from that point</p>");

				let containerWidth=nodesDiv.node().getBoundingClientRect().width; //takes the width of the responsive div
				console.log(containerWidth);
				nodesDiv.append("svg")
					.attr("width", containerWidth-padding)
					.attr("height", containerWidth-padding)
					.attr("id", "map")
					.append("defs")
					.append("pattern")
					.attr("id", "img1")
					.attr("patternUnits", "userSpaceOnUse")
					.attr("width", containerWidth-padding)
					.attr("height", containerWidth-padding)
					.append("image")
					.attr('href', "public/output.svg")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", containerWidth-padding)
					.attr("height", containerWidth-padding)
					.append('svg');

				 svg = d3.select("#map")
     			.append("rect")
     			.attr("width", '100%')
     			.attr("height", '100%')
    			 .attr("fill", "url(#img1)");



    		// DC graph: bubble overlay
    		//
   	let overlayChart=dc.bubbleOverlay('#overlay')
   			         .svg(d3.select("#overlay svg"));
       overlayChart.width(containerWidth-padding)
                .height(containerWidth-padding)
                .dimension(gateDimension)
                .group(gateGroup)
                .radiusValueAccessor(function(p) {
                    return 30;
                })
                .r(d3.scaleLinear().domain([0, 200000]))
                	.colors(d3.scaleOrdinal().domain(["ranger-stop","entrance", "general-gate","gate","camping","ranger-base","other"])
                                .range(["yellow","green","cyan","red","orange","purple","blue"]))
     				.colorAccessor(function(d){ 
     					
     				let name=checkNameStart(d.key);
     				return name;
     			})
                .point("camping0", resize(pointsData.camping0[0], containerWidth), resize(pointsData.camping0[1],containerWidth))
                .point("camping1", resize(pointsData.camping1[0], containerWidth), resize(pointsData.camping1[1],containerWidth))
                .point("camping2", resize(pointsData.camping2[0], containerWidth), resize(pointsData.camping2[1],containerWidth))
                .point("camping3", resize(pointsData.camping3[0], containerWidth), resize(pointsData.camping3[1],containerWidth))
                .point("camping4", resize(pointsData.camping4[0], containerWidth), resize(pointsData.camping4[1],containerWidth))
                .point("camping5", resize(pointsData.camping5[0], containerWidth), resize(pointsData.camping5[1],containerWidth))
                .point("camping6", resize(pointsData.camping6[0], containerWidth), resize(pointsData.camping6[1],containerWidth))
                .point("camping7", resize(pointsData.camping7[0], containerWidth), resize(pointsData.camping7[1],containerWidth))
                .point("camping8", resize(pointsData.camping8[0], containerWidth), resize(pointsData.camping8[1],containerWidth))
                .point("entrance0",resize(pointsData.entrance0[0], containerWidth), resize(pointsData.entrance0[1],containerWidth))
                .point("entrance1",resize(pointsData.entrance1[0], containerWidth), resize(pointsData.entrance1[1],containerWidth))
                .point("entrance2",resize(pointsData.entrance2[0], containerWidth), resize(pointsData.entrance2[1],containerWidth))
                .point("entrance3",resize(pointsData.entrance3[0], containerWidth), resize(pointsData.entrance3[1],containerWidth))
                .point("entrance4",resize(pointsData.entrance4[0], containerWidth), resize(pointsData.entrance4[1],containerWidth))
                .point("gate0",resize(pointsData.gate0[0], containerWidth), resize(pointsData.gate0[1],containerWidth))
                .point("gate1",resize(pointsData.gate1[0], containerWidth), resize(pointsData.gate1[1],containerWidth))
                //.point("gate1",resize(100, containerWidth), resize(100, containerWidth))
                .point("gate2",resize(pointsData.gate2[0], containerWidth), resize(pointsData.gate2[1],containerWidth))
                .point("gate3",resize(pointsData.gate3[0], containerWidth), resize(pointsData.gate3[1],containerWidth))
                .point("gate4",resize(pointsData.gate4[0], containerWidth), resize(pointsData.gate4[1],containerWidth))
                .point("gate5",resize(pointsData.gate5[0], containerWidth), resize(pointsData.gate5[1],containerWidth))
                .point("gate6",resize(pointsData.gate6[0], containerWidth), resize(pointsData.gate6[1],containerWidth))
                .point("gate7",resize(pointsData.gate7[0], containerWidth), resize(pointsData.gate7[1],containerWidth))
                .point("gate8",resize(pointsData.gate8[0], containerWidth), resize(pointsData.gate8[1],containerWidth))
                .point("general-gate0",resize(pointsData['general-gate0'][0], containerWidth), resize(pointsData['general-gate0'][1],containerWidth))
				.point("general-gate1",resize(pointsData['general-gate1'][0], containerWidth), resize(pointsData['general-gate1'][1],containerWidth))
                .point("general-gate2",resize(pointsData['general-gate2'][0], containerWidth), resize(pointsData['general-gate2'][1],containerWidth))
                .point("general-gate3",resize(pointsData['general-gate3'][0], containerWidth), resize(pointsData['general-gate3'][1],containerWidth))
                .point("general-gate4",resize(pointsData['general-gate4'][0], containerWidth), resize(pointsData['general-gate4'][1],containerWidth))
                .point("general-gate5",resize(pointsData['general-gate5'][0], containerWidth), resize(pointsData['general-gate5'][1],containerWidth))
                .point("general-gate6",resize(pointsData['general-gate6'][0], containerWidth), resize(pointsData['general-gate6'][1],containerWidth))
                .point("general-gate7",resize(pointsData['general-gate7'][0], containerWidth), resize(pointsData['general-gate7'][1],containerWidth))
                .point("ranger-base",resize(pointsData['ranger-base'][0], containerWidth), resize(pointsData['ranger-base'][1],containerWidth))
                .point("ranger-stop0",resize(pointsData['ranger-stop0'][0], containerWidth), resize(pointsData['ranger-stop0'][1],containerWidth))
                .point("ranger-stop1",resize(pointsData['ranger-stop1'][0], containerWidth), resize(pointsData['ranger-stop1'][1],containerWidth))
                .point("ranger-stop2",resize(pointsData['ranger-stop2'][0], containerWidth), resize(pointsData['ranger-stop2'][1],containerWidth))
                .point("ranger-stop3",resize(pointsData['ranger-stop3'][0], containerWidth), resize(pointsData['ranger-stop3'][1],containerWidth))
                .point("ranger-stop4",resize(pointsData['ranger-stop4'][0], containerWidth), resize(pointsData['ranger-stop4'][1],containerWidth))
                .point("ranger-stop5",resize(pointsData['ranger-stop5'][0], containerWidth), resize(pointsData['ranger-stop5'][1],containerWidth))
                .point("ranger-stop6",resize(pointsData['ranger-stop6'][0], containerWidth), resize(pointsData['ranger-stop6'][1],containerWidth))
                .point("ranger-stop7",resize(pointsData['ranger-stop7'][0], containerWidth), resize(pointsData['ranger-stop7'][1],containerWidth))
                .debug(false);


                // Container div for linkTo chart
                //

				let linkToDiv=selection.append("span")
				.attr("id","linkTo-chart")
				.attr("class", "svg-container-small")
				.html("<h4>Links To</h4><p> Bars represent number of links (gate crossings) from the highlighted point(s) on map towards each reached point. 'Other' means that link points outside the camp, or that the path is not end yet (eg. vehicle is still in camping) ");	

				let smallContainerWidth=linkToDiv.node().getBoundingClientRect().width; //takes the width of the responsive div
				

				// Dc rowchart: LinkTo chart
				//
   				var linkChart = dc.rowChart('#linkTo-chart');
      			linkChart
      			.elasticX(true)
      				.width(smallContainerWidth-padding/2)
   					.height(containerWidth-padding)
   					.dimension(linkDimension)
   					.group(filtered_linkGroup)	
     				//.ordinalColors(['orange','green','red', 'cyan', 'purple', 'yellow', 'blue'])
     				.colors(d3.scaleOrdinal().domain(["ranger-stop","entrance", "general-gate","gate","camping","ranger-base","other"])
                                .range(["yellow","green","cyan","red","orange","purple","blue"]))
     				.colorAccessor(function(d){ 
     					
     				let name=checkNameStart(d.key);
     				return name;
    
     			});
   			
					
     			// Container for timeline
				//

    			let timedataContainer=selection.append("div")
				.attr("id","dc-timeline-chart-container")
				.attr("class", "svg-container-medium") //appends container div for full and daily charts
			   
				.html("<h4>Timeline</h4><p>Global and daily trends of gate crossings </p><p><button onclick=toggleTotal()>global view</button><button onclick=toggleDaily()>daily view</button></p><div id='dc-timeline-chart-full'></div><div id='dc-timeline-chart-daily' style='display:block'></div>");						
				// DC linechart graph
				//
				let timelineChartFull = dc.lineChart("#dc-timeline-chart-full");
  				 timelineChartFull.height(smallContainerWidth-padding*2.5)
  				 .width(containerWidth-padding/2)

    			//.margins({top: 10, right: 10, bottom: 20, left: 40})
    			.dimension(volumeByWeek)		
    			.yAxisLabel([""], 30)
					// the values across the x axis
   				.group(volumeByWeekGroup)
   				.elasticX(true)
   				.elasticY(true)
   				.transitionDuration(500)
   				.renderVerticalGridLines(true)
   				   .renderHorizontalGridLines(true)
   				.x(d3.scaleLinear())
   				.x(d3.scaleTime().range([parseDate('2015-5-1 0:43:28'), parseDate('2016-5-31 23:56:6')])) // scale and domain of the graph
   		

				let timelineChartDaily = dc.lineChart("#dc-timeline-chart-daily");
  				 timelineChartDaily.height(smallContainerWidth-padding*2.5)
  				 .width(containerWidth-padding/2)
  				 //.margins({top: 10, right: 50, bottom: 20, left: 50})
    			.dimension(volumeByDay)								// the values across the x axis
   				.group(volumeByDayGroup)	
   				.yAxisLabel([""], 30)
   				.elasticX(true)
   				.elasticY(true)
   				.transitionDuration(500)
   				.renderVerticalGridLines(true)
   				   .renderHorizontalGridLines(true)
   				.x(d3.scaleLinear())
   				.xAxis().ticks(7).tickFormat(
        			function (data, index) { return days[index]; }); //use the index for cycle throu the support array (days)


   				// Container for vehicle chart
   				//

				let vehicleDiv=selection.append("span")
				.attr("id","vehicle-chart")
				.attr("class", "svg-container-small")
				.html("<h4>Vehicle Type</h4><p> Vehicle type grouped by gate crossings.");

				// DC pie Chart
				//
				let vehicleChart = dc.pieChart("#vehicle-chart")
				.height(smallContainerWidth-padding*2)
				.width(smallContainerWidth-padding*2)
    			.dimension(vehicleDimension)
      			.group(vehicleDimension.group());	

      			// Container for path lenght distribution 
      			//
      			let pathDiv=selection.append("span")
				.attr("id","path-chart")
				.attr("class", "svg-container-medium")
				.html("<h4>Path Lenght Distribution</h4><p> Number of gate crossings by path length. On tooltip, gate crossings grouped by path of belonging. If not all points on map are highlighted the result is the fraction of the paths passing for that point </p>");

				// DC bar chart
				//
				let pathChart = dc.barChart("#path-chart")
				.height(smallContainerWidth-padding*2.5)
				.width(containerWidth-padding/2)
					.dimension(pathDimension)

      			.group(pathGroup)
      			.yAxisLabel([""], 30)  //padding for long ticks
      			.renderTitle(true)
      			.title(function (p) { //it's called title, but it's a tooltip...
            		return p.value+ ' on ' +p.value/p.key+' paths'; // 'clean' result if all points are highlighted, otherwise show the fraction of paths for that point
        		})
				.elasticY(true)
				.renderHorizontalGridLines(true)
				.renderVerticalGridLines(true)
				.xUnits(dc.units.ordinal)  //used numbers as ordinal, because ...
    		 	.x(d3.scaleOrdinal())    
            	
            	//.yAxis().tickFormat(function(v) {console.log(v); return v + '%';});	
 
            	// Container for text description of results

   				let textDiv=selection.append("span")
				.attr("id","nodes-chart-info")
				.attr("class", "svg-container-large")
				.html("<h3>Map points</h3>  <p> blablablab lalblalabl blablablablalblalabl abalbalblalb blablablab lalblalablblablablablalblalabl</p>  <p>abalballbalabl blablablablalblalablblablablablalblalabl blablablablalblalablblablablablalblalabl blablablablalblalablblablablablalblalablblablablablalblalablblablablablalblalabl </p><p> powered by elisa emilia gigia pipo taco trilli gattonero</p>");
   		

					dc.renderAll();
				$("#dc-timeline-chart-daily").attr("style", "display: none"); // hide the daily graph after rendered

	}

	return me;

}
