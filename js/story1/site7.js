var viualizationSite7Options = {
    dataFile: 'tsv/Mortalitaet/site7.tsv',
    loadedFile: [],
    lineChart: {},
    selectableYears: []
}

function createVisualizationControlsSite7(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite7').css('margin-bottom', '25px');
    $('#visualizationControlsSite7').append( $('<p>').attr('id', 'displayDateRange') );
    // Container for the visual slider
    $('#visualizationControlsSite7').append( $('<div>').attr('id', 'displayDateRangeSilder').css('margin-left', '5px') );
    // addClass (col-md-3) to limit the width of the slider
    $('#visualizationControlsSite7 #displayDateRangeSilder').slider({
            min: 0,
            max: (viualizationSite7Options.selectableYears.length-1),
            step: 1,
            values: [ 0, (viualizationSite7Options.selectableYears.length-1) ],
            slide: function( event, ui ) {
                    var min = viualizationSite7Options.selectableYears[ui.values[0]];
                    var max = viualizationSite7Options.selectableYears[ui.values[1]];


                    viualizationSite7Options.lineChart.setXAxisUTCExtent([min, max]);
                    viualizationSite7Options.lineChart.setSelectedYears(min, max);
                    $('#visualizationControlsSite7 #displayDateRange').text('Zeitraum: ' + convertUTCDateToYear(min) + '-' + convertUTCDateToYear(max));
                    viualizationSite7Options.lineChart.updateYearRange();
                }
        }).addClass('col-md-3');
    // Set initial selected year range
    viualizationSite7Options.selectedStartYear = viualizationSite7Options.selectableYears[0];
    viualizationSite7Options.selectedEndYear = viualizationSite7Options.selectableYears[(viualizationSite7Options.selectableYears.length-1)];
    $('#visualizationControlsSite7 #displayDateRange').text('Zeitraum: ' + convertUTCDateToYear(viualizationSite7Options.selectedStartYear) + '-' + convertUTCDateToYear(viualizationSite7Options.selectedEndYear));

    // Prepare containers for the chart and the menu on the right side
    d3.select("#visualizationSite7")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#visualizationSite7")
        .append('div')
            .attr('class', 'key');
}

//Needed for safari compatibility
//Source:https://stackoverflow.com/questions/20928915/jquery-triggerclick-not-working
jQuery.fn.simulateClick = function() {
    return this.each(function() {
        if('createEvent' in document) {
            var doc = this.ownerDocument,
                evt = doc.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, doc.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            this.dispatchEvent(evt);
        } else {
            this.click(); // IE Boss!
        }
    });
}

function dataProcessingSite7(){
    // Set MenuData (loaded File)
    viualizationSite7Options.lineChart.setMenuData(viualizationSite7Options.loadedFile);

    // Set dataheadername
    viualizationSite7Options.lineChart.setDataHeaderName(d3.entries(viualizationSite7Options.loadedFile[0]).sort(sortYearsAscNameFirst)[0].key);

    // Convert Data to match Micha's golden Rule (Do not store data in the keys of a JSON blob.)
    var tempConvertedData;
    var convertedLoadedFile = [];
    for(var k = 0;k<viualizationSite7Options.loadedFile.length;k++){
        tempConvertedData = d3.entries(viualizationSite7Options.loadedFile[k])
        // Remove non-numeric data values
        tempConvertedData = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
        convertedLoadedFile = convertedLoadedFile.concat(tempConvertedData);
    }

    // Convert timelinedata
    var tempTimeLineName;
    var convertedTimeLineData = {};
    for(var k = 0; k<viualizationSite7Options.loadedFile.length; k++){
        tempTimeLineName = d3.entries(viualizationSite7Options.loadedFile[k]).sort(sortYearsAscNameFirst)[0].value;
        tempConvertedData = d3.entries(viualizationSite7Options.loadedFile[k]);

        // Remove non-numeric data values
        convertedTimeLineData[tempTimeLineName] = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
    }

    // Set timelineData
    viualizationSite7Options.lineChart.setConvertedTimeLineData(convertedTimeLineData);

    // Set data for Y axes
    var yaxisDataPrim = [];
    var yaxisDataSek = [];
    $.each(convertedTimeLineData, function(i, v){
        if(i == 'Säuglingssterblichkeit'){
            yaxisDataSek = yaxisDataSek.concat(v);
        }else{
            yaxisDataPrim = yaxisDataPrim.concat(v);
        }
    });

    // Add Y data
    viualizationSite7Options.lineChart.setPrimYAxisData(yaxisDataPrim);
    viualizationSite7Options.lineChart.setSecYAxisData(yaxisDataSek);

    // viualizationSite7Options.lineChart.setSecYAxisData();
    viualizationSite7Options.lineChart.setSecYAxisLabel('Fälle je 1000 Lebendgeborene');
    viualizationSite7Options.lineChart.setPrimYAxisLabel('Mortalität pro 100 000 Einwohner');


    // Precalculate UTC Time for performance reasons
    $.each(convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            v[i].keyUTC = Date.UTC(v[i].key,0,1,0,0,0,0);
        }
    });

    // Get selectable years for dateRangeSlider
    viualizationSite7Options.selectableYears = [];

    for(var i = 0;i<convertedLoadedFile.length;i++){
        if($.inArray(Date.UTC(convertedLoadedFile[i].key,0,1,0,0,0,0), viualizationSite7Options.selectableYears) === -1){viualizationSite7Options.selectableYears.push(Date.UTC(convertedLoadedFile[i].key,0,1,0,0,0,0))};
    }

    viualizationSite7Options.selectableYears.sort(function(a,b){return a - b;});

    viualizationSite7Options.lineChart.setSelectableDatesUTC(viualizationSite7Options.selectableYears);

    var firstYear = viualizationSite7Options.selectableYears[0];
    var lastYear = viualizationSite7Options.selectableYears[viualizationSite7Options.selectableYears.length-1];

    viualizationSite7Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite7Options.lineChart.setSelectedYears(firstYear, lastYear);
}

function convertUTCDateToYear(UTCDate) {
    var newDate = new Date(UTCDate);
    return '' + newDate.getUTCFullYear();
}

function loadDataSite7(){
    d3.tsv(viualizationSite7Options.dataFile, function(data){
        viualizationSite7Options.loadedFile = data;
        viualizationSite7Options.lineChart = new lineChart('site7', {drawSecYAxis: true, pathOnMouseHelper: false});
        viualizationSite7Options.lineChart.setHeadersArrayForSecondaryAxis(['Säuglingssterblichkeit']);
        dataProcessingSite7();
        createVisualizationControlsSite7();
        viualizationSite7Options.lineChart.initialDraw();
        var streamGraphSite7 = new streamGraph('site7', {
            "containerDimensionWidth": 450,
            "containerDimensionHeight": 300,
            "marginLeft": 160
        });
        streamGraphSite7.setYAxisLabel('Mortalität pro 100 000 Einwohner');
        streamGraphSite7.draw(data);
        $("#streamgraphVisualization").css({
            "position": "absolute",
            "right": 100,
            "border": "solid 1px black"
        });
        jQuery('#site7 div.key_label').each(function(){
                                                $(this).simulateClick('click');
                                            })
    });
}

function sortYearsAscNameFirst(a,b) {
  if((/^\d+$/.test("" + a.key))&&!(/^\d+$/.test("" + b.key)))
    return 1;
  if(!(/^\d+$/.test("" + a.key))&&(/^\d+$/.test("" + b.key)))
    return -1;
  if (+a.key < +b.key)
    return -1;
  if (+a.key > +b.key)
    return 1;
  return 0;
}

$('#visualizationSite7').ready(function(){
     loadDataSite7();
});
