var viualizationSite2Options = {
    dataFile: 'tsv/Mortalitaet/site2.tsv',
    loadedFile: [],
    lineChart: {},
    selectableYears: [],
    autostartVisualizationHapped: false
}

function createVisualizationControlsSite2(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite2').css('margin-bottom', '25px');
    $('#visualizationControlsSite2').append( $('<p>').attr('id', 'displayDateRange').css('display', 'none') );
    // Container for the visual slider
    $('#visualizationControlsSite2').append( $('<div>').attr('id', 'displayDateRangeSilder').css({'margin-left': '5px', 'display': 'none'}) );
    // addClass (col-md-3) to limit the width of the slider
    $('#visualizationControlsSite2 #displayDateRangeSilder').slider({
            min: 0,
            max: (viualizationSite2Options.selectableYears.length-1),
            step: 1,
            values: [ 0, (viualizationSite2Options.selectableYears.length-1) ],
            slide: function( event, ui ) {
                    var min = viualizationSite2Options.selectableYears[ui.values[0]];
                    var max = viualizationSite2Options.selectableYears[ui.values[1]];

                    var firstYear = Date.UTC(min,0,1,0,0,0,0);
                    var lastYear = Date.UTC(max,0,1,0,0,0,0);

                    viualizationSite2Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
                    viualizationSite2Options.lineChart.setSelectedYears(firstYear, lastYear);
                    $('#visualizationControlsSite2 #displayDateRange').text('Zeitraum: ' + min + '-' + max);
                    viualizationSite2Options.lineChart.updateYearRange();
                }
        }).addClass('col-md-3');
    // Set initial selected year range
    viualizationSite2Options.selectedStartYear = viualizationSite2Options.selectableYears[0];
    viualizationSite2Options.selectedEndYear = viualizationSite2Options.selectableYears[(viualizationSite2Options.selectableYears.length-1)];
    $('#visualizationControlsSite2 #displayDateRange').text('Zeitraum: ' + convertUTCDateToYear(viualizationSite2Options.selectedStartYear) + '-' + convertUTCDateToYear(viualizationSite2Options.selectedEndYear));

    $('#visualizationControlsSite2').append( $( '<button>' )
                                                            .addClass('btn btn-default')
                                                            .attr('id', 'startVisualizationSite2Button')
                                                            .text('Start')
                                                            .on('click', startVisualizationSite2 )
                                                     );

    // Prepare containers for the chart and the menu on the right side
    d3.select("#visualizationSite2")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#visualizationSite2")
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

function dataProcessingSite2(){
    // Set MenuData (loaded File)
    viualizationSite2Options.lineChart.setMenuData(viualizationSite2Options.loadedFile);

    // Set dataheadername
    viualizationSite2Options.lineChart.setDataHeaderName(d3.entries(viualizationSite2Options.loadedFile[0]).sort(sortYearsAscNameFirst)[0].key);

    // Convert Data to match Micha's golden Rule (Do not store data in the keys of a JSON blob.)
    var tempConvertedData;
    var convertedLoadedFile = [];
    for(var k = 0;k<viualizationSite2Options.loadedFile.length;k++){
        tempConvertedData = d3.entries(viualizationSite2Options.loadedFile[k])
        // Remove non-numeric data values
        tempConvertedData = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
        convertedLoadedFile = convertedLoadedFile.concat(tempConvertedData);
    }

    // Convert timelinedata
    var tempTimeLineName;
    var convertedTimeLineData = {};
    for(var k = 0; k<viualizationSite2Options.loadedFile.length; k++){
        tempTimeLineName = d3.entries(viualizationSite2Options.loadedFile[k]).sort(sortYearsAscNameFirst)[0].value;
        tempConvertedData = d3.entries(viualizationSite2Options.loadedFile[k]);

        // Remove non-numeric data values
        convertedTimeLineData[tempTimeLineName] = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
    }

    // Set timelineData
    viualizationSite2Options.lineChart.setConvertedTimeLineData(convertedTimeLineData);

    // Set data for Y axes
    var yaxisDataPrim = [];
    $.each(convertedTimeLineData, function(i, v){
        yaxisDataPrim = yaxisDataPrim.concat(v);
    });

    // Add Y data
    viualizationSite2Options.lineChart.setPrimYAxisData(yaxisDataPrim);

    // viualizationSite2Options.lineChart.setSecYAxisData();
    viualizationSite2Options.lineChart.setPrimYAxisLabel('Mortalität pro 100 000 Einwohner');


    // Precalculate UTC Time for performance reasons
    $.each(convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            v[i].keyUTC = Date.UTC(v[i].key,0,1,0,0,0,0);
        }
    });

    // Get selectable years for dateRangeSlider
    viualizationSite2Options.selectableYears = [];

    for(var i = 0;i<convertedLoadedFile.length;i++){
        if($.inArray(convertedLoadedFile[i].key, viualizationSite2Options.selectableYears) === -1) viualizationSite2Options.selectableYears.push(+convertedLoadedFile[i].key);
    }

    viualizationSite2Options.selectableYears = $.unique(viualizationSite2Options.selectableYears.sort()).sort(); 

    var firstYear = Date.UTC(viualizationSite2Options.selectableYears[0],0,1,0,0,0,0);
    var lastYear = Date.UTC(viualizationSite2Options.selectableYears[viualizationSite2Options.selectableYears.length-1],0,1,0,0,0,0);

    viualizationSite2Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite2Options.lineChart.setSelectedYears(firstYear, lastYear);


}

function convertUTCDateToYear(UTCDate) {
    var newDate = new Date(UTCDate);
    return '' + newDate.getUTCFullYear();
}

function loadDataSite2(){
    d3.tsv(viualizationSite2Options.dataFile, function(data){
        viualizationSite2Options.loadedFile = data;
        viualizationSite2Options.lineChart = new lineChart('site2', {pathOnMouseHelper: false});
        viualizationSite2Options.lineChart.setHeadersArrayForSecondaryAxis(['Säuglingssterblichkeit']);
        dataProcessingSite2();
        createVisualizationControlsSite2();
        viualizationSite2Options.lineChart.initialDraw();
        jQuery('#site2 div.key_label').each(function(){
                                                $(this).simulateClick('click');
                                            })
    });
}

function autostartVisualizationSite2(){
    if(!viualizationSite2Options.autostartVisualizationHapped){
        viualizationSite2Options.autostartVisualizationHapped = true;
        startVisualizationSite2();
    }
}

function stopVisualizationSite2(){
    if (typeof viualizationSite2Options.timeIntervall !== "undefined") {
        window.clearInterval(viualizationSite2Options.timeIntervall);
        d3.selectAll("#site2 .timeseries").remove();
        $('#startVisualizationSite2Button').prop('disabled', false);
    }
}

function startVisualizationSite2(){

    if($('#site2 .timeseries').length == 0){
        jQuery('#site2 div.key_label').each(function(){$(this).simulateClick('click');})
    }


    viualizationSite2Options.selectedEndYear = 1;

    var firstYear = Date.UTC('1950',0,1,0,0,0,0);
    var lastYear = Date.UTC('1951',0,1,0,0,0,0);

    viualizationSite2Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite2Options.lineChart.setSelectedYears(firstYear, lastYear);
    viualizationSite2Options.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1100});

    $('#startVisualizationSite2Button').prop('disabled', true);

    viualizationSite2Options.timeIntervall = setInterval(function(){
        
        var min = Date.UTC(viualizationSite2Options.selectableYears[0],0,1,0,0,0,0);
        var max = Date.UTC(viualizationSite2Options.selectableYears[viualizationSite2Options.selectedEndYear],0,1,0,0,0,0);
        
        if(!$('#site2 .timeseries').length){
            jQuery('#site2 div.key_label').each(function(){$(this).simulateClick('click');});
        }

        if(viualizationSite2Options.selectedEndYear >= viualizationSite2Options.selectableYears.length){
            viualizationSite2Options.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1100});
            window.clearInterval(viualizationSite2Options.timeIntervall);
            jQuery('#site2 div.key_label').each(function(){$(this).simulateClick('click');}).each(function(){$(this).simulateClick('click');});
            $('#startVisualizationSite2Button').prop('disabled', false);
        }else{
            viualizationSite2Options.lineChart.setXAxisUTCExtent([min, max]);
            viualizationSite2Options.lineChart.setSelectedYears(min, max);
            viualizationSite2Options.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 1100});
        }

        if(viualizationSite2Options.selectedEndYear > 4){
            viualizationSite2Options.selectedEndYear = viualizationSite2Options.selectedEndYear + 3;
        }else{
            viualizationSite2Options.selectedEndYear = viualizationSite2Options.selectedEndYear + 1;            
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

$('#visualizationSite2').ready(function(){
     loadDataSite2();
});
