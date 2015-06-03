var viualizationSite6Options = {
    dataFile: 'tsv/Mortalitaet/site6.tsv',
    loadedFile: [],
    lineChart: {},
    selectableYears: [],
    autostartVisualizationHapped: false
}

function createVisualizationControlsSite6(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite6').css('margin-bottom', '25px');
    $('#visualizationControlsSite6').append( $('<p>').attr('id', 'displayDateRange').css('display', 'none') );
    // Container for the visual slider
    $('#visualizationControlsSite6').append( $('<div>').attr('id', 'displayDateRangeSilder').css({'margin-left': '5px', 'display': 'none'}) );
    // addClass (col-md-3) to limit the width of the slider
    $('#visualizationControlsSite6 #displayDateRangeSilder').slider({
            min: 0,
            max: (viualizationSite6Options.selectableYears.length-1),
            step: 1,
            values: [ 0, (viualizationSite6Options.selectableYears.length-1) ],
            slide: function( event, ui ) {
                    var min = viualizationSite6Options.selectableYears[ui.values[0]];
                    var max = viualizationSite6Options.selectableYears[ui.values[1]];

                    var firstYear = Date.UTC(min,0,1,0,0,0,0);
                    var lastYear = Date.UTC(max,0,1,0,0,0,0);

                    viualizationSite6Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
                    viualizationSite6Options.lineChart.setSelectedYears(firstYear, lastYear);
                    $('#visualizationControlsSite6 #displayDateRange').text('Zeitraum: ' + min + '-' + max);
                    viualizationSite6Options.lineChart.updateYearRange();
                }
        }).addClass('col-md-3');
    // Set initial selected year range
    viualizationSite6Options.selectedStartYear = viualizationSite6Options.selectableYears[0];
    viualizationSite6Options.selectedEndYear = viualizationSite6Options.selectableYears[(viualizationSite6Options.selectableYears.length-1)];
    $('#visualizationControlsSite6 #displayDateRange').text('Zeitraum: ' + convertUTCDateToYear(viualizationSite6Options.selectedStartYear) + '-' + convertUTCDateToYear(viualizationSite6Options.selectedEndYear));

    $('#visualizationControlsSite6').append( $( '<button>' )
                                                            .addClass('btn btn-default')
                                                            .attr('id', 'startVisualizationSite6Button')
                                                            .text('Start')
                                                            .on('click', startVisualizationSite6 )
                                                     );

    // Prepare containers for the chart and the menu on the right side
    d3.select("#visualizationSite6")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#visualizationSite6")
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

function dataProcessingSite6(){
    // Set MenuData (loaded File)
    viualizationSite6Options.lineChart.setMenuData(viualizationSite6Options.loadedFile);

    // Set dataheadername
    if(navigator.userAgent.toLowerCase().indexOf('chrome') > -1){
        viualizationSite6Options.lineChart.setDataHeaderName(d3.entries(viualizationSite6Options.loadedFile[0])[d3.entries(viualizationSite6Options.loadedFile[0]).length-1].key);
    }else if((navigator.userAgent.toLowerCase().indexOf('safari') > -1) || (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)){
        viualizationSite6Options.lineChart.setDataHeaderName(d3.entries(viualizationSite6Options.loadedFile[0])[0].key);
    }else{
        viualizationSite6Options.lineChart.setDataHeaderName(d3.entries(viualizationSite6Options.loadedFile[0])[d3.entries(viualizationSite6Options.loadedFile[0]).length-1].key);
    }

    // Convert Data to match Micha's golden Rule (Do not store data in the keys of a JSON blob.)
    var tempConvertedData;
    var convertedLoadedFile = [];
    for(var k = 0;k<viualizationSite6Options.loadedFile.length;k++){
        tempConvertedData = d3.entries(viualizationSite6Options.loadedFile[k])
        // Remove non-numeric data values
        tempConvertedData = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
        convertedLoadedFile = convertedLoadedFile.concat(tempConvertedData);
    }

    // Convert timelinedata
    var tempTimeLineName;
    var convertedTimeLineData = {};
    for(var k = 0; k<viualizationSite6Options.loadedFile.length; k++){
        if(navigator.userAgent.toLowerCase().indexOf('chrome') > -1){
            tempTimeLineName = d3.entries(viualizationSite6Options.loadedFile[k])[d3.entries(viualizationSite6Options.loadedFile[k]).length-1].value;
        }else if((navigator.userAgent.toLowerCase().indexOf('safari') > -1) || (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)){
            tempTimeLineName = d3.entries(viualizationSite6Options.loadedFile[k])[0].value;
        }else{
            tempTimeLineName = d3.entries(viualizationSite6Options.loadedFile[k])[d3.entries(viualizationSite6Options.loadedFile[k]).length-1].value;
        }
        tempConvertedData = d3.entries(viualizationSite6Options.loadedFile[k]);

        // Remove non-numeric data values
        convertedTimeLineData[tempTimeLineName] = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
    }

    // Set timelineData
    viualizationSite6Options.lineChart.setConvertedTimeLineData(convertedTimeLineData);

    // Set data for Y axes
    var yaxisDataPrim = [];
    $.each(convertedTimeLineData, function(i, v){
        yaxisDataPrim = yaxisDataPrim.concat(v);
    });

    // Add Y data
    viualizationSite6Options.lineChart.setPrimYAxisData(yaxisDataPrim);

    // viualizationSite6Options.lineChart.setSecYAxisData();
    viualizationSite6Options.lineChart.setPrimYAxisLabel('Mortalität pro 100 000 Einwohner');


    // Precalculate UTC Time for performance reasons
    $.each(convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            v[i].keyUTC = Date.UTC(v[i].key,0,1,0,0,0,0);
        }
    });

    // Get selectable years for dateRangeSlider
    viualizationSite6Options.selectableYears = [];

    for(var i = 0;i<convertedLoadedFile.length;i++){
        if($.inArray(convertedLoadedFile[i].key, viualizationSite6Options.selectableYears) === -1) viualizationSite6Options.selectableYears.push(+convertedLoadedFile[i].key);
    }

    viualizationSite6Options.selectableYears = $.unique(viualizationSite6Options.selectableYears.sort()).sort(); 

    var firstYear = Date.UTC(viualizationSite6Options.selectableYears[0],0,1,0,0,0,0);
    var lastYear = Date.UTC(viualizationSite6Options.selectableYears[viualizationSite6Options.selectableYears.length-1],0,1,0,0,0,0);

    viualizationSite6Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite6Options.lineChart.setSelectedYears(firstYear, lastYear);


}

function convertUTCDateToYear(UTCDate) {
    var newDate = new Date(UTCDate);
    return '' + newDate.getUTCFullYear();
}

function loadDataSite6(){
    d3.tsv(viualizationSite6Options.dataFile, function(data){
        viualizationSite6Options.loadedFile = data;
        viualizationSite6Options.lineChart = new lineChart('site6', {pathOnMouseHelper: false});
        viualizationSite6Options.lineChart.setHeadersArrayForSecondaryAxis(['Säuglingssterblichkeit']);
        dataProcessingSite6();
        createVisualizationControlsSite6();
        viualizationSite6Options.lineChart.initialDraw();
        jQuery('#site6 div.key_label').each(function(){
                                                $(this).simulateClick('click');
                                            })
    });
}

function autostartVisualizationSite6(){
    if(!viualizationSite6Options.autostartVisualizationHapped){
        viualizationSite6Options.autostartVisualizationHapped = true;
        startVisualizationSite6();
    }
}

function stopVisualizationSite6(){
    if (typeof viualizationSite6Options.timeIntervall !== "undefined") {
        window.clearInterval(viualizationSite6Options.timeIntervall);
        d3.selectAll("#site6 .timeseries").remove();
        $('#startVisualizationSite6Button').prop('disabled', false);
    }
}

function startVisualizationSite6(){

    if($('#site6 .timeseries').length == 0){
        jQuery('#site6 div.key div').each(function(){$(this).simulateClick('click');})
    }

    viualizationSite6Options.selectedEndYear = 1;

    var firstYear = Date.UTC('1950',0,1,0,0,0,0);
    var lastYear = Date.UTC('1951',0,1,0,0,0,0);

    viualizationSite6Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite6Options.lineChart.setSelectedYears(firstYear, lastYear);
    viualizationSite6Options.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1100});

    $('#startVisualizationSite6Button').prop('disabled', true);

    viualizationSite6Options.timeIntervall = setInterval(function(){
        
        var min = Date.UTC(viualizationSite6Options.selectableYears[0],0,1,0,0,0,0);
        var max = Date.UTC(viualizationSite6Options.selectableYears[viualizationSite6Options.selectedEndYear],0,1,0,0,0,0);
     
        if(!$('#site6 .timeseries').length){
            jQuery('#site6 div.key div').each(function(){$(this).simulateClick('click');})
        }

        if(viualizationSite6Options.selectedEndYear >= viualizationSite6Options.selectableYears.length){
            viualizationSite6Options.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1100});
            window.clearInterval(viualizationSite6Options.timeIntervall);
            jQuery('#site6 div.key div').each(function(){$(this).simulateClick('click');}).each(function(){$(this).simulateClick('click');});
            $('#startVisualizationSite6Button').prop('disabled', false);
        }else{
            viualizationSite6Options.lineChart.setXAxisUTCExtent([min, max]);
            viualizationSite6Options.lineChart.setSelectedYears(min, max);
            viualizationSite6Options.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 1100});
        }

        if(viualizationSite6Options.selectedEndYear > 4){
            viualizationSite6Options.selectedEndYear = viualizationSite6Options.selectedEndYear + 3;
        }else{
            viualizationSite6Options.selectedEndYear = viualizationSite6Options.selectedEndYear + 1;            
        }

    }, 1300);

}

$('#visualizationSite6').ready(function(){
     loadDataSite6();
});
