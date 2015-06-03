var viualizationSite4OptionsBAG = {
    dataFile: 'http://www.bag-anw.admin.ch/sentinella/influenza/d/bag_influenza_ch.csv',
    loadedFile: [],
    lineChart: {},
    loadedMarkerData: [],
    selectableYears: [],
    timeIntervall: {},
    selectedEndYear: '',
    autostartVisualizationHapped: false
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

function createVisualizationControlsSite4BAG(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite4_BAG').css('margin-bottom', '25px');
    $('#visualizationControlsSite4_BAG').append( $('<p>').attr('id', 'displayDateRange').css('display', 'none') );
    // Container for the visual slider
    $('#visualizationControlsSite4_BAG').append( $('<div>').attr('id', 'displayDateRangeSilder').css({'margin-left': '5px', 'display': 'none'}) );
    // addClass (col-md-3) to limit the width of the slider
    $('#visualizationControlsSite4_BAG #displayDateRangeSilder').slider({
            min: 0,
            max: (viualizationSite4OptionsBAG.selectableYears.length-1),
            step: 1,
            values: [ 0, (viualizationSite4OptionsBAG.selectableYears.length-1) ],
            slide: function( event, ui ) {
                    var min = viualizationSite4OptionsBAG.selectableYears[ui.values[0]];
                    var max = viualizationSite4OptionsBAG.selectableYears[ui.values[1]];

                    viualizationSite4OptionsBAG.lineChart.setXAxisUTCExtent([min, max]);
                    viualizationSite4OptionsBAG.lineChart.setSelectedYears(min, max);
                    $('#visualizationControlsSite4_BAG #displayDateRange').text('Zeitraum: ' + convertUTCDateToKWAndYearSite4BAG(min) + '-' + convertUTCDateToKWAndYearSite4BAG(max));
                    viualizationSite4OptionsBAG.lineChart.updateYearRange();
                }
        }).addClass('col-md-3');
    // Set initial selected year range

    viualizationSite4OptionsBAG.selectedStartYear = viualizationSite4OptionsBAG.selectableYears[0];
    viualizationSite4OptionsBAG.selectedEndYear = viualizationSite4OptionsBAG.selectableYears[(viualizationSite4OptionsBAG.selectableYears.length-1)];
    $('#visualizationControlsSite4_BAG #displayDateRange').text('Zeitraum: ' + convertUTCDateToKWAndYearSite4BAG(viualizationSite4OptionsBAG.selectedStartYear) + '-' + convertUTCDateToKWAndYearSite4BAG(viualizationSite4OptionsBAG.selectedEndYear));

    $('#visualizationControlsSite4_BAG').append( $( '<button>' )
                                                            .addClass('btn btn-default')
                                                            .attr('id', 'startVisualizationBAGButton')
                                                            .text('Start')
                                                            .on('click', startVisualizationSite4BAG )
                                                     );

    // Prepare containers for the chart and the menu on the right side
    d3.select("#visualizationSite4_BAG")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#visualizationSite4_BAG")
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

function dataProcessingSite4BAG(){

    // current dataset to process
    var data;

    // Split loaded Data in lines
    var lines = viualizationSite4OptionsBAG.loadedFile.split('\n');
    // Remove first 11 lines
    lines.splice(0,6);
    // Join all lines to new string
    data = lines.join('\n');

    // Set MenuData (loaded File)
    viualizationSite4OptionsBAG.lineChart.setMenuData([{'BAGInfluenza': 'CH'}]);

    // Set dataheadername
    viualizationSite4OptionsBAG.lineChart.setDataHeaderName('BAGInfluenza');

    // Convert timelinedata
    var convertedTimeLineData = {};
    var tempUTC;
    convertedTimeLineData['CH'] = [];

    d3.csv.parseRows(data.replace(/;/g, ","), function(d){
        if(d[0] !== ''){
            tempUTC = getUTCFromYearAndWeekSite4BAG(d[0], d[2]);
            convertedTimeLineData['CH'].push({key: convertUTCDateToKWAndYearSite4BAG(tempUTC), value: d[3], keyUTC: tempUTC});
        }
    });

    // Set timelineData
    viualizationSite4OptionsBAG.lineChart.setConvertedTimeLineData(convertedTimeLineData);

    // Add Y data
    var yAxisData = [];
    $.each(convertedTimeLineData, function(i, v){
        yAxisData = yAxisData.concat(v);
    });
    viualizationSite4OptionsBAG.lineChart.setPrimYAxisData(yAxisData);

    viualizationSite4OptionsBAG.lineChart.setPrimYAxisLabel('Influenza Verdachtsvälle');

    // Get selectable years for dateRangeSlider
    viualizationSite4OptionsBAG.selectableYears = [];

    $.each(convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            if($.inArray(v[i].keyUTC, viualizationSite4OptionsBAG.selectableYears) === -1) viualizationSite4OptionsBAG.selectableYears.push(+v[i].keyUTC);
        }
    })

    viualizationSite4OptionsBAG.selectableYears.sort();

    var firstYear = viualizationSite4OptionsBAG.selectableYears[0];
    var lastYear = viualizationSite4OptionsBAG.selectableYears[viualizationSite4OptionsBAG.selectableYears.length-1];

    viualizationSite4OptionsBAG.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite4OptionsBAG.lineChart.setSelectedYears(firstYear, lastYear);

    // Process markers
    for(var i = 0;i<viualizationSite4OptionsBAG.loadedMarkerData.length;i++){
        viualizationSite4OptionsBAG.loadedMarkerData[i].dateUTC = convertStringDateToJSUTCSite4BAG(viualizationSite4OptionsBAG.loadedMarkerData[i].date);
    }
    viualizationSite4OptionsBAG.lineChart.setMarkerData(viualizationSite4OptionsBAG.loadedMarkerData);
}

function loadDataSite4BAG(){

    $.ajaxSetup({
        scriptCharset: "utf-8", 
        contentType: "application/json; charset=utf-8"
    });

    d3.json('json/lineChartLiveFluBAG.json', function(data){
        viualizationSite4OptionsBAG.loadedMarkerData = data;
    });

    $.getJSON('http://whateverorigin.org/get?url=' + 
        encodeURIComponent(viualizationSite4OptionsBAG.dataFile) + '&callback=?',
        function (data) {
            viualizationSite4OptionsBAG.loadedFile = data.contents;
            viualizationSite4OptionsBAG.lineChart = new lineChart('site4_BAG', {drawMarkers: true});
            dataProcessingSite4BAG();
            createVisualizationControlsSite4BAG();
            viualizationSite4OptionsBAG.lineChart.initialDraw();
        });
}

function convertStringDateToJSUTCSite4BAG(stringDate) {
    return Date.UTC(stringDate.substring(0,4), (stringDate.substring(5,7)-1), stringDate.substring(8,10));
}

function convertUTCDateToKWAndYearSite4BAG(UTCDate) {
    var newDate = new Date(UTCDate);
    return 'KW: ' + getKalenderWocheSite4BAG(newDate) + ', ' + newDate.getUTCFullYear();
}

// Source: http://www.webdeveloper.com/forum/showthread.php?50711-Convert-Week-Number-to-Date-Format
function getUTCFromYearAndWeekSite4BAG(year, week) {
    var jan10 = new Date(year,0,10,12,0,0);
    var jan4 = new Date(year,0,4,12,0,0);
    var wk1mon = new Date(jan4.getTime()-(jan10.getDay())*86400000);
    // Blance with 46800000 miliseconds
    var startdate = new Date(wk1mon.getTime()+(week-1)*604800000+46800000);
    return startdate.getTime();
}

// Source: http://www.web-toolbox.net/webtoolbox/datum/code-kalenderwocheaktuell.htm
function getKalenderWocheSite4BAG(date){
    var DonnerstagDat = new Date(date.getTime() +
    (3-((date.getDay()+6) % 7)) * 86400000);

    KWJahr = DonnerstagDat.getFullYear();

    var DonnerstagKW = new Date(new Date(KWJahr,0,4).getTime() +
    (3-((new Date(KWJahr,0,4).getDay()+6) % 7)) * 86400000);

    KW = Math.floor(1.5 + (DonnerstagDat.getTime() -
    DonnerstagKW.getTime()) / 86400000/7);

    return KW;
}

function autostartVisualizationSite4(){
    if(!viualizationSite4OptionsBAG.autostartVisualizationHapped){
        viualizationSite4OptionsBAG.autostartVisualizationHapped = true;
        startVisualizationSite4BAG();
    }else{
        if(!$('#site4_BAG .timeseries').length){
            var min = viualizationSite4OptionsBAG.selectableYears[0];
            var max = viualizationSite4OptionsBAG.selectableYears[viualizationSite4OptionsBAG.selectableYears.length-1];
            viualizationSite4OptionsBAG.lineChart.setXAxisUTCExtent([min, max]);
            viualizationSite4OptionsBAG.lineChart.setSelectedYears(min, max);
            viualizationSite4OptionsBAG.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 200});
            jQuery('#site4_BAG div.key div').each(function(){$(this).simulateClick('click');});
        }
    }
}

function stopVisualizationSite4(){
    if (typeof viualizationSite4OptionsBAG.timeIntervall !== "undefined") {
        window.clearInterval(viualizationSite4OptionsBAG.timeIntervall);
        d3.selectAll("#site4 .timeseries").remove();
        $('#startVisualizationBAGButton').prop('disabled', false);
    }
    delete viualizationSite4OptionsBAG.timeIntervall;
}

function startVisualizationSite4BAG(){

    viualizationSite4OptionsBAG.selectedEndYear = 1;

    var firstYear = viualizationSite4OptionsBAG.selectableYears[0];
    var lastYear = viualizationSite4OptionsBAG.selectableYears[1];


    viualizationSite4OptionsBAG.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite4OptionsBAG.lineChart.setSelectedYears(firstYear, lastYear);
    viualizationSite4OptionsBAG.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 200});

    $('#startVisualizationBAGButton').prop('disabled', true);

    viualizationSite4OptionsBAG.timeIntervall = setInterval(function(){
        
        var min = viualizationSite4OptionsBAG.selectableYears[0];
        var max = viualizationSite4OptionsBAG.selectableYears[viualizationSite4OptionsBAG.selectedEndYear];
     
        if(!$('#site4_BAG .timeseries').length){
            jQuery('#site4_BAG div.key div').each(function(){$(this).simulateClick('click');});
        }

        if(viualizationSite4OptionsBAG.selectedEndYear >= viualizationSite4OptionsBAG.selectableYears.length){
            viualizationSite4OptionsBAG.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1000});
            window.clearInterval(viualizationSite4OptionsBAG.timeIntervall);
            jQuery('#site4_BAG div.key div').each(function(){$(this).simulateClick('click');}).each(function(){$(this).simulateClick('click');});
            $('#startVisualizationBAGButton').prop('disabled', false);
        }else{
            viualizationSite4OptionsBAG.lineChart.setXAxisUTCExtent([min, max]);
            viualizationSite4OptionsBAG.lineChart.setSelectedYears(min, max);
            viualizationSite4OptionsBAG.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 200});
        }

        if(viualizationSite4OptionsBAG.selectedEndYear < 15){
            viualizationSite4OptionsBAG.selectedEndYear = viualizationSite4OptionsBAG.selectedEndYear + 10;
        }else{
            viualizationSite4OptionsBAG.selectedEndYear++;
        }

    }, 300);

}

$('#visualizationSite4_BAG').ready(function(){
     loadDataSite4BAG();
});