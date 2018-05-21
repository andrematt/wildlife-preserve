
/**
 *
 *  This module will display a map with a symbol encoding for a set of geographical elements
 */

//.reverse!


function chartsApp(){
	const padding=80;
	// Utils functions
	// 
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
		
				let values=selection.datum();
				/* Prepare data fetched from server 		   
				*/
				let shifted=values.shift(); // Just remove heading
				sensors=values; 

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


				//ARGH manca sensornames!!
				
				let gatesChart = dc.barChart("#dc-gates-chart");
 			   	gatesChart.height(600)
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
	 				return d.x;
	 			});
				

				/*
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
				*/	 			


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
		



	return me;
}