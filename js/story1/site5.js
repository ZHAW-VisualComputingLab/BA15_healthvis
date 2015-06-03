var viualizationSite5Options = {
    dataFile: 'tsv/Mortalitaet/site5.tsv',
    loadedFile: [],
    lineChart: {},
    selectableYears: [],
    autostartVisualizationHapped: false
}

function createVisualizationControlsSite5(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite5').css('margin-bottom', '25px');
    $('#visualizationControlsSite5').append( $('<p>').attr('id', 'displayDateRange').css('display', 'none') );
    // Container for the visual slider
    $('#visualizationControlsSite5').append( $('<div>').attr('id', 'displayDateRangeSilder').css({'margin-left': '5px', 'display': 'none'}) );
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
    $('#visualizationControlsSite5 #displayDateRange').text('Zeitraum: ' + convertUTCDateToYear(viualizationSite5Options.selectedStartYear) + '-' + convertUTCDateToYear(viualizationSite5Options.selectedEndYear));

    $('#visualizationControlsSite5').append( $( '<button>' )
                                                            .addClass('btn btn-default')
                                                            .attr('id', 'startVisualizationSite5Button')
                                                            .text('Start')
                                                            .on('click', startVisualizationSite5 )
                                                     );

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
    $.each(convertedTimeLineData, function(i, v){
        yaxisDataPrim = yaxisDataPrim.concat(v);
    });

    // Add Y data
    viualizationSite5Options.lineChart.setPrimYAxisData(yaxisDataPrim);

    // viualizationSite5Options.lineChart.setSecYAxisData();
    viualizationSite5Options.lineChart.setPrimYAxisLabel('Mortalität pro 100 000 Einwohner');


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

    viualizationSite5Options.selectableYears = $.unique(viualizationSite5Options.selectableYears.sort()).sort(); 

    var firstYear = Date.UTC(viualizationSite5Options.selectableYears[0],0,1,0,0,0,0);
    var lastYear = Date.UTC(viualizationSite5Options.selectableYears[viualizationSite5Options.selectableYears.length-1],0,1,0,0,0,0);

    viualizationSite5Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite5Options.lineChart.setSelectedYears(firstYear, lastYear);


}

function convertUTCDateToYear(UTCDate) {
    var newDate = new Date(UTCDate);
    return '' + newDate.getUTCFullYear();
}

function loadDataSite5(){
    d3.tsv(viualizationSite5Options.dataFile, function(data){
        viualizationSite5Options.loadedFile = data;
        viualizationSite5Options.lineChart = new lineChart('site5', {pathOnMouseHelper: false});
        viualizationSite5Options.lineChart.setHeadersArrayForSecondaryAxis(['Säuglingssterblichkeit']);
        dataProcessingSite5();
        createVisualizationControlsSite5();
        viualizationSite5Options.lineChart.initialDraw();
        jQuery('#site5 div.key_label').each(function(){
                                                $(this).simulateClick('click');
                                            })
    });
}

function autostartVisualizationSite5(){
    if(!viualizationSite5Options.autostartVisualizationHapped){
        viualizationSite5Options.autostartVisualizationHapped = true;
        startVisualizationSite5();
    }
}

function stopVisualizationSite5(){
    if (typeof viualizationSite5Options.timeIntervall !== "undefined") {
        window.clearInterval(viualizationSite5Options.timeIntervall);
        d3.selectAll("#site5 .timeseries").remove();
        $('#startVisualizationSite5Button').prop('disabled', false);
    }
}

function startVisualizationSite5(){

    if($('#site5 .timeseries').length == 0){
        jQuery('#site5 div.key div').each(function(){$(this).simulateClick('click');});
    }

    viualizationSite5Options.selectedEndYear = 1;

    var firstYear = Date.UTC('1950',0,1,0,0,0,0);
    var lastYear = Date.UTC('1951',0,1,0,0,0,0);

    viualizationSite5Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite5Options.lineChart.setSelectedYears(firstYear, lastYear);
    viualizationSite5Options.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1100});

    $('#startVisualizationSite5Button').prop('disabled', true);

    viualizationSite5Options.timeIntervall = setInterval(function(){
        
        var min = Date.UTC(viualizationSite5Options.selectableYears[0],0,1,0,0,0,0);
        var max = Date.UTC(viualizationSite5Options.selectableYears[viualizationSite5Options.selectedEndYear],0,1,0,0,0,0);
     
        if(!$('#site5 .timeseries').length){
            jQuery('#site5 div.key div').each(function(){$(this).simulateClick('click');});
        }

        if(viualizationSite5Options.selectedEndYear >= viualizationSite5Options.selectableYears.length){
            viualizationSite5Options.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1100});
            window.clearInterval(viualizationSite5Options.timeIntervall);
            jQuery('#site5 div.key div').each(function(){$(this).simulateClick('click');}).each(function(){$(this).simulateClick('click');});
            $('#startVisualizationSite5Button').prop('disabled', false);
        }else{
            viualizationSite5Options.lineChart.setXAxisUTCExtent([min, max]);
            viualizationSite5Options.lineChart.setSelectedYears(min, max);
            viualizationSite5Options.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 1100});
        }

        if(viualizationSite5Options.selectedEndYear > 4){
            viualizationSite5Options.selectedEndYear = viualizationSite5Options.selectedEndYear + 3;
        }else{
            viualizationSite5Options.selectedEndYear = viualizationSite5Options.selectedEndYear + 1;            
        }

    }, 1300);

}

$('#visualizationSite5').ready(function(){
     loadDataSite5();
});
