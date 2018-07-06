
/**
 * This module contains all the app functionalities, enclosed in a component
 *  
 */


// Helper functions, for show or hide contents
//
function toggleDuration(){
	$("#path-duration-chart").attr("style", "display: block");
	$("#path-length-chart").attr("style", "display: none");
}

function toggleLength(){
	$("#path-duration-chart").attr("style", "display: none");
	$("#path-length-chart").attr("style", "display: block");
}

function total(){
	$("#dc-timeline-chart-full").attr("style", "display: block");
	$("#dc-timeline-chart-daily").attr("style", "display: none");
	$("#dc-timeline-chart-hour").attr("style", "display: none");

}

function daily(){
	$("#dc-timeline-chart-full").attr("style", "display: none");
	$("#dc-timeline-chart-daily").attr("style", "display: block");
	$("#dc-timeline-chart-hour").attr("style", "display: none");
}

function hour(){
	$("#dc-timeline-chart-full").attr("style", "display: none");
	$("#dc-timeline-chart-daily").attr("style", "display: none");
	$("#dc-timeline-chart-hour").attr("style", "display: block");
}

function reset(){
	dc.filterAll(); 
	dc.renderAll();
}


function mapApp(){
	const padding=80;
	const leftMargin=50;

	const originalSize=982;
	const pointsData={'camping0':[259, 206],'camping1':[634,250], 'camping2':[219,318], 'camping3':[225,338], 'camping4':[240,440], 'camping5':[103,595], 'camping6':[735,868], 'camping7':[888,712], 'camping8':[898,240], 'entrance0':[309,69], 'entrance1':[89,331],'entrance2':[898,430], 'entrance3':[567,819], 'entrance4':[688,902], 'gate0':[312,166], 'gate1':[289,222], 'gate2':[123,269],'gate3':[731,298],'gate4':[806,561],'gate5':[645,717],'gate6':[572,741],'gate7':[479,786],'gate8':[678,887],'general-gate0':[543,50],'general-gate1':[318,128],'general-gate2':[512,162],'general-gate3':[912,273],'general-gate4':[342,482],'general-gate5':[610,546],'general-gate6':[668,673],'general-gate7':[322,707],'ranger-base':[629,857],'ranger-stop0':[440,85],'ranger-stop1':[99,122],'ranger-stop2':[396,176],'ranger-stop3':[726,225],'ranger-stop4':[95,470],'ranger-stop5':[740,582],'ranger-stop6':[605,721], 'ranger-stop7':[493,746]};
	const days = ["monday","thuesdays","wednesday","thursday","friday","saturnday","sunday"];

// Utils functions
//

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
	else if(d.startsWith('oth')) {
		return 'other';
	}
}

function resize(n, width){
	return n*(width-padding)/originalSize;
}

function remove_empty_bins(source_group) { //function suggested on https://github.com/dc-js/dc.js/wiki/FAQ
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return d.value != 0;
            });
        }
    };
}

	

function parse(data){
	let splitted=data.split(/,|\n|\r\n/); //split at each ',' or new line (different carriage return for linux and windows)
	let cloned=[];
	for (i = 0; i < splitted.length; i=i+4) { //reconstruct CSV row
    	cloned.push(splitted.slice(i, i+4));
  	}
 	return(cloned);
}

function sort(data){
	let sortedVehicles=data.sort(function(a,b){ // sort array on vehicle ID
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
		if (sortedVehicles[i].id!==sortedVehicles[i-1].id || (singlePath.path.length>1&&((sortedVehicles[i].gate.startsWith('entrance')&&sortedVehicles[i-1].gate.startsWith('entrance'))))){ //ARGH condizioni di terminazione: il veicolo seguente ha targa diversa oppure c'è un path di lunghezza >1 con due ingressi consecutivi
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
function createMatrix(pathData){ //flatten the array of paths
let resultMatrix=[];

	pathData.forEach(function(d){ //iterates the list of paths 

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
		}	

		resultMatrix.push({'name':d.path[counter+1].gate, 'id':d.vehicleId, 'start':d.path[0].time, 'end':d.path[d.path.length-1].time, 'pathLength':d.path.length, 'timeStamp':d.path[counter+1].time,  'linkTo':'other', 'vehicleType':d.vehicleType}); //if is the last element in the path array we don't know where it's destination

	});

return resultMatrix;
}

		
	function me(selection){

		let contentWidth=selection.node().getBoundingClientRect().width;

		// Data setup
		//
	
		let values=selection.datum();
   		values.shift(); // Just remove heading
   		let sorted=sort(values);
   		let pathData=makePath(sorted); //paths, useful for statistics
   		let pointMatrix=createMatrix(pathData);
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

				
		//Path duration dimention and group
      	let pathDurationDimension = gatesData.dimension(function(d){ 
      		let startDate=parseDate(d.start);
			let endDate=parseDate(d.end);
   			let timeDiff = Math.abs(endDate - startDate);
			let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
   			return diffDays;
		});
				
				
		let pathDurationGroup = pathDurationDimension.group().reduceCount(function(d){ 
    		let startDate=parseDate(d.start);
			let endDate=parseDate(d.end);
   			let timeDiff = Math.abs(endDate - startDate);
			let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
   			return diffDays;
		});
				


		//Path length dimention and group
      	let pathDimension = gatesData.dimension(function(d){  
   			return d.pathLength;
		});
				
		let pathGroup = pathDimension.group().reduceCount(function(d){ 
    		return d.pathLength;
		});
		let filtered_pathGroup = remove_empty_bins(pathGroup);
			
		//linkTo dimention and group
      	let linkDimension = gatesData.dimension(function(d){
   			return d.linkTo;
		});
				
		let linkGroup = linkDimension.group().reduceCount(function(d){ 
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
    		.reduceCount(function(d) { return parseDate(d.timeStamp); 
    	});		

    	// Group data by week day
  		let volumeByDay =  gatesData.dimension(function(d) {
 			let parsedDate = d3.timeDay(parseDate(d.timeStamp));
    		return parsedDate.getDay();
  		});

  		// map/reduce to group sum (how much traffic on each mondays, thuesdays...)
  		let volumeByDayGroup = volumeByDay.group()
    		.reduceCount(function(d) { return (parseDate(d.timeStamp)); 
    	});

    	// Group data by hour
  		let volumeByHour =  gatesData.dimension(function(d) {
 			let parsedDate = parseDate(d.timeStamp);
			return parsedDate.getHours();
  		});

  		// map/reduce to group sum (how much traffic on each hour)
  		let volumeByHourGroup = volumeByHour.group()
    		.reduceCount(function(d) { return (parseDate(d.timeStamp)); 
    	});

				
			
		// Graphs and containing html structure
		//
		let introDiv=selection.append("span")
			.attr("id","nodes-chart-info")
			.attr("class", "svg-container-large")
			.html("<h3>Introducing the dashboard</h3>  <p> This project is built to help the researcher Mitch Vogel to investigate the possibile causes of the decrease in the number of nesting pairs of the Rose-Crested Blue Pipit in the the Boonsong Lekagul Nature Preserve, throu the analisys of the park vehicle traffic recorded by sensors. </p><p>To get more information out of data, the single sensor informations are grouped in paths, basing on the ID of the vehicle and the enter and exit gate.</p> <p> You can explore the data yourself, or look in the <a href='#results'>results</a> section to get an idea about the strange patterns that emerged during the analysis. ");
   		
 
		// Container for svg map and bubble overlay
		//
		let nodesDiv=selection.append("span")
			.attr("id", "overlay")
			.attr("class", "svg-container-medium")
			.html("<h4>Lekagul Park Roadways </h4><p>The map represent the allowed routes throu the park, and the points of interest in which a sensor is present. Click on a point for the distribution of traffic outgoing from that point.</p>");

			let containerWidth=nodesDiv.node().getBoundingClientRect().width; //takes the width of the responsive div
			
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
   			.svg(d3.select("#overlay svg"))
      		.width(containerWidth-padding)
            .height(containerWidth-padding)
            .dimension(gateDimension)
            .group(gateGroup)
            .radiusValueAccessor(function(p) {
                return 3; //set the same size for all
            })
            //.r(d3.scaleLinear().domain([10, 100]))
            .colors(d3.scaleOrdinal().domain([0,1,2,3,4,5,6])
            .range(["#FFFF33","#91ca79","#73ccca","#c51d33","#bd693b","#51003f"]))
     		.colorAccessor(function(d){ 
     			let name=checkNameStart(d.key);
     			if(name=='ranger-stop'){
						return (0);
					}
					else if (name=='entrance'){
						return (1);
					}
					else if(name=='general-gate'){
						return(2);
					}
					else if(name=='gate'){
						return(3);
					}
					else if(name=='camping'){
						return (4);
					}
					else if(name=='ranger-base'){
						return (5);
					}
					else if(name=='other'){
						return (6);
					}
					else if(name=='test'){
						return (7);
					}
						else if(name=='appia'){
						return (8);
					}
					
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

			.html("<h4>Links To</h4><p> Bars represent number of links (gate crossings) from the highlighted point(s) on map towards each reached point. 'Other' means last step of the path: it can points outside the camp, or be still stantiated in the park at the moment (in camping or at ranger base: the path is not end yet).");	
		let smallContainerWidth=linkToDiv.node().getBoundingClientRect().width; //takes the width of the responsive div
				

		// Dc rowchart: LinkTo chart
		//
   		var linkChart = dc.rowChart('#linkTo-chart');
      	linkChart.elasticX(true)
      		.x(d3.scaleLinear())
      		.labelOffsetX(5)
      		.width(smallContainerWidth-padding/2)
   			.height(containerWidth-padding)
   			.dimension(linkDimension)
   			.group(filtered_linkGroup)	
     		.colors(d3.scaleOrdinal().domain([0,1,2,3,4,5,6,7])
           .range(["#FFFF33","#91ca79","#73ccca","#c51d33","#bd693b","#51003f","blue"])) //yellow green cyan red
     				.colorAccessor(function(d, i){ 
     				let name=checkNameStart(d.key);			
     				if(name=='ranger-stop'){
						return (0);
					}
					else if (name=='entrance'){
						return (1);
					}
					else if(name=='general-gate'){
						return(2);
					}
					else if(name=='gate'){
						return(3);
					}
					else if(name=='camping'){
						return (4);
					}
					else if(name=='ranger-base'){
						return (5);
					}
					else if(name=='other'){
						return (6);
					}
     			});
   			
					
     			// Container for timeline
				//

    			let timedataContainer=selection.append("div")
				.attr("id","dc-timeline-chart-container")
				.attr("class", "svg-container-medium") //appends container div for full, daily and hours charts
				.html("<h4>Timeline</h4><p>Global, daily and hourly trends of gate crossings. </p>")
				.append("p")						
				.html("<button onclick=total()>global view</button><button onclick=daily()>daily view</button><button onclick=hour()>hour view</button>");
				
				timedataContainer.append("div")
				.attr("id","dc-timeline-chart-full");
				timedataContainer.append("div")
				.attr("id","dc-timeline-chart-daily");
				timedataContainer.append("div")
				.attr("id","dc-timeline-chart-hour");

				// DC linechart graph
				//
				let timelineChartFull = dc.lineChart("#dc-timeline-chart-full");
  				 timelineChartFull.height(smallContainerWidth-padding*2.5)
  				.width(containerWidth-padding/2)
    			.dimension(volumeByWeek)		
    			.yAxisLabel([""], 30)
   				.group(volumeByWeekGroup)
   				.elasticX(true)
   				.elasticY(true)
   				.transitionDuration(500)
   				.renderVerticalGridLines(true)
   				   .renderHorizontalGridLines(true)
   				.x(d3.scaleLinear())
   				.x(d3.scaleTime().range([parseDate('2015-5-1 0:43:28'), parseDate('2016-5-31 23:56:6')])) // scale of graph
   		

				let timelineChartDaily = dc.lineChart("#dc-timeline-chart-daily");
  				 timelineChartDaily.height(smallContainerWidth-padding*2.5)
  				.width(containerWidth-padding/2)
    			.dimension(volumeByDay)							
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

   				let timelineChartHour = dc.lineChart("#dc-timeline-chart-hour");
  				 timelineChartHour.height(smallContainerWidth-padding*2.5)
  				.width(containerWidth-padding/2)
    			.dimension(volumeByHour)			
   				.group(volumeByHourGroup)	
   				.yAxisLabel([""], 30)
   				.elasticX(true)
   				.elasticY(true)
   				.transitionDuration(500)
   				.renderVerticalGridLines(true)
   				   .renderHorizontalGridLines(true)
   				.x(d3.scaleLinear())
   				.xAxis().ticks(24).tickFormat(
        			function (data, index) { return data; });


   				// Container for vehicle chart
   				//

				let vehicleDiv=selection.append("span")
				.attr("id","vehicle-chart")
				.attr("class", "svg-container-small")
				.html("<h4>Vehicle Type</h4><p> Vehicle type grouped by gate crossings. Numbers represent number of vehicle axis, 2P are ranger cars.");

				// DC pie Chart
				//
				let vehicleChart = dc.pieChart("#vehicle-chart")
				.height(smallContainerWidth-padding*2)
				.colors(d3.scaleOrdinal().range(['#7fc97f','#beaed4','#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17']))
				.width(smallContainerWidth-padding*2)
    			.dimension(vehicleDimension)
      			.group(vehicleDimension.group());	

      			// Container for path lenght distribution 
      			//
      			let pathDiv=selection.append("span")
				.attr("id","path-chart-container")
				.attr("class", "svg-container-large")
				.attr("height", smallContainerWidth)
				.html("<h4>Path Lenght Distribution</h4><p> Number of gate crossings by path length. On tooltip, gate crossings grouped by path of belonging. If not all points on map are highlighted the result is the fraction of the paths passing for that point. </p><p><button onclick=toggleLength()>length view</button><button onclick=toggleDuration()>duration view</button><div id='path-length-chart'></div><div id='path-duration-chart'></div>");

				// DC bar chart for path lenght
				//

				let pathChart = dc.barChart("#path-length-chart")
				.height(smallContainerWidth-padding*2.5)
				.width(contentWidth-padding/2)
					.dimension(pathDimension)
				.brushOn(true)
      			.group(pathGroup)
      			.yAxisLabel([""], 30)  //padding for long ticks
      			.renderTitle(true)
      			.title(function (p) { //label title
            		return p.value+ ' on ' +p.value/p.key+' paths'; // 'clean' result if all points are highlighted, otherwise show the fraction of paths for that point
        		})
        		.label(function(d){ 
					return d.data.value;
				})	
				.elasticY(true)
				.renderHorizontalGridLines(true)
				.renderVerticalGridLines(true)
				.xUnits(dc.units.ordinal)  //used numbers as ordinal, because in this way the actual values are better visible
    		 	.x(d3.scaleOrdinal())
    		 	//.x(d3.scaleLinear().domain([0,75]))    
    		 	

    		 	// DC bar chart for path duration
				//
				let pathDurationChart = dc.barChart("#path-duration-chart")
				.height(smallContainerWidth-padding*2.5)
				.width(contentWidth-padding/2)
					.dimension(pathDurationDimension)
      			.group(pathDurationGroup)
      			.yAxisLabel([""], 30)  //padding for long ticks
      			.renderTitle(true)
				.elasticY(true)
				.title(function (d) { //label title
            		return d.value;
        		}) 
				.label(function(d){
					return d.data.value;
				})		
				.renderHorizontalGridLines(true)
				.renderVerticalGridLines(true)
				.xUnits(dc.units.ordinal)
    		 	.x(d3.scaleOrdinal())  
  

            	let resetDiv=selection.append("span")
				.attr("id","nodes-chart-reset")
				
				.attr("height", "200px")
				.html("<div class='resetWrapper'><p> <button onclick=reset()>Reset all</button> </p></div>");
   		
 
            	// Container for text description of results
   				let textDiv=selection.append("span")
				.attr("id","nodes-chart-info")
				.attr("class", "svg-container-large")
				.html("<h3 id='results'>Results</h3>  <p> Some strange behaviours emerges from the data: </p>  <ul><li>Some path go directly from entrance 1 to ranger-stop 1, but this should not be possible: some motorcyclists found a path to the ranger-stop, but then come back to entrance.</li><li>There is a strange pattern happenings on wednesday and friday nights, that involves a 4 axis vehicle crossings gates 3,5 and 6, general-gate 2 and 5, ranger stop 0, 2, 3 and 6, and entrances 2 and 3. This is the main suspect for the decrease of bird's number.</li><li>A motorcyclist is touring in the park since june 2016, and at the moment it is found in camping 5. We can see this pattern because there is just one path of lenght 70, and this path has the flag 'other' in camping 5.  </li><li>The traffic on camping 1 and on general-gate 0 is really low. In particular there is an huge traffic 'loss' in the road between general-gate 2 and general-gate 0, despice they are geographically really near. Perhaps there is something worth investigating there, but rangers drived throu the road between the two points just twice in the last year.   </li></ul>");
   		

				dc.renderAll();

				$("#path-duration-chart").attr("style", "display: none"); //Hide not used elements after render
				$("#dc-timeline-chart-daily").attr("style", "display: none");
				$("#dc-timeline-chart-hour").attr("style", "display: none");

	}

	return me;

}

