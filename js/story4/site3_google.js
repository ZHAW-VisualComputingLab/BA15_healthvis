var viualizationSite3OptionsGoogle = {
    dataFile: 'https://www.google.org/flutrends/ch/data.txt',
    loadedFile: [],
    loadedMarkerData: [],
    lineChart: {},
    selectableYears: [],
    cantons: [],
    timeIntervall: {},
    selectedEndYear: '',
    autostartVisualizationHapped: false,
    requiredRankingUpdate: false
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

function createVisualizationControlsSite3Google(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite3_google').css('margin-bottom', '25px');
    $('#visualizationControlsSite3_google').append( $('<p>').attr('id', 'displayDateRange').css('display', 'none') );
    // Container for the visual slider
    $('#visualizationControlsSite3_google').append( $('<div>').attr('id', 'displayDateRangeSilder').css({'margin-left': '5px', 'display': 'none'}) );
    // addClass (col-md-3) to limit the width of the slider
    $('#visualizationControlsSite3_google #displayDateRangeSilder').slider({
            min: 0,
            max: (viualizationSite3OptionsGoogle.selectableYears.length-1),
            step: 1,
            values: [ 0, (viualizationSite3OptionsGoogle.selectableYears.length-1) ],
            slide: function( event, ui ) {
                    var min = viualizationSite3OptionsGoogle.selectableYears[ui.values[0]];
                    var max = viualizationSite3OptionsGoogle.selectableYears[ui.values[1]];

                    viualizationSite3OptionsGoogle.lineChart.setXAxisUTCExtent([min, max]);
                    viualizationSite3OptionsGoogle.lineChart.setSelectedYears(min, max);
                    $('#visualizationControlsSite3_google #displayDateRange').text('Zeitraum: ' + convertUTCDateToSwissStringDate(min) + '-' + convertUTCDateToSwissStringDate(max));
                    viualizationSite3OptionsGoogle.lineChart.updateYearRange();
                }
        }).addClass('col-md-3');
    // Set initial selected year range

    viualizationSite3OptionsGoogle.selectedStartYear = viualizationSite3OptionsGoogle.selectableYears[0];
    viualizationSite3OptionsGoogle.selectedEndYear = viualizationSite3OptionsGoogle.selectableYears[(viualizationSite3OptionsGoogle.selectableYears.length-1)];
    $('#visualizationControlsSite3_google #displayDateRange').text('Zeitraum: ' + convertUTCDateToSwissStringDate(viualizationSite3OptionsGoogle.selectedStartYear) + '-' + convertUTCDateToSwissStringDate(viualizationSite3OptionsGoogle.selectedEndYear));

    $('#visualizationControlsSite3_google').append( $( '<button>' )
                                                            .addClass('btn btn-default')
                                                            .attr('id', 'startVisualizationGoogleButton')
                                                            .text('Start')
                                                            .on('click', startVisualizationSite3Google )
                                                     );

    // Prepare containers for the chart and the menu on the right side
    d3.select("#visualizationSite3_google")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#visualizationSite3_google")
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

function dataProcessingSite3Google(){

    // current dataset to process
    var data;

    // Split loaded Data in lines
    var lines = viualizationSite3OptionsGoogle.loadedFile.split('\n');
    // Remove first 11 lines
    lines.splice(0,11);
    // Join all lines to new string
    data = lines.join('\n');

    // Get the first line with the containing cantons
    var firstLine = data.split('\n')[0];
    // Extract cantons
    viualizationSite3OptionsGoogle.cantons = firstLine.split(',');
    // Remove the year column
    viualizationSite3OptionsGoogle.cantons.splice(0,1);
    // Map canton name to canton abbreviation
    for(var i = 0; i<viualizationSite3OptionsGoogle.cantons.length; i++){
        viualizationSite3OptionsGoogle.cantons[i] = {'googleTrendsFluCantons': mapCantonNameToCantonAbbreviation[viualizationSite3OptionsGoogle.cantons[i]]};
    }

    //remove the first header line
    // Split loaded Data in lines
    var lines = data.split('\n');
    // Remove first 11 lines
    lines.splice(0,1);
    // Join all lines to new string
    data = lines.join('\n');

    // Set MenuData (loaded File)
    viualizationSite3OptionsGoogle.lineChart.setMenuData(viualizationSite3OptionsGoogle.cantons);

    // Set dataheadername
    viualizationSite3OptionsGoogle.lineChart.setDataHeaderName('googleTrendsFluCantons');

    // Convert timelinedata
    var convertedTimeLineData = {};
    var tempUTC;
    for(var i = 0; i<viualizationSite3OptionsGoogle.cantons.length; i++){
        convertedTimeLineData[viualizationSite3OptionsGoogle.cantons[i].googleTrendsFluCantons] = [];
        d3.csv.parseRows(data, function(d){
            if(d[i+1] !== ''){
                tempUTC = convertGoogleStringDateToJSUTC(d[0]);
                convertedTimeLineData[viualizationSite3OptionsGoogle.cantons[i].googleTrendsFluCantons].push({key: convertUTCDateToSwissStringDate(tempUTC), value: d[i+1], keyUTC: tempUTC});
            }
        });
    }

    // Set timelineData
    viualizationSite3OptionsGoogle.lineChart.setConvertedTimeLineData(convertedTimeLineData);

    // Add Y data
    var yAxisData = [];
    $.each(convertedTimeLineData, function(i, v){
        yAxisData = yAxisData.concat(v);
    });
    viualizationSite3OptionsGoogle.lineChart.setPrimYAxisData(yAxisData);

    viualizationSite3OptionsGoogle.lineChart.setPrimYAxisLabel('Suchanfragen zum Thema Grippe');

    // Get selectable years for dateRangeSlider
    viualizationSite3OptionsGoogle.selectableYears = [];

    $.each(convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            if($.inArray(v[i].keyUTC, viualizationSite3OptionsGoogle.selectableYears) === -1) viualizationSite3OptionsGoogle.selectableYears.push(+v[i].keyUTC);
        }
    })

    viualizationSite3OptionsGoogle.selectableYears.sort();

    var firstYear = viualizationSite3OptionsGoogle.selectableYears[0];
    var lastYear = viualizationSite3OptionsGoogle.selectableYears[viualizationSite3OptionsGoogle.selectableYears.length-1];

    viualizationSite3OptionsGoogle.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite3OptionsGoogle.lineChart.setSelectedYears(firstYear, lastYear);

    // Process markers
    for(var i = 0;i<viualizationSite3OptionsGoogle.loadedMarkerData.length;i++){
        viualizationSite3OptionsGoogle.loadedMarkerData[i].dateUTC = convertGoogleStringDateToJSUTC(viualizationSite3OptionsGoogle.loadedMarkerData[i].date);
    }
    viualizationSite3OptionsGoogle.lineChart.setMarkerData(viualizationSite3OptionsGoogle.loadedMarkerData);
}   

function loadDataSite3(){

    $.ajaxSetup({
        scriptCharset: "utf-8", 
        contentType: "application/json; charset=utf-8"
    });

    d3.json('json/lineChartLiveFluGoogleDataForSwitzerlandMarkers.json', function(data){
        viualizationSite3OptionsGoogle.loadedMarkerData = data;
    });

    $.getJSON('http://whateverorigin.org/get?url=' + 
        encodeURIComponent(viualizationSite3OptionsGoogle.dataFile) + '&callback=?',
        function (data) {
            viualizationSite3OptionsGoogle.loadedFile = data.contents;
            viualizationSite3OptionsGoogle.lineChart = new lineChart('site3_google', {
                    drawMarkers: true,
                    collectRankingData: true
                });
            dataProcessingSite3Google();
            createVisualizationControlsSite3Google();
            viualizationSite3OptionsGoogle.lineChart.initialDraw();
            fillRankingTable();
        });
}

function convertGoogleStringDateToJSUTC(googleDate) {
    return Date.UTC(googleDate.substring(0,4), (googleDate.substring(5,7)-1), googleDate.substring(8,10));
}

function convertUTCDateToSwissStringDate(UTCDate) {
    var newDate = new Date(UTCDate);
    return '' + newDate.getUTCDate() + '.' + (newDate.getUTCMonth()+1) + '.' + newDate.getUTCFullYear();
}

function autostartVisualizationSite3(){
    if(!viualizationSite3OptionsGoogle.autostartVisualizationHapped){
        viualizationSite3OptionsGoogle.autostartVisualizationHapped = true;
        startVisualizationSite3Google();
    }else{
        if(!$('#site3_google .timeseries').length){
            jQuery('#site3_google div.key div').each(function(){$(this).simulateClick('click');});
        }
    }
}

function stopVisualizationSite3(){
    if (typeof viualizationSite3OptionsGoogle.timeIntervall !== "undefined") {
        window.clearInterval(viualizationSite3OptionsGoogle.timeIntervall);
        d3.selectAll("#site3 .timeseries").remove();
        $('#startVisualizationGoogleButton').prop('disabled', false);
    }
}

function startVisualizationSite3Google(){
    fillRankingTable();
    viualizationSite3OptionsGoogle.selectedEndYear = 1;

    var firstYear = viualizationSite3OptionsGoogle.selectableYears[0];
    var lastYear = viualizationSite3OptionsGoogle.selectableYears[1];


    viualizationSite3OptionsGoogle.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite3OptionsGoogle.lineChart.setSelectedYears(firstYear, lastYear);
    viualizationSite3OptionsGoogle.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 350});
    viualizationSite3OptionsGoogle.requiredRankingUpdate = true;

    $('#startVisualizationGoogleButton').prop('disabled', true);

    viualizationSite3OptionsGoogle.timeIntervall = setInterval(function(){
        
        var min = viualizationSite3OptionsGoogle.selectableYears[0];
        var max = viualizationSite3OptionsGoogle.selectableYears[viualizationSite3OptionsGoogle.selectedEndYear];
        var ranking = {};
        var tempTR = {};

        if(!$('#site3_google .timeseries').length){
			jQuery('#site3_google div.key div').each(function(){$(this).simulateClick('click');});
        }

        if(viualizationSite3OptionsGoogle.selectedEndYear >= viualizationSite3OptionsGoogle.selectableYears.length){
            viualizationSite3OptionsGoogle.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1000});
            viualizationSite3OptionsGoogle.requiredRankingUpdate = true;
            updateRankingTableSite3();
            window.clearInterval(viualizationSite3OptionsGoogle.timeIntervall);
			jQuery('#site3_google div.key div').each(function(){$(this).simulateClick('click');}).each(function(){$(this).simulateClick('click');});
            $('#startVisualizationGoogleButton').prop('disabled', false);
        }else{
            viualizationSite3OptionsGoogle.lineChart.setXAxisUTCExtent([min, max]);
            viualizationSite3OptionsGoogle.lineChart.setSelectedYears(min, max);
            viualizationSite3OptionsGoogle.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 350});
            viualizationSite3OptionsGoogle.requiredRankingUpdate = true;
            updateRankingTableSite3();
        }

        if(viualizationSite3OptionsGoogle.selectedEndYear < 25){
            viualizationSite3OptionsGoogle.selectedEndYear = viualizationSite3OptionsGoogle.selectedEndYear + 15;
        }else{
            viualizationSite3OptionsGoogle.selectedEndYear = viualizationSite3OptionsGoogle.selectedEndYear + 5;            
        }

        
    }, 400);

}

function updateRankingTableSite3(){
    ranking = viualizationSite3OptionsGoogle.lineChart.getRankingData()

    for(var i = 0;i<ranking.length;i++){
        $('#tdValueOf' + ranking[i].key).text(ranking[i].value)
    }                

    if(!getUpdate()){
        setUpdateTrue();
        superSort($('table#cantonRanking'), rankingUpdateQueue);
    }
    $('table:nth-child(2)').remove();
}

function rankingUpdateQueue(){
    setUpdateFalse();
    $('table:nth-child(2)').remove();
    if(viualizationSite3OptionsGoogle.requiredRankingUpdate){
        viualizationSite3OptionsGoogle.requiredRankingUpdate = false;
        updateRankingTableSite3();
    }
}

function fillRankingTable(){
    var tempTR;
    $('#cantonRanking tbody').empty();
    for(var i = 0;i<viualizationSite3OptionsGoogle.cantons.length; i++){
        tempTR = $( ' <tr> ' );
        tempTR.append( $( ' <td> ' ).text(i+1) );
        tempTR.append( $( ' <td> ' ).text(viualizationSite3OptionsGoogle.cantons[i].googleTrendsFluCantons) );
        tempTR.append( $( ' <td id="tdValueOf' + viualizationSite3OptionsGoogle.cantons[i].googleTrendsFluCantons + '"> ' ).text(0) );
        $('#cantonRanking tbody').append(tempTR);
    }
}

$('#visualizationSite3_google').ready(function(){
     loadDataSite3();
});