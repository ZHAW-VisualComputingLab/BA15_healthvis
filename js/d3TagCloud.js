/* Source: https://github.com/jasondavies/d3-cloud/blob/master/examples/simple.html */
function d3TagClound(CSSContainerID, dataArray, options){
	if(typeof options == 'undefined')options={};

	// Merge options with default options
	var settings = $.extend({
		containerDimensionWidth: 350,
		containerDimensionHeight: 300,
	}, options||{});

	var instanceMemory = {
		svg: {},
		CSSContainerID: CSSContainerID,
		dataArray: dataArray
	}

  var fill = d3.scale.category20();

	this.drawTagCould = function(){  
	  d3.layout.cloud().size([settings.containerDimensionWidth, settings.containerDimensionHeight])
	      .words(instanceMemory.dataArray.map(function(d) {
	        return {text: d, size: 10 + Math.random() * 10};
	      }))
	      .padding(1)
	      .rotate(function() { return ~~(Math.random() * 2) * 90; })
	      .font("Impact")
	      .fontSize(function(d) { return d.size; })
	      .on("end", draw)
	      .start();
	}

  function draw(words) {
	instanceMemory.svg = d3.select("#" + instanceMemory.CSSContainerID).append("svg");

    instanceMemory.svg
        .attr("width", settings.containerDimensionWidth)
        .attr("height", settings.containerDimensionHeight)
      .append("g")
        .attr("transform", "translate(150,150)")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
  }



}