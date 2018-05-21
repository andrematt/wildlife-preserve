
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

		
		
	function me(selection){

	
				
				/* Creation of the containing SVG element for the static minimap
				*/	
				let nodesDiv=selection.append("span")
				.attr("id","nodes-chart")
				.attr("class", "svg-container-half");

				let textDiv=selection.append("span")
				.attr("id","nodes-chart-info")
				.attr("class", "svg-container-half")
				.html("<h3>blablablablab</h3>  explaination of map");

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
			
 		
	}



	return me;
}