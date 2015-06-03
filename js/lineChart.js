function lineChart(CSSsiteId, options){
  var instance = this;

  // Merge options with default options
  var settings = $.extend({
    containerDimensionWidth: 900,
    containerDimensionHeight: 400,
    marginTop: 25,
    marginRight: 110,
    marginBottom: 30,
    marginLeft: 60,
    markers: false,
    drawSecYAxis: false,
    drawMarkers: false,
    pathOnMouseHelper: false,
    horizontalMenu: false,
    collectRankingData: false
  }, options||{});
  
  var instanceMemory = {
    xAxis: {},
    primYAxis: {},
    secYAxis: {},
    chartDimensions: {
      height: settings.containerDimensionHeight - settings.marginTop - settings.marginBottom,
      width: settings.containerDimensionWidth - settings.marginLeft - settings.marginRight
    },
    primYAxisLabel: {},
    secYAxisLabel: {},
    secYAxisData: [],
    primYAxisData: [],
    valueSecYAxis: {},
    xAxisUTCExtent: [],
    menuData: [],
    headersArray: [],
    valueScalePrimAxis: {},
    valueScaleSecAxis: {},
    timeScale: {},
    convertedTimeLineData: {},
    selectedStartYear: {},
    selectedEndYear: {},
    dataLines: {},
    svgGroup: {},
    primYAxisLabelText: '',
    secYAxisLabelText: '',
    tooltip: {},
    specialDrawStylesForPaths: {},
    markerData: [],
    selectableDates: [],
    pathOnMouseSelection: {},
    rankingData: []
  }

  // Initial draw basic axes
  this.drawSVG = function(){
    // Create SVG element
    instanceMemory.svgGroup = d3.select('#' + CSSsiteId + ' .allTimeseries')
      .append('svg')
        .attr("width", settings.containerDimensionWidth)
        .attr("height", settings.containerDimensionHeight)
      .append("g")
        .attr("transform", "translate(" + settings.marginLeft + "," + settings.marginTop + ")")
        .attr("class","chart");
  }

  this.drawXAxis = function(){
    // Positioning the axes and draw them within a svg group
    instanceMemory.xAxis = instanceMemory.svgGroup.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + instanceMemory.chartDimensions.height + ")");

    // Create X-axis description
    instanceMemory.xAxis
      .append('text')
        .attr('transform', "translate(" + (instanceMemory.chartDimensions.width/2 - 35) + ",30)")
        .attr('x', 0)
        .attr('y', 0)
        .text("Jahre");

  }

  this.drawPrimYAxis = function(){
    // Prepare Group for prim Y Axis
    instanceMemory.primYAxis = instanceMemory.svgGroup.append("g")
      .attr("class", "primY axis");

    // Create Y-axis description
    instanceMemory.primYAxisLabel = instanceMemory.primYAxis
      .append('text')
        .attr('transform', "rotate (-270, 0, 0) translate(-65,5)")
        .attr('x', 100)
        .attr('y', 50);
  }

  this.setPrimYAxisLabel = function(label){
    // Set primary Y-axis description
    instanceMemory.primYAxisLabelText = label;
  }

  this.drawSecYAxis = function(){
    // Positioning the axes and draw them within a svg group
    instanceMemory.yAxisSek = instanceMemory.svgGroup.append("g")
      .attr("class", "secY axis")
      .attr('transform', "translate(" + (instanceMemory.chartDimensions.width) + ",0)");
    
    // Create Y-axis description
    instanceMemory.secYAxisLabel = instanceMemory.yAxisSek
      .append('text')
        .attr('transform', "rotate (90, 0, 0) translate(-65,-110)")
        .attr('x', 100)
        .attr('y', 50);

    // Set primary Y-axis description
    instanceMemory.secYAxisLabel.text(instanceMemory.secYAxisLabelText);
  }

  this.setSecYAxisLabel = function(label){
    // Set secondary Y-axis description
    instanceMemory.secYAxisLabelText = label;
  }

  this.setSecYAxisData = function(data){
    // Set data
    instanceMemory.secYAxisData = data;
  }

  this.updateSecYAxis = function(){
    // Get min and max value from axis
    var extent = d3.extent(instanceMemory.secYAxisData, function(d){return +d.value});

    // X- and Y-axis mapper function creation. needed to map values from tsv to pixels
    instanceMemory.valueScaleSecAxis = d3.scale.linear()
      .range([instanceMemory.chartDimensions.height, 0])
      .domain(extent);

    // Create axis
    var valueSecYAxis = d3.svg.axis()
      .scale(instanceMemory.valueScaleSecAxis)
      .orient("right");

    // Draw x- and y-axis
    instanceMemory.yAxisSek
      .transition().duration(1500).ease("sin-in-out")
      .call(valueSecYAxis);
  }

  this.setPrimYAxisData = function(data){
    // Set data
    instanceMemory.primYAxisData = data;
  }

  this.updatePrimYAxis = function(){
    // Get min and max value from axis
    var extent = d3.extent(instanceMemory.primYAxisData, function(d){return +d.value});    

    // X- and Y-axis mapper function creation. needed to map values from tsv to pixels
    instanceMemory.valueScalePrimAxis = d3.scale.linear()
      .range([instanceMemory.chartDimensions.height, 0])
      .domain(extent);

    // Create axis
    var valuePrimYAxis = d3.svg.axis()
      .scale(instanceMemory.valueScalePrimAxis)
      .orient("left");

    // Draw x- and y-axis
    instanceMemory.primYAxis
      .transition().duration(1500).ease("sin-in-out")
      .call(valuePrimYAxis);

    // Set primary Y-axis description
    instanceMemory.primYAxisLabel.text(instanceMemory.primYAxisLabelText);
  }

  this.setXAxisUTCExtent = function(extent){
    // Set data
    instanceMemory.xAxisUTCExtent = extent;
  }

  this.updateXAxis = function(updateIntervall){
    if(typeof updateIntervall == 'undefined')updateIntervall=1500;

    // X- and Y-axis mapper function creation. needed to map values from tsv to pixels
    instanceMemory.timeScale = d3.time.scale()
      .range([0, instanceMemory.chartDimensions.width])
      .domain(instanceMemory.xAxisUTCExtent);

    // Create X- and Y-axis
    var time_axis = d3.svg.axis()
      .scale(instanceMemory.timeScale);

    // Draw x- and y-axis
    instanceMemory.xAxis
      .transition().duration(updateIntervall).ease("sin-in-out")
      .call(time_axis);
  }

  this.makePathHelperInvisible = function(){
      // Resize it to 0
      instanceMemory.pathOnMouseSelection
        .attr('d', 'M' + 0 + ',' + 0 + 'L' + 0 + ',' + 0);
  }

  this.createPathOnMouseHelper = function(){
    // Create invisible path
    instanceMemory.pathOnMouseSelection = instanceMemory.svgGroup.append('path')
      .attr('d', 'M' + 0 + ',' + 0 + 'L' + 0 + ',' + 0)
      .style('stroke', 'black');

    // Add eventlistener
    d3.select('#' + CSSsiteId + ' .allTimeseries')
      .on('mousemove', function(d){
        // Set mouse pointer
        var x = d3.mouse(this)[0];
        
        // Get UTC Time
        if((x - settings.marginLeft) >= 0){
          var x0 = instanceMemory.timeScale.invert(x - settings.marginLeft);
          
          // Get closest UTC time in array
          var foundUTCDate = instance.closest(instanceMemory.selectableDates, x0.getTime());

          instanceMemory.tooltip
            .html('X: ' + 1 + "<br>Y: " + 1 )
            .style("left", 100 + "px")
            .style("top", 100 + "px")
            .style("opacity", 1);

          // Update path according to found UTC time
          instanceMemory.pathOnMouseSelection
            .attr('d', 'M' + (instanceMemory.timeScale(foundUTCDate)) + ',' + 0 + 'L' + (instanceMemory.timeScale(foundUTCDate)) + ',' + instanceMemory.chartDimensions.height);
        }else{
          // Update path according to found UTC time
          instanceMemory.pathOnMouseSelection
            .attr('d', 'M' + 0 + ',' + 0 + 'L' + 0 + ',' + 0);
        }
      })
  }

  this.setMenuData = function(data){
    // Set data
    instanceMemory.menuData = data;
  }

  this.setDataHeaderName = function(name){
    // Set Data
    instanceMemory.dataHeaderName = name;
  }

  this.setHeadersArrayForSecondaryAxis = function(headersArray){
    // Set Data
    instanceMemory.headersArray = headersArray;
  }

  this.updateMenu = function(){
      // Draw right menu
      $('#' + CSSsiteId + ' .key').empty();
      var key_items = d3.select('#' + CSSsiteId + ' .key')
        .selectAll('div')
        .data(instanceMemory.menuData)
        .enter()
        .append('div')
          .attr('class','key_line_' + CSSsiteId)
          .attr('id',function(d){
            return d[instanceMemory.dataHeaderName]+"_key"});

      (settings.horizontalMenu ? key_items.style('float', 'left') : false)

      // Draw the square and the label in the right menu
      // Information: arguments[i] contains the index an individual data row of the tsv file
      key_items.append('div')
        .attr('id', function(d){return 'key_square_' + d[instanceMemory.dataHeaderName] + '_' + CSSsiteId})
        .attr('class', function(d){return 'key_square Line' + arguments[1]})

      key_items.append('div')
        .attr('class','key_label')
        .html(function(d){
          if(settings.drawSecYAxis){
            if($.inArray(d[instanceMemory.dataHeaderName], instanceMemory.headersArray) === -1){
              return '  ' + d[instanceMemory.dataHeaderName].replace(/_/g, ' ') + ' <b>(Primärachse)</b>  ';
            }else{
              return '  ' + d[instanceMemory.dataHeaderName].replace(/_/g, ' ') + ' <b>(Sekundärachse)</b>  ';
            }
          }else{
            return '  ' + d[instanceMemory.dataHeaderName].replace(/_/g, ' ') + '  ';
          }
        });

      // Add click event to each item in the right menu
      d3.selectAll('#' + CSSsiteId + ' .key_line_' + CSSsiteId)
        .on('click', this.drawTimeseries);
  }

  this.setSelectedYears = function(selectedStartYear, selectedEndYear){
    instanceMemory.selectedStartYear = selectedStartYear;
    instanceMemory.selectedEndYear = selectedEndYear;
  }

  this.setConvertedTimeLineData = function(data){
    instanceMemory.convertedTimeLineData = data;
  }

  this.setSpecialDrawStyleForPath = function(lineID, styleObject){
    instanceMemory.specialDrawStylesForPaths[lineID] = styleObject;
  }
    
  // Draw line if onclick event occurred on an keyline in the right menu
  this.drawTimeseries = function(d, i){
      var id = d[instanceMemory.dataHeaderName];
      var setValueScale
      if(settings.drawSecYAxis){
        setValueScale = (($.inArray(d[instanceMemory.dataHeaderName], instanceMemory.headersArray) !== -1) ? instanceMemory.valueScaleSecAxis : instanceMemory.valueScalePrimAxis);
      }else{
        setValueScale = instanceMemory.valueScalePrimAxis;
      }

      // Set Data
      var data = instanceMemory.convertedTimeLineData[id];
      data = data.filter(function(el) {return instanceMemory.selectedStartYear <= el.keyUTC && el.keyUTC <= instanceMemory.selectedEndYear;});

      // Select the svg group of the line
      var ts = d3.select('#' + CSSsiteId + ' .'+id+'Line');

      // If selection is empty: new line will be drawed
      // If selection is full: line will be removed
      if (ts.empty()){
        // Draw Markers
        if(d3.selectAll('#' + CSSsiteId + ' .marker').empty() && settings.drawMarkers){
            var markerData = instanceMemory.markerData.filter(function(el) {return instanceMemory.selectedStartYear <= el.dateUTC && el.dateUTC <= instanceMemory.selectedEndYear;});
            for(var i = 0;i<markerData.length;i++){
                instance.addMarker(markerData[i]);
            }
        }

        // Create Line
        var line = d3.svg.line()
          .x(function(d){return instanceMemory.timeScale(d.keyUTC)})
          .y(function(d){return setValueScale(d.value)})
          .interpolate("linear")

        // Draw the Line and append it as a svg group
        var timelineId = document.getElementById('key_square_'+id + '_' + CSSsiteId).getAttribute('class').split(" ")[1];
        var g = d3.select('#' + CSSsiteId + ' .chart')
          .append('g')
          .attr('class', 'timeseries ' + timelineId + ' '+id+'Line')

        instanceMemory.dataLines[id] = g.append('path')
          .attr('d', line(data))

        // Apply special drawstyle
        if(instanceMemory.specialDrawStylesForPaths[id] !== 'undefined')instanceMemory.dataLines[id].style(instanceMemory.specialDrawStylesForPaths[id]);

        // Draw circles (primary axis) / rectangles (secondary axis)
        if(settings.drawSecYAxis){
          if($.inArray(d[instanceMemory.dataHeaderName], instanceMemory.headersArray) !== -1){
            g.selectAll('#' + CSSsiteId + ' rect')
              .data(data)
              .enter()
              .append("rect")
                .attr('x', function(d) {return instanceMemory.timeScale(d.keyUTC) - 4})
                .attr('y', function(d) {return setValueScale(d.value) - 4})
              .attr('width',0)
              .attr('height',0)
              .attr('class', id)
              .style('visibility', function(d){
                var cx = instanceMemory.timeScale(d.keyUTC);
                return ((cx>-0.1)&&(cx<=instanceMemory.chartDimensions.width)?'visible':'hidden');
              });

            // Enter animation of each timeline symbol as an delayed drawing
            var enter_duration = 1500;
              g.selectAll('#' + CSSsiteId + ' rect')
                .transition()
                .delay(function(d, i) { return i / data.length * enter_duration; })
                .attr('width', 8)
                .attr('height', 8);

            // Mouseover Animation of each timeline symbol
            g.selectAll('#' + CSSsiteId + ' rect')
              .on('mouseover', function(d){
                d3.select(this)
                  .transition()
                  .attr('width', 16)
                  .attr('height', 16);
                instanceMemory.tooltip.transition()
                  .duration(1000)
                  .style("opacity", 1);
              })
              .on('mouseout', function(d,i){
                d3.select(this).transition()
                .attr('width', 8)
                .attr('height', 8);
                instanceMemory.tooltip
                  .transition().duration(500)
                  .style("opacity", 0);
              })
              .on('mousemove', function(d){
                instanceMemory.tooltip
                  .html('X: ' + d.key + "<br>Y: " + d.value)
                  .style("left", (d3.event.pageX - 47) + "px")
                  .style("top", (d3.event.pageY - 52) + "px");
              });
          }else{
            g.selectAll('#' + CSSsiteId + ' circle')
              .data(data)
              .enter()
              .append("circle")
                .attr('cx', function(d) {return instanceMemory.timeScale(d.keyUTC)})
                .attr('cy', function(d) {return setValueScale(d.value)})
              .attr('r',0)
              .attr('class', id)
              .style('visibility', function(d){
                var cx = instanceMemory.timeScale(d.keyUTC);
                return ((cx>-0.1)&&(cx<=instanceMemory.chartDimensions.width)?'visible':'hidden');
              });

            // Enter animation of each timeline symbol as an delayed drawing
            var enter_duration = 1500;
              g.selectAll('#' + CSSsiteId + ' circle')
                .transition()
                .delay(function(d, i) { return i / data.length * enter_duration; })
                .attr('r', 4)

            // Mouseover Animation of each timeline symbol
            g.selectAll('#' + CSSsiteId + ' circle')
              .on('mouseover', function(d){
                d3.select(this)
                  .transition().attr('r', 9);
                instanceMemory.tooltip.transition()
                  .duration(1000)
                  .style("opacity", 1);
              })
              .on('mouseout', function(d,i){
                d3.select(this).transition().attr('r', 4);
                instanceMemory.tooltip
                  .transition().duration(500)
                  .style("opacity", 0);
              })
              .on('mousemove', function(d){
                instanceMemory.tooltip
                  .html('X: ' + d.key + "<br>Y: " + d.value)
                  .style("left", (d3.event.pageX - 47) + "px")
                  .style("top", (d3.event.pageY - 52) + "px");
              });
          }
        }else{
          g.selectAll('#' + CSSsiteId + ' circle')
            .data(data)
            .enter()
            .append("circle")
              .attr('cx', function(d) {return instanceMemory.timeScale(d.keyUTC)})
              .attr('cy', function(d) {return setValueScale(d.value)})
            .attr('r',0)
            .attr('class', id)
            .style('visibility', function(d){
              var cx = instanceMemory.timeScale(d.keyUTC);
              return ((cx>-0.1)&&(cx<=instanceMemory.chartDimensions.width)?'visible':'hidden');
            });

          // Enter animation of each timeline symbol as an delayed drawing
          var enter_duration = 1500;
            g.selectAll('#' + CSSsiteId + ' circle')
              .transition()
              .delay(function(d, i) { return i / data.length * enter_duration; })
              .attr('r', 4)

          // Mouseover Animation of each timeline symbol
          g.selectAll('#' + CSSsiteId + ' circle')
            .on('mouseover', function(d){
              d3.select(this)
                .transition().attr('r', 9);
              instanceMemory.tooltip.transition()
                .duration(1000)
                .style("opacity", 1);
            })
            .on('mouseout', function(d,i){
              d3.select(this).transition().attr('r', 4);
              instanceMemory.tooltip
                .transition().duration(500)
                .style("opacity", 0);
            })
            .on('mousemove', function(d){
              instanceMemory.tooltip
                .html('X: ' + d.key + "<br>Y: " + d.value)
                .style("left", (d3.event.pageX - 47) + "px")
                .style("top", (d3.event.pageY - 52) + "px");
            });
        }
      } else {
        ts.remove();
        delete instanceMemory.dataLines[id];
        if(d3.selectAll('#' + CSSsiteId + ' .timeseries').empty()){
          d3.selectAll('#' + CSSsiteId + ' .marker').remove();
        }
      }
  }  

  this.getRankingData = function(){
    return instanceMemory.rankingData.sort(compareRankingData);
  }

  this.updateTimeSeries = function(options){
    
    if(typeof options == 'undefined')options={};

    var updateSettings = $.extend({
      onlyDrawPath: false,
      updateIntervall: 1500
    }, options||{});

    var data;
    var setValueScale;
    var line2;

    // Draw Markers
    if(!d3.selectAll('#' + CSSsiteId + ' .timeseries').empty() && settings.drawMarkers){
        d3.selectAll('#' + CSSsiteId + ' .marker').remove();
        if(!updateSettings.onlyDrawPath){
          var markerData = instanceMemory.markerData.filter(function(el) {return instanceMemory.selectedStartYear <= el.dateUTC && el.dateUTC <= instanceMemory.selectedEndYear;});
          for(var i = 0;i<markerData.length;i++){
              instance.addMarker(markerData[i]);
          }
        }
    }

    // Update Paths
    $.each(instanceMemory.dataLines, function(i, v){
        
      var setValueScale
      if(settings.drawSecYAxis){
        setValueScale = ($.inArray(i, instanceMemory.headersArray) !== -1 ? instanceMemory.valueScaleSecAxis : instanceMemory.valueScalePrimAxis);
      }else{
        setValueScale = instanceMemory.valueScalePrimAxis;
      }

      // Set Data
      var data = instanceMemory.convertedTimeLineData[i];
      data = data.filter(function(el) {return instanceMemory.selectedStartYear <= el.keyUTC && el.keyUTC <= instanceMemory.selectedEndYear;});

      // if rankingData is desired, get data
      
      if(settings.collectRankingData){
        // check if timeline already exists
        var result = $.grep(instanceMemory.rankingData, function(e){ return e.key == i; });
        var maxValueOfId = d3.max(data, function(d){return +d.value;});
        maxValueOfId = (maxValueOfId?maxValueOfId:0);
        if(result.length == 0){
          instanceMemory.rankingData.push({'key': i, 'value': maxValueOfId});
        }else{
          result[0].value = maxValueOfId;
        }
      }

      // Create Line
      var line2 = d3.svg.line()
        .x(function(d){return instanceMemory.timeScale(d.keyUTC)})
        .y(function(d){return setValueScale(d.value)})
        .interpolate("linear");

      // Set data
      data = instanceMemory.convertedTimeLineData[i];
      data = data.filter(function(el) {return instanceMemory.selectedStartYear <= el.keyUTC && el.keyUTC <= instanceMemory.selectedEndYear;});
      
      var g = d3.select('#' + CSSsiteId + ' g.' + i + 'Line');

      g.selectAll('#' + CSSsiteId + ' circle.' + i)
        .attr('r', 0);

      g.selectAll('#' + CSSsiteId + ' rect.' + i)
        .attr('width', 0)
        .attr('height', 0);

      g.selectAll('#' + CSSsiteId + ' circle.' + i)
        .attr('cx', function(d) {return instanceMemory.timeScale(d.keyUTC);})
        .attr('cy', function(d) {return setValueScale(d.value)})
        .style('visibility', function(d){
          var cx = instanceMemory.timeScale(d.keyUTC);
          return ((cx>-0.1)&&(cx<=instanceMemory.chartDimensions.width && !updateSettings.onlyDrawPath)?'visible':'hidden');
        });

      g.selectAll('#' + CSSsiteId + ' rect.' + i)
        .attr('x', function(d) {return instanceMemory.timeScale(d.keyUTC) - 4;})
        .attr('y', function(d) {return setValueScale(d.value) - 4})
        .style('visibility', function(d){
          var x = instanceMemory.timeScale(d.keyUTC);
          return ((x>-0.1)&&(x<=instanceMemory.chartDimensions.width && !updateSettings.onlyDrawPath)?'visible':'hidden');
        });

      v
      .transition().duration(updateSettings.updateIntervall).ease("sin-in-out")
      .attr("d", line2(data))
      .attr("transform", null)
      .each('end', function(){
        if(!updateSettings.onlyDrawPath){
          // Draw circles
          var enter_duration = 1500;
          g.selectAll('#' + CSSsiteId + ' circle.' + i)
            .transition()
            .delay(function(d, i) { return i / data.length * enter_duration; })
            .attr('r', 5);
          
          // Draw circles
          var enter_duration = 1500;
          g.selectAll('#' + CSSsiteId + ' rect.' + i)
            .transition()
            .delay(function(d, i) { return i / data.length * enter_duration; })
            .attr('width', 8)
            .attr('height', 8);
        }
      });
    });
  }
  
  this.removeAllLines = function(){
    $.each(instanceMemory.dataLines, function(i, v){
      d3.select('#' + CSSsiteId + ' .'+i+'Line').remove();
      delete instanceMemory.dataLines[i];
    });
  }

  // Initial Draw
  this.initialDraw = function(){
    instanceMemory.tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    instance.drawSVG();
    instance.drawXAxis();
    instance.updateXAxis();
    instance.drawPrimYAxis();
    instance.updatePrimYAxis();
    (settings.drawSecYAxis ? instance.drawSecYAxis() : false);
    (settings.drawSecYAxis ? instance.updateSecYAxis() : false);
    (settings.pathOnMouseHelper ? instance.createPathOnMouseHelper() : false);
    instance.updateMenu();
  }

  // YearRangeEvent
  this.updateYearRange = function(options){
    if(typeof options == 'undefined')options={};

    // Merge options with default options
    var updateSettings = $.extend({
      onlyDrawPath: false,
      updateIntervall: 1500
    }, options||{});

    instance.updateXAxis(updateSettings.updateIntervall);
    instance.updateTimeSeries({
                            onlyDrawPath: updateSettings.onlyDrawPath,
                            updateIntervall: updateSettings.updateIntervall
                            });
    (settings.pathOnMouseHelper ? instance.makePathHelperInvisible() : false);
}

  this.setMarkerData = function(data){
    instanceMemory.markerData = data;
  }

  this.addMarker = function(marker) {
    var radius = 17,
        xPos = instanceMemory.timeScale(marker.dateUTC) - radius,
        yPosStart = instanceMemory.chartDimensions.height - radius,
        yPosEnd = radius;

    var markerG = instanceMemory.svgGroup.append('g')
      .attr('class', 'marker cursorHelp')
      .attr('transform', 'translate(' + xPos + ', ' + yPosStart + ')')
      .attr('opacity', 0);

    markerG.transition()
      .duration(3000)
      .attr('transform', 'translate(' + xPos + ', ' + yPosEnd + ')')
      .attr('opacity', 1);

    // Vertical path
    markerG.append('path')
      .attr('d', 'M' + radius + ',' + (instanceMemory.chartDimensions.height-yPosStart) + 'L' + radius + ',' + (instanceMemory.chartDimensions.height-yPosStart))
      .transition()
        .duration(3000)
        .attr('d', 'M' + radius + ',' + (instanceMemory.chartDimensions.height-yPosEnd) + 'L' + radius + ',' + -settings.marginTop);

    // Horizontal path
    markerG.append('path')
      .attr('d', 'M' + radius + ',' + (instanceMemory.chartDimensions.height-yPosStart) + 'L' + radius + ',' + (instanceMemory.chartDimensions.height-yPosStart))
      .transition()
        .duration(3000)
        .attr('d', 'M' + -radius + ',' + radius + 'L' + (3*radius) + ',' + radius);

    markerG.append('circle')
      .attr('class', 'marker-bg')
      .attr('cx', radius)
      .attr('cy', radius)
      .attr('r', radius)
      .on('click', function(){
          window.open(marker.link,'_blank');
      });

    markerG.append('text')
      .attr('x', radius)
      .attr('y', radius*1.2)
      .text('Event')
      .on('click', function(){
          window.open(marker.link,'_blank');
      });
  }

  this.setSelectableDatesUTC = function(data){
    instanceMemory.selectableDates = data;
  }

  // Source: http://stackoverflow.com/questions/8584902/get-closest-number-out-of-array
  this.closest = function(arr, target) {
    var minDelta = null;
    var minIndex = null;
    for (var i = 0 ; i<arr.length; i++){
        var delta = Math.abs(arr[i]-target);
        if (minDelta == null || delta < minDelta){
            minDelta = delta;
            minIndex = i;
        }
        //if it is a tie return an array of both values
        else if (delta == minDelta) {
            return [arr[minIndex],array[i]];
        }//if it has already found the closest value
        else {
            return arr[i-1];
        }

    }
    return arr[minIndex];
  }

  function compareRankingData(a,b){
    if (a.value > b.value)
       return -1;
    if (a.value < b.value)
      return 1;
    return 0;
  }
}