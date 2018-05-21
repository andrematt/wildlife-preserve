
/**
 *
 *  This module will display a map with a symbol encoding for a set of geographical elements
 */

//.reverse!


function mapApp(){
	const padding=80;

	// Utils functions
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

	function parseVehicleType(d){ //invece degli if mappa domain e range
		if (d.vehicleType=="1"){
      		return 0;
      	}
      	else if (d.vehicleType=="2"){
      		return 1;
      	}
      	else if (d.vehicleType=="2P"){
      		return 2;
      	}
      	else if (d.vehicleType=="3"){
      		return 3;
      	}
      	else if (d.vehicleType=="4"){
      		return 4;
      	}
      	else if (d.vehicleType=="5"){
      		return 5;
      	}
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
		
		
		


	}

	function formatVehicleType(d){
    	if (d=="1"){
      		return "1 axis";
    	}
    	else if (d=="2"){
    		return "2 axis";
    	}
        else if (d=="2P"){
    		return "2 axis ranger";
    	}
    	else if (d=="3"){
      		return "3 axis";
    	}
    	else if (d=="4"){
      		return "4 axis";
    	}
    	else if (d=="5"){
      		return "5 axis";
    	}
    	else if (d=="6"){
      		return "6 axis";
    	}
	}

	function conditionalColoring(d){
		console.log(d)
	}

		
	
	function me(selection){

		let sensors;	
		let urlSensor = 'http://localhost:3000/sensors/';
		let sensorData=fetch(urlSensor).then((resp) => resp.json());
		
		sensorData.then(function(values){
			if (values) {

				/* Prepare data fetched from server 		   
				*/
				let shifted=values.shift(); // Just remove heading
				sensors=values; 

				/* Prepare data received via Selection 		   
				*/
				console.log("MapBase", selection.datum());	
				let sensorNames=[""]; //offset per il primo valore
				selection.datum().forEach(function (d){ 
					sensorNames.push(d.fullname);
				});
				console.log(sensorNames);


				// Crossfilter grouping
 		    	//
 		    	let crossings  = crossfilter(sensors);	
      			id = crossings.dimension(function(d) { return d.id; }),
      			ids = id.group(),
      			vehicleType = crossings.dimension(function(d) {
      				return d.type;
      			});
      			vehicleTypes = vehicleType.group();
      			gate = crossings.dimension(function(d) {
      				return d.gate;
      			});
      			gates = gate.group();
      			
      			gateType=crossings.dimension(function(d){
      				let nameInitial=checkNameStart(d.gate);
      				return nameInitial;
      			}); //raggruppamento di gate con nest      			
      			gateTypes=gateType.group();

				//DC chart for gate type
				//
				selection.append("span")
				.attr("id","dc-gates-chart")
				.attr("class", "svg-container-medium");

				/*
				let gatesChart = dc.barChart("#dc-gates-chart");
 			   	gatesChart.height(400)
     			.margins({top: 10, right: 10, bottom: 20, left: 40})
     			.dimension(gate)								// the values across the x axis
     			.group(gates)							// the values on the y axis
	 			.transitionDuration(500)
     			.centerBar(true)
     			.elasticY(true)
     			.x(d3.scaleOrdinal().domain(sensorNames)) // Need empty val to offset first value
				.xUnits(dc.units.ordinal)
				//.xAxis().tickFormat(function(v) {return v;})
	 			.label(function(d){
	 				console.log(d);
	 				return d.x;
	 			});
				*/

      			let gatesChart = dc.rowChart("#dc-gates-chart");	        
		        gatesChart.height(600)
    			.margins({top: 10, right: 10, bottom: 20, left: 40})
    			.dimension(gateType)								// the values across the x axis
    			.group(gateTypes)
   				.ordinalColors(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628'])							// the values on the y axis
				//.ordinalColors(function(d){return '#e41a1c'; })
				.transitionDuration(500)
				.label(function (d){ 
					return d.key;
    			})
    			.elasticX(true);
				

	 			


				
				/* Creation of the containing SVG element for the static minimap
				*/	
				let nodesDiv=selection.append("span")
				.attr("id","nodes-chart")
				.attr("class", "svg-container-small");

				let containerWidth=nodesDiv.node().getBoundingClientRect().width; //takes the width of the responsive div

				let nodeSelection=nodesDiv.append("svg")
				.attr('height',350)
				.attr('width', containerWidth);

				let test=nodeSelection.node().parentNode.getBoundingClientRect();
				
				/* Map the coordinates to containing svg
				*/
				//let boundaries = nodeSelection.node().parentNode.getBoundingClientRect();
				let boundaries = nodeSelection.node().getBoundingClientRect();
				let maxX=d3.max(selection.datum(), function(d){return d.coord[0]});
				let minX=d3.min(selection.datum(), function(d){return d.coord[0]});
				let maxY=d3.max(selection.datum(), function(d){return d.coord[1]});
				let minY=d3.min(selection.datum(), function(d){return d.coord[1]});

				let xScale = xScalePoints(minX,maxX, boundaries.width);
				let xMap=xScaleMap(minX,maxX, boundaries.width);

				let yScale = yScalePoints(minY,maxY, boundaries.height);
				let yMap = yScaleMap(minY,maxY, boundaries.height);
		

				/* Draw the static minimap
				*/
				let nodes=nodeSelection.selectAll("circle")
				.data(selection.datum());

				nodes.enter()
				.append("circle")
				//.attr("stroke", "black")
				.attr("fill", "silver")
				.attr("r", 3)
				.attr("cx", xMap)
    			.attr("cy", yMap)
    			.on("click", function(d){
    				//???
    			})
  				
  				.on("mouseover", function(d) {
				div = d3.select("body") //div tooltip creato al momento e rimosso con mouseout
				.append("div")  //non si può appendere un div a svg! 
				.attr("class", "tooltip")		
    			.style("opacity", .9)	
      			.html(d.type +" "+d.value)
     			.style("left", (d3.event.pageX) + "px")		
           		.style("top", (d3.event.pageY - 28) + "px")		
     			})
     							
    			.on("mouseout", function(d) {		
    			let div = d3.selectAll(".tooltip")
      			.transition()		
         		.duration(500)		
         		.style("opacity", 0)	
         		.remove();	
 		    	})

				//DC chart for vehicle type
      			//
      			selection.append("span")
				.attr("id","dc-vehicles-chart")
				.attr("class", "svg-container-large");


      			let vehiclesChart = dc.rowChart("#dc-vehicles-chart");
		        vehiclesChart.elasticX(true)
    			.height(300)
    			.margins({top: 10, right: 10, bottom: 20, left: 40})
    			.dimension(vehicleType)								// the values across the x axis
    			.group(vehicleTypes)
   				.ordinalColors(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628'])							// the values on the y axis
				.transitionDuration(500)
				.label(function (d){
    	 			return formatVehicleType(d.key);
    			});	

				dc.renderAll();
 		    	
    		};
		})

		
			
 		
	}



	return me;
}