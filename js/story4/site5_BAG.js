var viualizationSite5OptionsBAG = {
    dataFile: 'http://www.bag-anw.admin.ch/sentinella/influenza/d/bag_influenza_ch.csv',
    loadedMarkerData: [],
    loadedFile: [],
    lineChart: {},
    selectableYears: []
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

function createVisualizationControlsSite5BAG(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite5_BAG').css('margin-bottom', '25px');
    $('#visualizationControlsSite5_BAG').append( $('<p>').attr('id', 'displayDateRange') );
    // Container for the visual slider
    $('#visualizationControlsSite5_BAG').append( $('<div>').attr('id', 'displayDateRangeSilder').css('margin-left', '5px') );
    // addClass (col-md-3) to limit the width of the slider
    $('#visualizationControlsSite5_BAG #displayDateRangeSilder').slider({
            min: 0,
            max: (viualizationSite5OptionsBAG.selectableYears.length-1),
            step: 1,
            values: [ 0, (viualizationSite5OptionsBAG.selectableYears.length-1) ],
            slide: function( event, ui ) {
                    var min = viualizationSite5OptionsBAG.selectableYears[ui.values[0]];
                    var max = viualizationSite5OptionsBAG.selectableYears[ui.values[1]];

                    viualizationSite5OptionsBAG.lineChart.setXAxisUTCExtent([min, max]);
                    viualizationSite5OptionsBAG.lineChart.setSelectedYears(min, max);
                    $('#visualizationControlsSite5_BAG #displayDateRange').text('Zeitraum: ' + convertUTCDateToKWAndYear(min) + '-' + convertUTCDateToKWAndYear(max));
                    viualizationSite5OptionsBAG.lineChart.updateYearRange();
                }
        }).addClass('col-md-3');
    // Set initial selected year range

    viualizationSite5OptionsBAG.selectedStartYear = viualizationSite5OptionsBAG.selectableYears[0];
    viualizationSite5OptionsBAG.selectedEndYear = viualizationSite5OptionsBAG.selectableYears[(viualizationSite5OptionsBAG.selectableYears.length-1)];
    $('#visualizationControlsSite5_BAG #displayDateRange').text('Zeitraum: ' + convertUTCDateToKWAndYear(viualizationSite5OptionsBAG.selectedStartYear) + '-' + convertUTCDateToKWAndYear(viualizationSite5OptionsBAG.selectedEndYear));

    // Prepare containers for the chart and the menu on the right side
    d3.select("#visualizationSite5_BAG")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#visualizationSite5_BAG")
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

function dataProcessingSite5BAG(){

    // current dataset to process
    var data;

    // Split loaded Data in lines
    var lines = viualizationSite5OptionsBAG.loadedFile.split('\n');
    // Remove first 11 lines
    lines.splice(0,6);
    // Join all lines to new string
    data = lines.join('\n');

    // Set MenuData (loaded File)
    viualizationSite5OptionsBAG.lineChart.setMenuData([{'BAGInfluenza': 'CH'}]);

    // Set dataheadername
    viualizationSite5OptionsBAG.lineChart.setDataHeaderName('BAGInfluenza');

    // Convert timelinedata
    var convertedTimeLineData = {};
    var tempUTC;
    convertedTimeLineData['CH'] = [];

    d3.csv.parseRows(data.replace(/;/g, ","), function(d){
        if(d[0] !== ''){
            tempUTC = getUTCFromYearAndWeek(d[0], d[2]);
            convertedTimeLineData['CH'].push({key: convertUTCDateToKWAndYear(tempUTC), value: d[3], keyUTC: tempUTC});
        }
    });

    // Set timelineData
    viualizationSite5OptionsBAG.lineChart.setConvertedTimeLineData(convertedTimeLineData);

    // Add Y data
    var yAxisData = [];
    $.each(convertedTimeLineData, function(i, v){
        yAxisData = yAxisData.concat(v);
    });
    viualizationSite5OptionsBAG.lineChart.setPrimYAxisData(yAxisData);

    viualizationSite5OptionsBAG.lineChart.setPrimYAxisLabel('Influenza Verdachtsvälle');

    // Get selectable years for dateRangeSlider
    viualizationSite5OptionsBAG.selectableYears = [];

    $.each(convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            if($.inArray(v[i].keyUTC, viualizationSite5OptionsBAG.selectableYears) === -1) viualizationSite5OptionsBAG.selectableYears.push(+v[i].keyUTC);
        }
    })

    viualizationSite5OptionsBAG.selectableYears.sort();

    var firstYear = viualizationSite5OptionsBAG.selectableYears[0];
    var lastYear = viualizationSite5OptionsBAG.selectableYears[viualizationSite5OptionsBAG.selectableYears.length-1];

    viualizationSite5OptionsBAG.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite5OptionsBAG.lineChart.setSelectedYears(firstYear, lastYear);

    // Process markers
    for(var i = 0;i<viualizationSite5OptionsBAG.loadedMarkerData.length;i++){
        viualizationSite5OptionsBAG.loadedMarkerData[i].dateUTC = convertStringDateToJSUTCSite5BAG(viualizationSite5OptionsBAG.loadedMarkerData[i].date);
    }
    viualizationSite5OptionsBAG.lineChart.setMarkerData(viualizationSite5OptionsBAG.loadedMarkerData);
}

function loadDataSite5(){

    $.ajaxSetup({
        scriptCharset: "utf-8", 
        contentType: "application/json; charset=utf-8"
    });

    d3.json('json/lineChartLiveFluBAG.json', function(data){
        viualizationSite5OptionsBAG.loadedMarkerData = data;
    });
    
    $.getJSON('http://whateverorigin.org/get?url=' + 
        encodeURIComponent(viualizationSite5OptionsBAG.dataFile) + '&callback=?',
        function (data) {
            viualizationSite5OptionsBAG.loadedFile = data.contents;
            viualizationSite5OptionsBAG.lineChart = new lineChart('site5_BAG', {
                    containerDimensionWidth: 650,
                    containerDimensionHeight: 250,
                    horizontalMenu: true,
                    drawMarkers: true
                });
            dataProcessingSite5BAG();
            createVisualizationControlsSite5BAG();
            viualizationSite5OptionsBAG.lineChart.initialDraw();
            jQuery('#visualizationSite5_BAG div.key div').each(function(){$(this).simulateClick('click');});
        });
}

function convertStringDateToJSUTCSite5BAG(stringDate) {
    return Date.UTC(stringDate.substring(0,4), (stringDate.substring(5,7)-1), stringDate.substring(8,10));
}

function convertUTCDateToKWAndYear(UTCDate) {
    var newDate = new Date(UTCDate);
    return 'KW: ' + getKalenderWoche(newDate) + ', ' + newDate.getUTCFullYear();
}

// Source: http://www.webdeveloper.com/forum/showthread.php?50711-Convert-Week-Number-to-Date-Format
function getUTCFromYearAndWeek(year, week) {
    var jan10 = new Date(year,0,10,12,0,0);
    var jan4 = new Date(year,0,4,12,0,0);
    var wk1mon = new Date(jan4.getTime()-(jan10.getDay())*86400000);
    // Blance with 46800000 miliseconds
    var startdate = new Date(wk1mon.getTime()+(week-1)*604800000+46800000);
    return startdate.getTime();
}

// Source: http://www.web-toolbox.net/webtoolbox/datum/code-kalenderwocheaktuell.htm
function getKalenderWoche(date){
    var DonnerstagDat = new Date(date.getTime() +
    (3-((date.getDay()+6) % 7)) * 86400000);

    KWJahr = DonnerstagDat.getFullYear();

    var DonnerstagKW = new Date(new Date(KWJahr,0,4).getTime() +
    (3-((new Date(KWJahr,0,4).getDay()+6) % 7)) * 86400000);

    KW = Math.floor(1.5 + (DonnerstagDat.getTime() -
    DonnerstagKW.getTime()) / 86400000/7);

    return KW;
}

$('#visualizationSite5_BAG').ready(function(){
     loadDataSite5();
});