
/**
 *
 *  This module will display a map with a symbol encoding for a set of geographical elements
 */



//funct color
//
/*
if point.name==....
colorPoint(point.name)
*/

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

	function parseVehicleType(d){
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

		
	
	function me(selection){

		let sensors;	
		let urlSensor = 'http://localhost:3000/sensors/';
		let sensorData=fetch(urlSensor).then((resp) => resp.json());
		
		sensorData.then(function(values){
			if (values) {
				let shifted=values.shift();;
				sensors=values; //rimuove la prima riga di intestazione
				console.log(sensors)
				console.log(selection); //la selection è il group passato 
				console.log("MapBase", selection.datum());	
				let onlyNames=[""]; //offset per il primo valore
				selection.datum().forEach(function (d){
					onlyNames.push(d.fullname);
				});
				console.log(onlyNames);
				let boundaries = selection.node().parentNode.getBoundingClientRect();
				
				let maxX=d3.max(selection.datum(), function(d){return d.coord[0]});
				let minX=d3.min(selection.datum(), function(d){return d.coord[0]});
				let maxY=d3.max(selection.datum(), function(d){return d.coord[1]});
				let minY=d3.min(selection.datum(), function(d){return d.coord[1]});

				let xScale = xScalePoints(minX,maxX, boundaries.width);
				let xMap=xScaleMap(minX,maxX, boundaries.width);

				let yScale = yScalePoints(minY,maxY, boundaries.height);
				let yMap = yScaleMap(minY,maxY, boundaries.height);
				console.log(boundaries);


				// Draw the static map
				//
				let nodes=selection.selectAll("circle")
				.data(selection.datum());

				nodes.enter()
				.append("circle")
				.attr("stroke", "black")
				.attr("fill", "silver")
				.attr("r", 6)
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

 		    	// Prepare data for Crossfilter
 		    	//
 		    	let crossings  = crossfilter(sensors);	
      			id = crossings.dimension(function(d) { return d.id; }),
      			ids = id.group(),
      			type = crossings.dimension(function(d) {
      				return d.type;
      			});
      			types = type.group();
      			gate = crossings.dimension(function(d) {
      				return d.gate;
      			});
      			gates = gate.group();


      			
      			//DC chart for vehicle type
      			//
      			let vehiclesChart = dc.rowChart("#dc-vehicles-chart");
		        
		        vehiclesChart.width(500)
    			.elasticX(true)
    			.height(600)
    			.margins({top: 10, right: 10, bottom: 20, left: 40})
    			.dimension(type)								// the values across the x axis
    			.group(types)
   				.ordinalColors(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628'])							// the values on the y axis
				.transitionDuration(500)
				.label(function (d){
					//return d.key;
    	 			return formatVehicleType(d.key);
    			});	


				/*
    			//DC chart for gate type
      			//
      			let gatesChart = dc.rowChart("#dc-gates-chart");	        
		        gatesChart.width(500)
    			.height(600)
    			.margins({top: 10, right: 10, bottom: 20, left: 40})
    			.dimension(gate)								// the values across the x axis
    			.group(gates)
   				//.ordinalColors(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628'])							// the values on the y axis
				.transitionDuration(500)
				.label(function (d){
    	 			return d.key;
    			})
    			.elasticX(true);
				*/

				//DC chart for gate type
				//
				let gatesChart = dc.barChart("#dc-gates-chart");
 			   	gatesChart.width(850)
     		    .height(600)
     			.margins({top: 10, right: 10, bottom: 20, left: 40})
     			.dimension(gate)								// the values across the x axis
     			.group(gates)							// the values on the y axis
	 			.transitionDuration(500)
     			.centerBar(true)
     			.elasticY(true)
     			.x(d3.scaleOrdinal().domain(onlyNames)) // Need empty val to offset first value
				.xUnits(dc.units.ordinal)
				//.xAxis().tickFormat(function(v) {return v;})
	 			.label(function(d){
	 				console.log(d);
	 				return d.x;
	 			});

	 			dc.renderAll();
    		};
		})

		
			
 		
	}



	return me;
}