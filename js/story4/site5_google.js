var viualizationSite5OptionsGoogle = {
    dataFile: 'https://www.google.org/flutrends/ch/data.txt',
    loadedFile: [],
    loadedMarkerData: [],
    lineChart: {},
    selectableYears: [],
    cantons: []
}

var mapCantonNameToCantonAbbreviation = {
    'Zurich': 'ZH',
    'Bern': 'BE',
    'Luzern': 'LU',
    'Uri': 'UR',
    'Schwyz': 'SZ',
    'Obwalden': 'OW',
    'Nidwalden': 'NW',
    'Glarus': 'GL',
    'Zug': 'ZG',
    'Fribourg': 'FR',
    'Solothurn': 'SO',
    'Basel Stadt': 'BS',
    'Basel Landschaft': 'BL',
    'Schaffhausen': 'SH',
    'Appenzell Ausserrhoden': 'AR',
    'Appenzell Innerrhoden': 'AI',
    'St. Gallen': 'SG',
    'Graubunden': 'GR',
    'Aargau': 'AG',
    'Thurgau': 'TG',
    'Ticino': 'TI',
    'Vaud': 'VD',
    'Valais': 'VS',
    'Neuchatel': 'NE',
    'Geneva': 'GE',
    'Jura': 'JU',
    'Switzerland': 'CH',
    'Schweiz': 'CH'
}

function createVisualizationControlsSite5Google(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite5_google').css('margin-bottom', '25px');
    $('#visualizationControlsSite5_google').append( $('<p>').attr('id', 'displayDateRange') );
    // Container for the visual slider
    $('#visualizationControlsSite5_google').append( $('<div>').attr('id', 'displayDateRangeSilder').css('margin-left', '5px') );
    // addClass (col-md-3) to limit the width of the slider
    $('#visualizationControlsSite5_google #displayDateRangeSilder').slider({
            min: 0,
            max: (viualizationSite5OptionsGoogle.selectableYears.length-1),
            step: 1,
            values: [ 0, (viualizationSite5OptionsGoogle.selectableYears.length-1) ],
            slide: function( event, ui ) {
                    var min = viualizationSite5OptionsGoogle.selectableYears[ui.values[0]];
                    var max = viualizationSite5OptionsGoogle.selectableYears[ui.values[1]];

                    viualizationSite5OptionsGoogle.lineChart.setXAxisUTCExtent([min, max]);
                    viualizationSite5OptionsGoogle.lineChart.setSelectedYears(min, max);
                    $('#visualizationControlsSite5_google #displayDateRange').text('Zeitraum: ' + convertUTCDateToSwissStringDate(min) + '-' + convertUTCDateToSwissStringDate(max));
                    viualizationSite5OptionsGoogle.lineChart.updateYearRange();
                }
        }).addClass('col-md-3');
    // Set initial selected year range

    viualizationSite5OptionsGoogle.selectedStartYear = viualizationSite5OptionsGoogle.selectableYears[0];
    viualizationSite5OptionsGoogle.selectedEndYear = viualizationSite5OptionsGoogle.selectableYears[(viualizationSite5OptionsGoogle.selectableYears.length-1)];
    $('#visualizationControlsSite5_google #displayDateRange').text('Zeitraum: ' + convertUTCDateToSwissStringDate(viualizationSite5OptionsGoogle.selectedStartYear) + '-' + convertUTCDateToSwissStringDate(viualizationSite5OptionsGoogle.selectedEndYear));

    // Prepare containers for the chart and the menu on the right side
    d3.select("#visualizationSite5_google")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#visualizationSite5_google")
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

function dataProcessingSite5Google(){

    // current dataset to process
    var data;

    // Split loaded Data in lines
    var lines = viualizationSite5OptionsGoogle.loadedFile.split('\n');
    // Remove first 11 lines
    lines.splice(0,11);
    // Join all lines to new string
    data = lines.join('\n');

    // Get the first line with the containing cantons
    var firstLine = data.split('\n')[0];
    // Extract cantons
    viualizationSite5OptionsGoogle.cantons = firstLine.split(',');
    // Remove the year column
    viualizationSite5OptionsGoogle.cantons.splice(0,1);
    // Map canton name to canton abbreviation
    for(var i = 0; i<viualizationSite5OptionsGoogle.cantons.length; i++){
        viualizationSite5OptionsGoogle.cantons[i] = {'googleTrendsFluCantons': mapCantonNameToCantonAbbreviation[viualizationSite5OptionsGoogle.cantons[i]]};
    }

    //remove the first header line
    // Split loaded Data in lines
    var lines = data.split('\n');
    // Remove first 11 lines
    lines.splice(0,1);
    // Join all lines to new string
    data = lines.join('\n');

    // Set MenuData (loaded File)
    viualizationSite5OptionsGoogle.lineChart.setMenuData(viualizationSite5OptionsGoogle.cantons);

    // Set dataheadername
    viualizationSite5OptionsGoogle.lineChart.setDataHeaderName('googleTrendsFluCantons');

    // Convert timelinedata
    var convertedTimeLineData = {};
    var tempUTC;
    for(var i = 0; i<viualizationSite5OptionsGoogle.cantons.length; i++){
        convertedTimeLineData[viualizationSite5OptionsGoogle.cantons[i].googleTrendsFluCantons] = [];
        d3.csv.parseRows(data, function(d){
            if(d[i+1] !== ''){
                tempUTC = convertGoogleStringDateToJSUTC(d[0]);
                convertedTimeLineData[viualizationSite5OptionsGoogle.cantons[i].googleTrendsFluCantons].push({key: convertUTCDateToSwissStringDate(tempUTC), value: d[i+1], keyUTC: tempUTC});
            }
        });
    }

    // Set timelineData
    viualizationSite5OptionsGoogle.lineChart.setConvertedTimeLineData(convertedTimeLineData);

    // Add Y data
    var yAxisData = [];
    $.each(convertedTimeLineData, function(i, v){
        yAxisData = yAxisData.concat(v);
    });
    viualizationSite5OptionsGoogle.lineChart.setPrimYAxisData(yAxisData);

    viualizationSite5OptionsGoogle.lineChart.setPrimYAxisLabel('Suchanfragen zum Thema Grippe');

    // Get selectable years for dateRangeSlider
    viualizationSite5OptionsGoogle.selectableYears = [];

    $.each(convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            if($.inArray(v[i].keyUTC, viualizationSite5OptionsGoogle.selectableYears) === -1) viualizationSite5OptionsGoogle.selectableYears.push(+v[i].keyUTC);
        }
    })

    viualizationSite5OptionsGoogle.selectableYears.sort();

    var firstYear = viualizationSite5OptionsGoogle.selectableYears[0];
    var lastYear = viualizationSite5OptionsGoogle.selectableYears[viualizationSite5OptionsGoogle.selectableYears.length-1];

    viualizationSite5OptionsGoogle.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite5OptionsGoogle.lineChart.setSelectedYears(firstYear, lastYear);

    // Process markers
    for(var i = 0;i<viualizationSite5OptionsGoogle.loadedMarkerData.length;i++){
        viualizationSite5OptionsGoogle.loadedMarkerData[i].dateUTC = convertGoogleStringDateToJSUTC(viualizationSite5OptionsGoogle.loadedMarkerData[i].date);
    }
    viualizationSite5OptionsGoogle.lineChart.setMarkerData(viualizationSite5OptionsGoogle.loadedMarkerData);
}   

function loadDataSite5(){

    $.ajaxSetup({
        scriptCharset: "utf-8", 
        contentType: "application/json; charset=utf-8"
    });

    d3.json('json/lineChartLiveFluGoogleDataForSwitzerlandMarkers.json', function(data){
        viualizationSite5OptionsGoogle.loadedMarkerData = data;
    });

    $.getJSON('http://whateverorigin.org/get?url=' + 
        encodeURIComponent(viualizationSite5OptionsGoogle.dataFile) + '&callback=?',
        function (data) {
            viualizationSite5OptionsGoogle.loadedFile = data.contents;
            viualizationSite5OptionsGoogle.lineChart = new lineChart('site5_google', {
                    containerDimensionWidth: 650,
                    containerDimensionHeight: 250,
                    drawMarkers: true,
                    horizontalMenu: true
                });
            dataProcessingSite5Google();
            createVisualizationControlsSite5Google();
            viualizationSite5OptionsGoogle.lineChart.initialDraw();
            jQuery('#visualizationSite5_google div.key div').each(function(){$(this).simulateClick('click');});
        });
}

function convertGoogleStringDateToJSUTC(googleDate) {
    return Date.UTC(googleDate.substring(0,4), (googleDate.substring(5,7)-1), googleDate.substring(8,10));
}

function convertUTCDateToSwissStringDate(UTCDate) {
    var newDate = new Date(UTCDate);
    return '' + newDate.getUTCDate() + '.' + (newDate.getUTCMonth()+1) + '.' + newDate.getUTCFullYear();
}

$('#visualizationSite5_google').ready(function(){
     loadDataSite5();
});