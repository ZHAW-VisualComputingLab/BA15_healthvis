var viualizationSite3Options = {
    dataFile: 'tsv/Mortalitaet/site3.tsv',
    loadedFile: [],
    lineChart: {},
    selectableYears: [],
    autostartVisualizationHapped: false
}

function createVisualizationControlsSite3(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite3').css('margin-bottom', '25px');
    $('#visualizationControlsSite3').append( $('<p>').attr('id', 'displayDateRange').css('display', 'none') );
    // Container for the visual slider
    $('#visualizationControlsSite3').append( $('<div>').attr('id', 'displayDateRangeSilder').css({'margin-left': '5px', 'display': 'none'}) );
    // addClass (col-md-3) to limit the width of the slider
    $('#visualizationControlsSite3 #displayDateRangeSilder').slider({
            min: 0,
            max: (viualizationSite3Options.selectableYears.length-1),
            step: 1,
            values: [ 0, (viualizationSite3Options.selectableYears.length-1) ],
            slide: function( event, ui ) {
                    var min = viualizationSite3Options.selectableYears[ui.values[0]];
                    var max = viualizationSite3Options.selectableYears[ui.values[1]];

                    var firstYear = Date.UTC(min,0,1,0,0,0,0);
                    var lastYear = Date.UTC(max,0,1,0,0,0,0);

                    viualizationSite3Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
                    viualizationSite3Options.lineChart.setSelectedYears(firstYear, lastYear);
                    $('#visualizationControlsSite3 #displayDateRange').text('Zeitraum: ' + min + '-' + max);
                    viualizationSite3Options.lineChart.updateYearRange();
                }
        }).addClass('col-md-3');
    // Set initial selected year range
    viualizationSite3Options.selectedStartYear = viualizationSite3Options.selectableYears[0];
    viualizationSite3Options.selectedEndYear = viualizationSite3Options.selectableYears[(viualizationSite3Options.selectableYears.length-1)];
    $('#visualizationControlsSite3 #displayDateRange').text('Zeitraum: ' + convertUTCDateToYear(viualizationSite3Options.selectedStartYear) + '-' + convertUTCDateToYear(viualizationSite3Options.selectedEndYear));

    $('#visualizationControlsSite3').append( $( '<button>' )
                                                            .addClass('btn btn-default')
                                                            .attr('id', 'startVisualizationSite3Button')
                                                            .text('Start')
                                                            .on('click', startVisualizationSite3 )
                                                     );

    // Prepare containers for the chart and the menu on the right side
    d3.select("#visualizationSite3")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#visualizationSite3")
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

function dataProcessingSite3(){
    // Set MenuData (loaded File)
    viualizationSite3Options.lineChart.setMenuData(viualizationSite3Options.loadedFile);

    // Set dataheadername
    if(navigator.userAgent.toLowerCase().indexOf('chrome') > -1){
        viualizationSite3Options.lineChart.setDataHeaderName(d3.entries(viualizationSite3Options.loadedFile[0])[d3.entries(viualizationSite3Options.loadedFile[0]).length-1].key);
    }else if((navigator.userAgent.toLowerCase().indexOf('safari') > -1) || (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)){
        viualizationSite3Options.lineChart.setDataHeaderName(d3.entries(viualizationSite3Options.loadedFile[0])[0].key);
    }else{
        viualizationSite3Options.lineChart.setDataHeaderName(d3.entries(viualizationSite3Options.loadedFile[0])[d3.entries(viualizationSite3Options.loadedFile[0]).length-1].key);
    }

    // Convert Data to match Micha's golden Rule (Do not store data in the keys of a JSON blob.)
    var tempConvertedData;
    var convertedLoadedFile = [];
    for(var k = 0;k<viualizationSite3Options.loadedFile.length;k++){
        tempConvertedData = d3.entries(viualizationSite3Options.loadedFile[k])
        // Remove non-numeric data values
        tempConvertedData = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
        convertedLoadedFile = convertedLoadedFile.concat(tempConvertedData);
    }

    // Convert timelinedata
    var tempTimeLineName;
    var convertedTimeLineData = {};
    for(var k = 0; k<viualizationSite3Options.loadedFile.length; k++){
        if(navigator.userAgent.toLowerCase().indexOf('chrome') > -1){
            tempTimeLineName = d3.entries(viualizationSite3Options.loadedFile[k])[d3.entries(viualizationSite3Options.loadedFile[k]).length-1].value;
        }else if((navigator.userAgent.toLowerCase().indexOf('safari') > -1) || (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)){
            tempTimeLineName = d3.entries(viualizationSite3Options.loadedFile[k])[0].value;
        }else{
            tempTimeLineName = d3.entries(viualizationSite3Options.loadedFile[k])[d3.entries(viualizationSite3Options.loadedFile[k]).length-1].value;
        }
        tempConvertedData = d3.entries(viualizationSite3Options.loadedFile[k]);

        // Remove non-numeric data values
        convertedTimeLineData[tempTimeLineName] = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
    }

    // Set timelineData
    viualizationSite3Options.lineChart.setConvertedTimeLineData(convertedTimeLineData);

    // Set data for Y axes
    var yaxisDataPrim = [];
    $.each(convertedTimeLineData, function(i, v){
        yaxisDataPrim = yaxisDataPrim.concat(v);
    });

    // Add Y data
    viualizationSite3Options.lineChart.setPrimYAxisData(yaxisDataPrim);

    // viualizationSite3Options.lineChart.setSecYAxisData();
    viualizationSite3Options.lineChart.setPrimYAxisLabel('Mortalität pro 100 000 Einwohner');


    // Precalculate UTC Time for performance reasons
    $.each(convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            v[i].keyUTC = Date.UTC(v[i].key,0,1,0,0,0,0);
        }
    });

    // Get selectable years for dateRangeSlider
    viualizationSite3Options.selectableYears = [];

    for(var i = 0;i<convertedLoadedFile.length;i++){
        if($.inArray(convertedLoadedFile[i].key, viualizationSite3Options.selectableYears) === -1) viualizationSite3Options.selectableYears.push(+convertedLoadedFile[i].key);
    }

    viualizationSite3Options.selectableYears = $.unique(viualizationSite3Options.selectableYears.sort()).sort(); 

    var firstYear = Date.UTC(viualizationSite3Options.selectableYears[0],0,1,0,0,0,0);
    var lastYear = Date.UTC(viualizationSite3Options.selectableYears[viualizationSite3Options.selectableYears.length-1],0,1,0,0,0,0);

    viualizationSite3Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite3Options.lineChart.setSelectedYears(firstYear, lastYear);


}

function convertUTCDateToYear(UTCDate) {
    var newDate = new Date(UTCDate);
    return '' + newDate.getUTCFullYear();
}

function loadDataSite3(){
    d3.tsv(viualizationSite3Options.dataFile, function(data){
        viualizationSite3Options.loadedFile = data;
        viualizationSite3Options.lineChart = new lineChart('site3', {pathOnMouseHelper: false});
        viualizationSite3Options.lineChart.setHeadersArrayForSecondaryAxis(['Säuglingssterblichkeit']);
        dataProcessingSite3();
        createVisualizationControlsSite3();
        viualizationSite3Options.lineChart.initialDraw();
        jQuery('#site3 div.key div').each(function(){$(this).simulateClick('click');});
    });
}

function autostartVisualizationSite3(){
    if(!viualizationSite3Options.autostartVisualizationHapped){
        viualizationSite3Options.autostartVisualizationHapped = true;
        startVisualizationSite3();
    }
}

function stopVisualizationSite3(){
    if (typeof viualizationSite3Options.timeIntervall !== "undefined") {
        window.clearInterval(viualizationSite3Options.timeIntervall);
        d3.selectAll("#site3 .timeseries").remove();
        $('#startVisualizationSite3Button').prop('disabled', false);
    }
}

function startVisualizationSite3(){

    if($('#site3 .timeseries').length == 0){
        jQuery('#site3 div.key div').each(function(){$(this).simulateClick('click');});
    }

    viualizationSite3Options.selectedEndYear = 1;

    var firstYear = Date.UTC('1950',0,1,0,0,0,0);
    var lastYear = Date.UTC('1951',0,1,0,0,0,0);

    viualizationSite3Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite3Options.lineChart.setSelectedYears(firstYear, lastYear);
    viualizationSite3Options.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1100});

    $('#startVisualizationSite3Button').prop('disabled', true);

    viualizationSite3Options.timeIntervall = setInterval(function(){
        
        var min = Date.UTC(viualizationSite3Options.selectableYears[0],0,1,0,0,0,0);
        var max = Date.UTC(viualizationSite3Options.selectableYears[viualizationSite3Options.selectedEndYear],0,1,0,0,0,0);
     
        if(!$('#site3 .timeseries').length){
            jQuery('#site3 div.key div').each(function(){$(this).simulateClick('click');});
        }

        if(viualizationSite3Options.selectedEndYear >= viualizationSite3Options.selectableYears.length){
            viualizationSite3Options.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1100});
            window.clearInterval(viualizationSite3Options.timeIntervall);
            jQuery('#site3 div.key div').each(function(){$(this).simulateClick('click');}).each(function(){$(this).simulateClick('click');});
            $('#startVisualizationSite3Button').prop('disabled', false);
        }else{
            viualizationSite3Options.lineChart.setXAxisUTCExtent([min, max]);
            viualizationSite3Options.lineChart.setSelectedYears(min, max);
            viualizationSite3Options.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 1100});
        }

        if(viualizationSite3Options.selectedEndYear > 4){
            viualizationSite3Options.selectedEndYear = viualizationSite3Options.selectedEndYear + 3;
        }else{
            viualizationSite3Options.selectedEndYear = viualizationSite3Options.selectedEndYear + 1;            
        }

    }, 1300);

}

$('#visualizationSite3').ready(function(){
     loadDataSite3();
});
