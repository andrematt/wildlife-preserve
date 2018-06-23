
/**
 *  TODO: aggiungere un dato all'inizio e alla fine del raggruppamento per giorno, e all'array di giorni così da centrale la viz
 *  
 */

//.reverse!
let showTotal=true;

function toggleTotal(){

		
  $("#dc-timeline-chart-daily").attr("style", "display: none");
  $("#dc-timeline-chart-full").attr("style", "display: block");
	}

function toggleDaily(){

		$("#dc-timeline-chart-full").attr("style", "display: none");
		$("#dc-timeline-chart-daily").attr("style", "display: block");
	}


function chartsApp(){
	const padding=80;
	const sensorNames=["","camping0","camping1","camping2","camping3","camping4","camping5","camping6","camping7","camping8","entrance0","entrance1","entrance2","entrance3","entrance4","gate0" ,"gate1" ,"gate2", "gate3","gate4","gate5","gate6","gate7","gate8","general-gate0","general-gate1","general-gate2","general-gate3","general-gate4","general-gate5","general-gate6","general-gate7", "ranger-base","ranger-stop0","ranger-stop1","ranger-stop2","ranger-stop3","ranger-stop4","ranger-stop5","ranger-stop6","ranger-stop7"];
	const days = ["monday","thuesdays","wednesday","thursday","friday","saturnday","sunday"];

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
		

		let urlSensor = 'http://localhost:3000/sensors/';
		let sensorData=fetch(urlSensor).then((resp) => resp.json());
		
				let values=selection.datum();
				/* Prepare data fetched from server 		   
				*/
				values.shift(); // Just remove heading
				let parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S"); //set dateTime format

				// Crossfilter dimentioning and grouping
 		    	//
 		    	let crossings  = crossfilter(values);	
		   			
 		    	// id dimention and group
      			id = crossings.dimension(function(d) { return d.id; }),
      			ids = id.group(),
      			
      			//vehicle type dimention and group
      			vehicleType = crossings.dimension(function(d) {
      				return d.type;
      			});
      			vehicleTypes = vehicleType.group();

      			//gate dimention and group
      			gate = crossings.dimension(function(d) {
      				return d.gate;
      			});
      			gates = gate.group();

      			//gates grouped by type, basing on the first part of name
      			gateType=crossings.dimension(function(d){
      				let nameInitial=checkNameStart(d.gate);
      				return nameInitial;
      			});       			
      			gateTypes=gateType.group();

				 // week dimenstion and group
  				let volumeByWeek = crossings.dimension(function(d) {
    				return d3.timeWeek(parseDate(d.timestamp));
  				});

  				// map/reduce to group sum
  				let volumeByWeekGroup = volumeByWeek.group()
    			.reduceCount(function(d) { return parseDate(d.timestamp); });	

    			 // Group data by week day
  				let volumeByDay = crossings.dimension(function(d) {
 					let parsedDate = d3.timeDay(parseDate(d.timestamp));
    				return parsedDate.getDay();
  				});


  				// map/reduce to group sum (how much traffic on each mondays, thuesdays...)
  				let volumeByDayGroup = volumeByDay.group()
    			.reduceCount(function(d) { return (parseDate(d.timestamp)); });
    			


				// DC chart for single gates
				//
				let gatesContainer=selection.append("span")
				.attr("id","dc-gates-chart")
				.attr("class", "svg-container-large")
				.html("<h4>Gates chart</h4>");

				/*
				// Alternate chart for gates grouped by type... quite ugly!
				//
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
				let gatesChart = dc.barChart("#dc-gates-chart");
 			   	gatesChart.height(300)
     			.margins({top: 10, right: 10, bottom: 20, left: 40})
     			.dimension(gate)								// the values across the x axis
     			.group(gates)							// the values on the y axis
	 			.transitionDuration(500)
     			.centerBar(true)	
     			.elasticY(true)
     			.ordinalColors(['orange','green','red', 'cyan', 'purple', 'yellow'])
     			.colorAccessor(function(d){ 
     				let name=checkNameStart(d.key);
     				if(name==='ranger-stop'){
						return ("a");
					}
					else if (name==='entrance'){
						return ("b");
					}
					else if(name==='general-gate'){
						return("c");
					}
					else if(name==='gate'){
						return("d");
					}
					else if(name==='camping'){
						return ("e");
					}
					else if(name==='ranger-base'){
						return ("f");
					}
     			})
     			.x(d3.scaleOrdinal().domain(sensorNames)) // Need empty val to offset first value
				.xUnits(dc.units.ordinal)
				.xAxis()
				.tickFormat(function(v) {
					return ("");
				})
			
	 			//.label(function(d){
	 			//	return d.x;
	 			//});
				

	 			
							
				//DC chart for vehicle type
      			//
      			let vehiclesContainer=selection.append("span")
				.attr("id","dc-vehicles-chart")
				.attr("class", "svg-container-large")
				.html("<h4>Vehicles chart</h4>");

				
      			let vehiclesChart = dc.rowChart("#dc-vehicles-chart");
		        vehiclesChart.elasticX(true)
    			.height(300)
    			.margins({top: 10, right: 10, bottom: 20, left: 40})
    			.dimension(vehicleType)								// the values across the x axis
    			.group(vehicleTypes)
   				.linearColors(['darkblue'])							// the values on the y axis
				.transitionDuration(500)
				.label(function (d){
    	 			return formatVehicleType(d.key);
    			});	
				
				
				
    			//Container for full timeline and grouped by day timeline
    			//
    			let timedataContainer=selection.append("div")
				.attr("id","dc-timeline-chart-container")
				.attr("class", "svg-container-large") //appends container div for full and daily charts
				.html("<h4>Timeline chart</h4><button onclick=toggleTotal()>global view</button><button onclick=toggleDaily()>daily view</button><div class='chart svg-container-large' id='dc-timeline-chart-full'></div><div class='chart svg-container-large' id='dc-timeline-chart-daily' style='display:block'></div>");
								

				let timelineChartFull = dc.lineChart("#dc-timeline-chart-full");
  				 timelineChartFull.height(300)
    			.margins({top: 10, right: 10, bottom: 20, left: 40})
    			.dimension(volumeByWeek)		
					// the values across the x axis
   				.group(volumeByWeekGroup)
   				.elasticX(true)
   				.elasticY(true)
   				.transitionDuration(500)
   				.renderVerticalGridLines(true)
   				.x(d3.scaleLinear())
   				.x(d3.scaleTime().range([parseDate('2015-5-1 0:43:28'), parseDate('2016-5-31 23:56:6')])) // scale and domain of the graph
   		

				let timelineChartDaily = dc.lineChart("#dc-timeline-chart-daily");
  				 timelineChartDaily.height(300)
    			.margins({top: 10, right: 50, bottom: 20, left: 50})
    			.dimension(volumeByDay)								// the values across the x axis
   				.group(volumeByDayGroup)	
   				.elasticX(true)
   				.elasticY(true)
   				.transitionDuration(500)
   				.renderVerticalGridLines(true)
   				.x(d3.scaleLinear())
   				.xAxis().ticks(7).tickFormat(
        			function (data, index) { return days[index]; }); //use the index for cycle throu the support array (days)
   			


				dc.renderAll();
				$("#dc-timeline-chart-daily").attr("style", "display: none"); // hide after rendered

 		    	
    		};
		



	return me;
}