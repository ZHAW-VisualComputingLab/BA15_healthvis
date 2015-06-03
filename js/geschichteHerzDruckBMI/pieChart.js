function pieChartMW(data) {
        var width = 480,
            height = 320,
            radius = Math.min(width, height) / 2;
        var color = d3.scale.ordinal()
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
        var arc = d3.svg.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);
        var pie = d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return d.value;
            });
       
        var svg = d3.select("#SwissMapChartPie").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      
            data.forEach(function (d) {
                d.value = +d.value;    
            });
            var g = svg.selectAll(".arc")
                .data(pie(data))
                .enter().append("g")
                .attr("class", "arc");
            g.append("path")
                .attr("d", arc)
                .style("fill", function (d) {
                    return color(d.data.property);
                });
            g.append("text")
                .attr("transform", function (d) {
                    return "translate(" + arc.centroid(d) + ")";
                })
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .text(function (d) {
                    return d.data.property;
                });
      
}