function streamGraph(CSSsiteId, options){
	// Merge options with default options
	var settings = $.extend({
		containerDimensionWidth: 900,
		containerDimensionHeight: 400,
		marginTop: 5,
		marginRight: 15,
		marginBottom: 45,
		marginLeft: 60,
	}, options||{});

	var instanceMemory = {
		chartDimensions: {
			height: settings.containerDimensionHeight - settings.marginTop - settings.marginBottom,
			width: settings.containerDimensionWidth - settings.marginLeft - settings.marginRight,
			lineheight: ''
		},
		activeViewStyle: 0,
		viewStyleEnum: {
			multiple: 0,
			stacked: 1
		},
		yAxisLabel: ''
	}

	this.setYAxisLabel = function(labelname){
		instanceMemory.yAxisLabel = labelname;
	}

	this.draw = function(data){

		"use strict";

		data.splice(4,1);
		data = data.reverse();

		var svg = d3.select("#"+CSSsiteId+" #streamgraphVisualization").append("svg")
			.attr("width", settings.containerDimensionWidth)
			.attr("height", settings.containerDimensionHeight)
			.append("g")
				.attr("transform", "translate(" + settings.marginLeft + "," + settings.marginTop + ")");


		// Convert Data to match Micha's golden Rule (Do not store data in the keys of a JSON blob.)

	 	var concatDataEntries = [];
	  	var groupName;
	  	var convertedData;
			var parseDate = d3.time.format("%Y").parse

	  	for(var i=0;i<data.length;i++){
	  		convertedData = d3.entries(data[i]);
	  		groupName = {name: convertedData[0].value};
			// Remove non-numeric data values
			convertedData = convertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
	  		// Add Group (lineheader), convert Date, convert value from String to Number
	  		convertedData.forEach(function(d){
	  			d.group = this.name;
	  			d.date = parseDate(d.key);
	  			d.value = +d.value;
	  		}, groupName);
	  		concatDataEntries = concatDataEntries.concat(convertedData);
	  	}
	    data = concatDataEntries;

	    // Group Data by key "group"
		var nest = d3.nest()
			.key(function(d) { return d.group; });
	    var nested = nest.entries(data);

	    // Create function to stack the grouped (nested) data
		var stack = d3.layout.stack()
			.offset("wiggle")
			.values(function(d) { 

				return d.values; })
			.x(function(d) { return d.date; })
			.y(function(d) { return d.value; });

	    var layers = stack(nested);

	    // Define height for each layered visualisation
	    instanceMemory.chartDimensions.lineheight = (instanceMemory.chartDimensions.height) / nested.length;

	    // Defome scales (stacked and multiple)
	    var xScale = d3.time.scale().rangeRound([0, instanceMemory.chartDimensions.width]);
	    var yScaleStacked = d3.scale.linear().range([instanceMemory.chartDimensions.height, 0]);
	    var yScaleMultiples = d3.scale.linear().range([instanceMemory.chartDimensions.height, 0]);

	    xScale.domain(d3.extent(data, function(d) { return d.date; }));
	    yScaleStacked.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
	    yScaleMultiples.domain([0, d3.max(data, function(d) { return d.value; })]).range([instanceMemory.chartDimensions.lineheight, 0]);

	    // Create a group for each path (for each dataline)
	    var group = svg.selectAll(".group")
	        .data(layers)
	      .enter().append("g")
	        .attr("class", "group")
	        .attr("id", function(d){ return d.key + "StreamG"})
	        .attr('transform', function(d, i){ return "translate(0," + (instanceMemory.chartDimensions.height - (i+1) * instanceMemory.chartDimensions.lineheight+10) +")"; });

	    // Append each group a label to describe the path (dataline)
	    group.append("text")
	        .attr("class", "group-label")
	        .attr("x", -150)
	        .attr('transform', function(d, i){ return "translate(-8," + (instanceMemory.chartDimensions.lineheight - 6) +")"; })
	        .text(function(d) { return d.key; });

	    // Create function for calculate the x, y (stacked) and y0 (multiple) values for the path
	     var areaMultiples = d3.svg.area()
			.interpolate("cardinal")
			.x(function(d) { return xScale(d.date); })
			.y0(function(d) { return instanceMemory.chartDimensions.lineheight; })
			.y1(function(d) { return yScaleMultiples(d.value); });

	    // Append path with calculated x and y values
	    group.append("path")
	        .attr("d", function(d) { return areaMultiples(d.values); })
	        .attr("class", function(d, i) { 
	        	return "layer Line" + (nested.length-(i+1));
	        });

		// Create x axis
		var formatYear = d3.format("02d");
		var formatDate = function(d) { return formatYear(d.getFullYear()); };
		var xAxis = d3.svg.axis()
			.scale(xScale)
			.ticks(5)
			.orient("bottom")
			.tickFormat(formatDate);

		// Append an x axis for the date range
	    svg.append("g")
	        .attr("class", "x axis")
	        .attr("transform", "translate(0," + (instanceMemory.chartDimensions.height + 15) + ")")
	        .call(xAxis);

	    d3.select("#" + CSSsiteId + " g.x.axis")
	    	.append("text")
	    	.text("Jahr")
	    	.attr('transform', "translate(" + (instanceMemory.chartDimensions.width/2-10) + ",30)");

	    svg.append("text")
	    	.text(instanceMemory.yAxisLabel)
	    	.attr('transform', "rotate (90,0,0) translate(20,-" + (instanceMemory.chartDimensions.width+5) + ")");

		// Toggle viewtype
		d3.selectAll('#streamgraphVisualization')
			.on('click', function() {
				console.log(instanceMemory.activeViewStyle);
		      if (instanceMemory.activeViewStyle == instanceMemory.viewStyleEnum.stacked){
		      	transitionMultiples();
		      }else{
		      	transitionStacked();
		      }
		      instanceMemory.activeViewStyle = (instanceMemory.activeViewStyle+1)%2;
		    }
		);

	    // Change view to multiple
	    function transitionMultiples() {
	      var t = svg.transition().duration(750),
	          g = t.selectAll(".group").attr('transform', function(d, i){ return "translate(0," + (instanceMemory.chartDimensions.height - (i+1) * instanceMemory.chartDimensions.lineheight+10) +")"; });
	      g.selectAll(".layer").attr("d", function(d) { return areaMultiples(d.values); });
	      g.select(".group-label").attr('transform', function(d, i){ return "translate(-8," + (instanceMemory.chartDimensions.lineheight - 6) +")"; });
	    }

		// Recalculate values to stacked view
		var areaStacked = d3.svg.area()
			.interpolate("cardinal")
			.x(function(d) { return xScale(d.date); })
			.y0(function(d) { return yScaleStacked(d.y0); })
			.y1(function(d) { return yScaleStacked(d.y0 + d.y); });

		// Change view to stacked
	    function transitionStacked() {
	      var t = svg.transition().duration(750),
	          g = t.selectAll(".group").attr('transform', function(){ return "translate(0,0)"; });
	      g.selectAll(".layer").attr("d", function(d) { return areaStacked(d.values); });
	      g.select(".group-label").attr('transform', function(d, i){ return "translate(-8," + (yScaleStacked(d.values[0].y0)-6) +")"; });
	    }

	}

}