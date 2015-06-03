var viualizationSite5OptionsOpenData = {
    dataFile: 'tsv/site4_openData.tsv',
    loadedMarkerData: [],
    loadedFile: [],
    lineChart: {},
    selectableYears: []
}

function createVisualizationControlsSite5OpenData(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite5_openData').css('margin-bottom', '25px');
    $('#visualizationControlsSite5_openData').append( $('<p>').attr('id', 'displayDateRange') );
    // Container for the visual slider
    $('#visualizationControlsSite5_openData').append( $('<div>').attr('id', 'displayDateRangeSilder').css('margin-left', '5px') );
    // addClass (col-md-3) to limit the width of the slider
    $('#visualizationControlsSite5_openData #displayDateRangeSilder').slider({
            min: 0,
            max: (viualizationSite5OptionsOpenData.selectableYears.length-1),
            step: 1,
            values: [ 0, (viualizationSite5OptionsOpenData.selectableYears.length-1) ],
            slide: function( event, ui ) {
                    var min = viualizationSite5OptionsOpenData.selectableYears[ui.values[0]];
                    var max = viualizationSite5OptionsOpenData.selectableYears[ui.values[1]];

                    var firstYear = Date.UTC(min,0,1,0,0,0,0);
                    var lastYear = Date.UTC(max,0,1,0,0,0,0);

                    viualizationSite5OptionsOpenData.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
                    viualizationSite5OptionsOpenData.lineChart.setSelectedYears(firstYear, lastYear);
                    $('#visualizationControlsSite5_openData #displayDateRange').text('Zeitraum: ' + min + '-' + max);
                    viualizationSite5OptionsOpenData.lineChart.updateYearRange();
                }
        }).addClass('col-md-3');
    // Set initial selected year range
    viualizationSite5OptionsOpenData.selectedStartYear = viualizationSite5OptionsOpenData.selectableYears[0];
    viualizationSite5OptionsOpenData.selectedEndYear = viualizationSite5OptionsOpenData.selectableYears[(viualizationSite5OptionsOpenData.selectableYears.length-1)];
    $('#visualizationControlsSite5_openData #displayDateRange').text('Zeitraum: ' + viualizationSite5OptionsOpenData.selectedStartYear + '-' + viualizationSite5OptionsOpenData.selectedEndYear);

    // Prepare containers for the chart and the menu on the right side
    d3.select("#visualizationSite5_openData")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#visualizationSite5_openData")
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

function dataProcessingSite5OpenData(){
    // Set MenuData (loaded File)
    viualizationSite5OptionsOpenData.lineChart.setMenuData(viualizationSite5OptionsOpenData.loadedFile);

    // Set dataheadername
    if(navigator.userAgent.toLowerCase().indexOf('chrome') > -1){
        viualizationSite5OptionsOpenData.lineChart.setDataHeaderName(d3.entries(viualizationSite5OptionsOpenData.loadedFile[0])[d3.entries(viualizationSite5OptionsOpenData.loadedFile[0]).length-1].key);
    }else if((navigator.userAgent.toLowerCase().indexOf('safari') > -1) || (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)){
        viualizationSite5OptionsOpenData.lineChart.setDataHeaderName(d3.entries(viualizationSite5OptionsOpenData.loadedFile[0])[0].key);
    }else{
        viualizationSite5OptionsOpenData.lineChart.setDataHeaderName(d3.entries(viualizationSite5OptionsOpenData.loadedFile[0])[d3.entries(viualizationSite5OptionsOpenData.loadedFile[0]).length-1].key);
    }

    // Convert Data to match Micha's golden Rule (Do not store data in the keys of a JSON blob.)
    var tempConvertedData;
    var convertedLoadedFile = [];
    for(var k = 0;k<viualizationSite5OptionsOpenData.loadedFile.length;k++){
        tempConvertedData = d3.entries(viualizationSite5OptionsOpenData.loadedFile[k])
        // Remove non-numeric data values
        tempConvertedData = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
        convertedLoadedFile = convertedLoadedFile.concat(tempConvertedData);
    }

    // Convert timelinedata
    var tempTimeLineName;
    var convertedTimeLineData = {};
    for(var k = 0; k<viualizationSite5OptionsOpenData.loadedFile.length; k++){
        if(navigator.userAgent.toLowerCase().indexOf('chrome') > -1){
            tempTimeLineName = d3.entries(viualizationSite5OptionsOpenData.loadedFile[k])[d3.entries(viualizationSite5OptionsOpenData.loadedFile[k]).length-1].value;
        }else if((navigator.userAgent.toLowerCase().indexOf('safari') > -1) || (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)){
            tempTimeLineName = d3.entries(viualizationSite5OptionsOpenData.loadedFile[k])[0].value;
        }else{
            tempTimeLineName = d3.entries(viualizationSite5OptionsOpenData.loadedFile[k])[d3.entries(viualizationSite5OptionsOpenData.loadedFile[k]).length-1].value;
        }
        tempConvertedData = d3.entries(viualizationSite5OptionsOpenData.loadedFile[k]);
        // Remove non-numeric data values
        convertedTimeLineData[tempTimeLineName] = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
    }

    // Set timelineData
    viualizationSite5OptionsOpenData.lineChart.setConvertedTimeLineData(convertedTimeLineData);

    // Add Y data
    viualizationSite5OptionsOpenData.lineChart.setPrimYAxisData(convertedLoadedFile);

    // viualizationSite5OptionsOpenData.lineChart.setSecYAxisData();
    viualizationSite5OptionsOpenData.lineChart.setPrimYAxisLabel('Sterbefälle der Todesursache Grippe');


    // Precalculate UTC Time for performance reasons
    $.each(convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            v[i].keyUTC = (new Date()).setUTCFullYear(v[i].key);
        }
    });

    // Get selectable years for dateRangeSlider
    viualizationSite5OptionsOpenData.selectableYears = [];

    for(var i = 0;i<convertedLoadedFile.length;i++){
        if($.inArray(convertedLoadedFile[i].key, viualizationSite5OptionsOpenData.selectableYears) === -1) viualizationSite5OptionsOpenData.selectableYears.push(+convertedLoadedFile[i].key);
    }

    viualizationSite5OptionsOpenData.selectableYears.sort();

    var firstYear = Date.UTC(viualizationSite5OptionsOpenData.selectableYears[0],0,1,0,0,0,0);
    var lastYear = Date.UTC(viualizationSite5OptionsOpenData.selectableYears[viualizationSite5OptionsOpenData.selectableYears.length-1],0,1,0,0,0,0);

    viualizationSite5OptionsOpenData.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite5OptionsOpenData.lineChart.setSelectedYears(firstYear, lastYear);

    // Process markers
    for(var i = 0;i<viualizationSite5OptionsOpenData.loadedMarkerData.length;i++){
        viualizationSite5OptionsOpenData.loadedMarkerData[i].dateUTC = convertStringDateToJSUTCSite5OpenData(viualizationSite5OptionsOpenData.loadedMarkerData[i].date);
    }
    viualizationSite5OptionsOpenData.lineChart.setMarkerData(viualizationSite5OptionsOpenData.loadedMarkerData);
}

function convertStringDateToJSUTCSite5OpenData(stringDate) {
    return Date.UTC(stringDate.substring(0,4), (stringDate.substring(5,7)-1), stringDate.substring(8,10));
}

function loadDataSite5(){
    d3.json('json/lineChartLiveFluOpenData.json', function(data){
        viualizationSite5OptionsOpenData.loadedMarkerData = data;
    });
    
    d3.tsv(viualizationSite5OptionsOpenData.dataFile, function(data){
        viualizationSite5OptionsOpenData.loadedFile = data;
        viualizationSite5OptionsOpenData.lineChart = new lineChart('site5_openData', {
                containerDimensionWidth: 650,
                containerDimensionHeight: 250,
                horizontalMenu: true,
                drawMarkers: true
            });
        dataProcessingSite5OpenData();
        createVisualizationControlsSite5OpenData();
        viualizationSite5OptionsOpenData.lineChart.initialDraw();
        jQuery('#visualizationSite5_openData div.key div').each(function(){$(this).simulateClick('click');});
    });
}

$('#visualizationSite5_openData').ready(function(){
     loadDataSite5();
});