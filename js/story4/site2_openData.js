var viualizationSite2OptionsOpenData = {
    dataFile: 'tsv/site2_openData.tsv',
    loadedFile: [],
    loadedMarkerData: [],
    lineChart: {},
    selectableYears: [],
    timeIntervall: {},
    selectedEndYear: '',
    autostartVisualizationHapped: false
}

function createVisualizationControlsSite2OpenData(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite2_openData').css('margin-bottom', '25px');
    $('#visualizationControlsSite2_openData').append( $('<p>').attr('id', 'displayDateRange').css('display', 'none') );
    // Container for the visual slider
    $('#visualizationControlsSite2_openData').append( $('<div>').attr('id', 'displayDateRangeSilder').css({'margin-left': '5px', 'display': 'none'}) );
    // addClass (col-md-3) to limit the width of the slider
    $('#visualizationControlsSite2_openData #displayDateRangeSilder').slider({
            min: 0,
            max: (viualizationSite2OptionsOpenData.selectableYears.length-1),
            step: 1,
            values: [ 0, (viualizationSite2OptionsOpenData.selectableYears.length-1) ],
            slide: function( event, ui ) {
                    var min = viualizationSite2OptionsOpenData.selectableYears[ui.values[0]];
                    var max = viualizationSite2OptionsOpenData.selectableYears[ui.values[1]];

                    var firstYear = Date.UTC(min,0,1,0,0,0,0);
                    var lastYear = Date.UTC(max,0,1,0,0,0,0);

                    viualizationSite2OptionsOpenData.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
                    viualizationSite2OptionsOpenData.lineChart.setSelectedYears(firstYear, lastYear);
                    $('#visualizationControlsSite2_openData #displayDateRange').text('Zeitraum: ' + min + '-' + max);
                    viualizationSite2OptionsOpenData.lineChart.updateYearRange();
                }
        }).addClass('col-md-3');
    // Set initial selected year range
    viualizationSite2OptionsOpenData.selectedStartYear = viualizationSite2OptionsOpenData.selectableYears[0];
    viualizationSite2OptionsOpenData.selectedEndYear = viualizationSite2OptionsOpenData.selectableYears[(viualizationSite2OptionsOpenData.selectableYears.length-1)];
    $('#visualizationControlsSite2_openData #displayDateRange').text('Zeitraum: ' + viualizationSite2OptionsOpenData.selectedStartYear + '-' + viualizationSite2OptionsOpenData.selectedEndYear);

    $('#visualizationControlsSite2_openData').append( $( '<button>' )
                                                            .addClass('btn btn-default')
                                                            .attr('id', 'startVisualizationOpenDataButton')
                                                            .text('Start')
                                                            .on('click', startVisualizationSite2Opendata )
                                                     );

    // Prepare containers for the chart and the menu on the right side
    d3.select("#visualizationSite2_openData")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#visualizationSite2_openData")
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

function dataProcessingSite2OpenData(){
    // Set MenuData (loaded File)
    viualizationSite2OptionsOpenData.lineChart.setMenuData(viualizationSite2OptionsOpenData.loadedFile);

    // Set dataheadername
    viualizationSite2OptionsOpenData.lineChart.setDataHeaderName(d3.entries(viualizationSite2OptionsOpenData.loadedFile[0]).sort(sortYearsAscNameFirst)[0].key);

    // Convert Data to match Micha's golden Rule (Do not store data in the keys of a JSON blob.)
    var tempConvertedData;
    var convertedLoadedFile = [];
    for(var k = 0;k<viualizationSite2OptionsOpenData.loadedFile.length;k++){
        tempConvertedData = d3.entries(viualizationSite2OptionsOpenData.loadedFile[k])
        // Remove non-numeric data values
        tempConvertedData = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
        convertedLoadedFile = convertedLoadedFile.concat(tempConvertedData);
    }

    // Convert timelinedata
    var tempTimeLineName;
    var convertedTimeLineData = {};
    for(var k = 0; k<viualizationSite2OptionsOpenData.loadedFile.length; k++){
        tempTimeLineName = d3.entries(viualizationSite2OptionsOpenData.loadedFile[k]).sort(sortYearsAscNameFirst)[0].value;
        tempConvertedData = d3.entries(viualizationSite2OptionsOpenData.loadedFile[k]);
        // Remove non-numeric data values
        convertedTimeLineData[tempTimeLineName] = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
    }

    // Set timelineData
    viualizationSite2OptionsOpenData.lineChart.setConvertedTimeLineData(convertedTimeLineData);

    // Add Y data
    viualizationSite2OptionsOpenData.lineChart.setPrimYAxisData(convertedLoadedFile);

    // viualizationSite2OptionsOpenData.lineChart.setSecYAxisData();
    viualizationSite2OptionsOpenData.lineChart.setPrimYAxisLabel('Sterbefälle der Todesursache Grippe');


    // Precalculate UTC Time for performance reasons
    $.each(convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            v[i].keyUTC = (new Date()).setUTCFullYear(v[i].key);
        }
    });

    // Get selectable years for dateRangeSlider
    viualizationSite2OptionsOpenData.selectableYears = [];

    for(var i = 0;i<convertedLoadedFile.length;i++){
        if($.inArray(+convertedLoadedFile[i].key, viualizationSite2OptionsOpenData.selectableYears) === -1){
          viualizationSite2OptionsOpenData.selectableYears.push(+convertedLoadedFile[i].key);  
        } 
    }

    viualizationSite2OptionsOpenData.selectableYears = $.unique(viualizationSite2OptionsOpenData.selectableYears.sort()).sort(); 

    var firstYear = Date.UTC(viualizationSite2OptionsOpenData.selectableYears[0],0,1,0,0,0,0);
    var lastYear = Date.UTC(viualizationSite2OptionsOpenData.selectableYears[viualizationSite2OptionsOpenData.selectableYears.length-1],0,1,0,0,0,0);

    viualizationSite2OptionsOpenData.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite2OptionsOpenData.lineChart.setSelectedYears(firstYear, lastYear);

    // Process markers
    for(var i = 0;i<viualizationSite2OptionsOpenData.loadedMarkerData.length;i++){
        viualizationSite2OptionsOpenData.loadedMarkerData[i].dateUTC = convertStringDateToJSUTCSite2OpenData(viualizationSite2OptionsOpenData.loadedMarkerData[i].date);
    }
    viualizationSite2OptionsOpenData.lineChart.setMarkerData(viualizationSite2OptionsOpenData.loadedMarkerData);
}

function convertStringDateToJSUTCSite2OpenData(stringDate) {
    return Date.UTC(stringDate.substring(0,4), (stringDate.substring(5,7)-1), stringDate.substring(8,10));
}

function loadDataSite2OpenData(){
    d3.json('json/lineChartLiveFluOpenData.json', function(data){
        viualizationSite2OptionsOpenData.loadedMarkerData = data;
    });
    
    d3.tsv(viualizationSite2OptionsOpenData.dataFile, function(data){
        viualizationSite2OptionsOpenData.loadedFile = data;
        viualizationSite2OptionsOpenData.lineChart = new lineChart('site2_openData', {drawMarkers: true});
        dataProcessingSite2OpenData();
        createVisualizationControlsSite2OpenData();
        viualizationSite2OptionsOpenData.lineChart.initialDraw();
    });
}

function autostartVisualizationSite2(){
    if(!viualizationSite2OptionsOpenData.autostartVisualizationHapped){
        viualizationSite2OptionsOpenData.autostartVisualizationHapped = true;
        startVisualizationSite2Opendata();
    }else{
        if(!$('#site2_openData .timeseries').length){
            var min = viualizationSite2OptionsOpenData.selectableYears[0];
            var max = viualizationSite2OptionsOpenData.selectableYears[viualizationSite2OptionsOpenData.selectableYears.length-1];
            var firstYear = Date.UTC(min,0,1,0,0,0,0);
            var lastYear = Date.UTC(max,0,1,0,0,0,0);
            viualizationSite2OptionsOpenData.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
            viualizationSite2OptionsOpenData.lineChart.setSelectedYears(firstYear, lastYear);
            viualizationSite2OptionsOpenData.lineChart.updateYearRange({onlyDrawPath: true});
            jQuery('#site2_openData div.key div').each(function(){$(this).simulateClick('click');});
        }
    }
}

function stopVisualizationSite2(){
    if (typeof viualizationSite2OptionsOpenData.timeIntervall !== "undefined") {
        window.clearInterval(viualizationSite2OptionsOpenData.timeIntervall);
        d3.selectAll("#site2 .timeseries").remove();
        $('#startVisualizationOpenDataButton').prop('disabled', false);
    }
    delete viualizationSite2OptionsOpenData.timeIntervall;
}

function startVisualizationSite2Opendata(){

    viualizationSite2OptionsOpenData.selectedEndYear = 1;

    var firstYear = Date.UTC('1990',0,1,0,0,0,0);
    var lastYear = Date.UTC('1991',0,1,0,0,0,0);

    viualizationSite2OptionsOpenData.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite2OptionsOpenData.lineChart.setSelectedYears(firstYear, lastYear);
    viualizationSite2OptionsOpenData.lineChart.updateYearRange({onlyDrawPath: true});

    $('#startVisualizationOpenDataButton').prop('disabled', true);

    viualizationSite2OptionsOpenData.timeIntervall = setInterval(function(){
        
        var min = viualizationSite2OptionsOpenData.selectableYears[0];
        var max = viualizationSite2OptionsOpenData.selectableYears[viualizationSite2OptionsOpenData.selectedEndYear];

        var firstYear = Date.UTC(min,0,1,0,0,0,0);
        var lastYear = Date.UTC(max,0,1,0,0,0,0);

        viualizationSite2OptionsOpenData.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
        viualizationSite2OptionsOpenData.lineChart.setSelectedYears(firstYear, lastYear);
        viualizationSite2OptionsOpenData.lineChart.updateYearRange({onlyDrawPath: true});
        
        if(!$('#site2_openData .timeseries').length){
            jQuery('#site2_openData div.key div').each(function(){$(this).simulateClick('click');});
        }

        viualizationSite2OptionsOpenData.selectedEndYear ++;

        if(viualizationSite2OptionsOpenData.selectedEndYear == viualizationSite2OptionsOpenData.selectableYears.length){
            window.clearInterval(viualizationSite2OptionsOpenData.timeIntervall);
            delete viualizationSite2OptionsOpenData.timeIntervall;
            $('#startVisualizationOpenDataButton').prop('disabled', false);
            jQuery('#site2_openData div.key div').each(function(){$(this).simulateClick('click');}).each(function(){$(this).simulateClick('click');});
        }

    }, 1300);

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

$('#visualizationSite2_openData').ready(function(){
     loadDataSite2OpenData();
});