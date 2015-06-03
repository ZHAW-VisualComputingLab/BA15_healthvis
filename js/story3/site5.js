var viualizationSite5Options = {
    dataFile: 'tsv/site3.tsv',
    loadedFile: [],
    lineChart: {},
    loadedMarkerData: [],
    selectableYears: []
}

function createVisualizationControlsSite5(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite5').css('margin-bottom', '25px');
    $('#visualizationControlsSite5').append( $('<p>').attr('id', 'displayDateRange') );
    // Container for the visual slider
    $('#visualizationControlsSite5').append( $('<div>').attr('id', 'displayDateRangeSilder').css('margin-left', '5px') );
    // addClass (col-md-3) to limit the width of the slider
    $('#visualizationControlsSite5 #displayDateRangeSilder').slider({
            min: 0,
            max: (viualizationSite5Options.selectableYears.length-1),
            step: 1,
            values: [ 0, (viualizationSite5Options.selectableYears.length-1) ],
            slide: function( event, ui ) {
                    var min = viualizationSite5Options.selectableYears[ui.values[0]];
                    var max = viualizationSite5Options.selectableYears[ui.values[1]];

                    var firstYear = Date.UTC(min,0,1,0,0,0,0);
                    var lastYear = Date.UTC(max,0,1,0,0,0,0);

                    viualizationSite5Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
                    viualizationSite5Options.lineChart.setSelectedYears(firstYear, lastYear);
                    $('#visualizationControlsSite5 #displayDateRange').text('Zeitraum: ' + min + '-' + max);
                    viualizationSite5Options.lineChart.updateYearRange();
                }
        }).addClass('col-md-3');
    // Set initial selected year range
    viualizationSite5Options.selectedStartYear = viualizationSite5Options.selectableYears[0];
    viualizationSite5Options.selectedEndYear = viualizationSite5Options.selectableYears[(viualizationSite5Options.selectableYears.length-1)];
    $('#visualizationControlsSite5 #displayDateRange').text('Zeitraum: ' + viualizationSite5Options.selectedStartYear + '-' + viualizationSite5Options.selectedEndYear);

    // Prepare containers for the chart and the menu on the right side
    d3.select("#visualizationSite5")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#visualizationSite5")
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

function dataProcessingSite5(){
    // Set MenuData (loaded File)
    viualizationSite5Options.lineChart.setMenuData(viualizationSite5Options.loadedFile);

    // Set dataheadername
    if(navigator.userAgent.toLowerCase().indexOf('chrome') > -1){
        viualizationSite5Options.lineChart.setDataHeaderName(d3.entries(viualizationSite5Options.loadedFile[0])[d3.entries(viualizationSite5Options.loadedFile[0]).length-1].key);
    }else if((navigator.userAgent.toLowerCase().indexOf('safari') > -1) || (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)){
        viualizationSite5Options.lineChart.setDataHeaderName(d3.entries(viualizationSite5Options.loadedFile[0])[0].key);
    }else{
        viualizationSite5Options.lineChart.setDataHeaderName(d3.entries(viualizationSite5Options.loadedFile[0])[d3.entries(viualizationSite5Options.loadedFile[0]).length-1].key);
    }

    // Convert Data to match Micha's golden Rule (Do not store data in the keys of a JSON blob.)
    var tempConvertedData;
    var convertedLoadedFile = [];
    for(var k = 0;k<viualizationSite5Options.loadedFile.length;k++){
        tempConvertedData = d3.entries(viualizationSite5Options.loadedFile[k])
        // Remove non-numeric data values
        tempConvertedData = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
        convertedLoadedFile = convertedLoadedFile.concat(tempConvertedData);
    }

    // Convert timelinedata
    var tempTimeLineName;
    var convertedTimeLineData = {};
    for(var k = 0; k<viualizationSite5Options.loadedFile.length; k++){
        if(navigator.userAgent.toLowerCase().indexOf('chrome') > -1){
            tempTimeLineName = d3.entries(viualizationSite5Options.loadedFile[k])[d3.entries(viualizationSite5Options.loadedFile[k]).length-1].value;
        }else if((navigator.userAgent.toLowerCase().indexOf('safari') > -1) || (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)){
            tempTimeLineName = d3.entries(viualizationSite5Options.loadedFile[k])[0].value;
        }else{
            tempTimeLineName = d3.entries(viualizationSite5Options.loadedFile[k])[d3.entries(viualizationSite5Options.loadedFile[k]).length-1].value;
        }
        tempConvertedData = d3.entries(viualizationSite5Options.loadedFile[k]);
        // Remove non-numeric data values
        convertedTimeLineData[tempTimeLineName] = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
    }

    // Set timelineData
    viualizationSite5Options.lineChart.setConvertedTimeLineData(convertedTimeLineData);

    // Set data for Y axes
    var yaxisDataPrim = [];
    var yaxisDataSek = [];
    $.each(convertedTimeLineData, function(i, v){
        if(i == 'Akutegastrointestinale_Infektionen' || i == 'Tuberkulose'){
            yaxisDataSek = yaxisDataSek.concat(v);
        }else{
            yaxisDataPrim = yaxisDataPrim.concat(v);
        }
    });

    // Add Y data
    viualizationSite5Options.lineChart.setPrimYAxisData(yaxisDataPrim);
    viualizationSite5Options.lineChart.setSecYAxisData(yaxisDataSek);

    // viualizationSite5Options.lineChart.setSecYAxisData();
    viualizationSite5Options.lineChart.setSecYAxisLabel('Fälle Neuerkrankungen');
    viualizationSite5Options.lineChart.setPrimYAxisLabel('Fälle Neuerkrankungen');


    // Precalculate UTC Time for performance reasons
    $.each(convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            v[i].keyUTC = Date.UTC(v[i].key,0,1,0,0,0,0);
        }
    });

    // Get selectable years for dateRangeSlider
 viualizationSite5Options.selectableYears = [];

    for(var i = 0;i<convertedLoadedFile.length;i++){
        if($.inArray(convertedLoadedFile[i].key, viualizationSite5Options.selectableYears) === -1) viualizationSite5Options.selectableYears.push(+convertedLoadedFile[i].key);
    }

    viualizationSite5Options.selectableYears.sort();

    var firstYear = Date.UTC(viualizationSite5Options.selectableYears[0],0,1,0,0,0,0);
    var lastYear = Date.UTC(viualizationSite5Options.selectableYears[viualizationSite5Options.selectableYears.length-1],0,1,0,0,0,0);

    viualizationSite5Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite5Options.lineChart.setSelectedYears(firstYear, lastYear);

    // Process markers
    for(var i = 0;i<viualizationSite5Options.loadedMarkerData.length;i++){
        viualizationSite5Options.loadedMarkerData[i].dateUTC = convertStringDateToJSUTCSite5(viualizationSite5Options.loadedMarkerData[i].date);
    }
    viualizationSite5Options.lineChart.setMarkerData(viualizationSite5Options.loadedMarkerData);
}

function convertStringDateToJSUTCSite5(stringDate) {
    return Date.UTC(stringDate.substring(0,4), (stringDate.substring(5,7)-1), stringDate.substring(8,10));
}

function loadDataSite5(){
    d3.json('json/lineChartLiveInfekTotS5.json', function(data){
        viualizationSite5Options.loadedMarkerData = data;
    });

    d3.tsv(viualizationSite5Options.dataFile, function(data){
        viualizationSite5Options.loadedFile = data;
        viualizationSite5Options.lineChart = new lineChart('site5', {drawSecYAxis: true, drawMarkers: true});
        viualizationSite5Options.lineChart.setHeadersArrayForSecondaryAxis(['Akutegastrointestinale_Infektionen', 'Tuberkulose']);
        dataProcessingSite5();
        createVisualizationControlsSite5();
        viualizationSite5Options.lineChart.initialDraw();
        jQuery('#visualizationSite5 div.key div').each(function(){$(this).simulateClick('click');});
    });
}

$('#visualizationSite5').ready(function(){
     loadDataSite5();
});