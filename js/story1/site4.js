var viualizationSite4Options = {
    dataFile: 'tsv/Mortalitaet/site4.tsv',
    loadedFile: [],
    lineChart: {},
    selectableYears: [],
    autostartVisualizationHapped: false
}

function createVisualizationControlsSite4(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite4').css('margin-bottom', '25px');
    $('#visualizationControlsSite4').append( $('<p>').attr('id', 'displayDateRange').css('display', 'none') );
    // Container for the visual slider
    $('#visualizationControlsSite4').append( $('<div>').attr('id', 'displayDateRangeSilder').css({'margin-left': '5px', 'display': 'none'}) );
    // addClass (col-md-3) to limit the width of the slider
    $('#visualizationControlsSite4 #displayDateRangeSilder').slider({
            min: 0,
            max: (viualizationSite4Options.selectableYears.length-1),
            step: 1,
            values: [ 0, (viualizationSite4Options.selectableYears.length-1) ],
            slide: function( event, ui ) {
                    var min = viualizationSite4Options.selectableYears[ui.values[0]];
                    var max = viualizationSite4Options.selectableYears[ui.values[1]];

                    var firstYear = Date.UTC(min,0,1,0,0,0,0);
                    var lastYear = Date.UTC(max,0,1,0,0,0,0);

                    viualizationSite4Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
                    viualizationSite4Options.lineChart.setSelectedYears(firstYear, lastYear);
                    $('#visualizationControlsSite4 #displayDateRange').text('Zeitraum: ' + min + '-' + max);
                    viualizationSite4Options.lineChart.updateYearRange();
                }
        }).addClass('col-md-3');
    // Set initial selected year range
    viualizationSite4Options.selectedStartYear = viualizationSite4Options.selectableYears[0];
    viualizationSite4Options.selectedEndYear = viualizationSite4Options.selectableYears[(viualizationSite4Options.selectableYears.length-1)];
    $('#visualizationControlsSite4 #displayDateRange').text('Zeitraum: ' + convertUTCDateToYear(viualizationSite4Options.selectedStartYear) + '-' + convertUTCDateToYear(viualizationSite4Options.selectedEndYear));

    $('#visualizationControlsSite4').append( $( '<button>' )
                                                            .addClass('btn btn-default')
                                                            .attr('id', 'startVisualizationSite4Button')
                                                            .text('Start')
                                                            .on('click', startVisualizationSite4 )
                                                     );

    // Prepare containers for the chart and the menu on the right side
    d3.select("#visualizationSite4")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#visualizationSite4")
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

function dataProcessingSite4(){
    // Set MenuData (loaded File)
    viualizationSite4Options.lineChart.setMenuData(viualizationSite4Options.loadedFile);

    // Set dataheadername
    viualizationSite4Options.lineChart.setDataHeaderName(d3.entries(viualizationSite4Options.loadedFile[0]).sort(sortYearsAscNameFirst)[0].key);

    // Convert Data to match Micha's golden Rule (Do not store data in the keys of a JSON blob.)
    var tempConvertedData;
    var convertedLoadedFile = [];
    for(var k = 0;k<viualizationSite4Options.loadedFile.length;k++){
        tempConvertedData = d3.entries(viualizationSite4Options.loadedFile[k])
        // Remove non-numeric data values
        tempConvertedData = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
        convertedLoadedFile = convertedLoadedFile.concat(tempConvertedData);
    }

    // Convert timelinedata
    var tempTimeLineName;
    var convertedTimeLineData = {};
    for(var k = 0; k<viualizationSite4Options.loadedFile.length; k++){
        tempTimeLineName = d3.entries(viualizationSite4Options.loadedFile[k]).sort(sortYearsAscNameFirst)[0].value;
        tempConvertedData = d3.entries(viualizationSite4Options.loadedFile[k]);

        // Remove non-numeric data values
        convertedTimeLineData[tempTimeLineName] = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
    }

    // Set timelineData
    viualizationSite4Options.lineChart.setConvertedTimeLineData(convertedTimeLineData);

    // Set data for Y axes
    var yaxisDataPrim = [];
    $.each(convertedTimeLineData, function(i, v){
        yaxisDataPrim = yaxisDataPrim.concat(v);
    });

    // Add Y data
    viualizationSite4Options.lineChart.setPrimYAxisData(yaxisDataPrim);

    // viualizationSite4Options.lineChart.setSecYAxisData();
    viualizationSite4Options.lineChart.setPrimYAxisLabel('Mortalität pro 100 000 Einwohner');


    // Precalculate UTC Time for performance reasons
    $.each(convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            v[i].keyUTC = Date.UTC(v[i].key,0,1,0,0,0,0);
        }
    });

    // Get selectable years for dateRangeSlider
    viualizationSite4Options.selectableYears = [];

    for(var i = 0;i<convertedLoadedFile.length;i++){
        if($.inArray(convertedLoadedFile[i].key, viualizationSite4Options.selectableYears) === -1) viualizationSite4Options.selectableYears.push(+convertedLoadedFile[i].key);
    }

    viualizationSite4Options.selectableYears = $.unique(viualizationSite4Options.selectableYears.sort()).sort(); 

    var firstYear = Date.UTC(viualizationSite4Options.selectableYears[0],0,1,0,0,0,0);
    var lastYear = Date.UTC(viualizationSite4Options.selectableYears[viualizationSite4Options.selectableYears.length-1],0,1,0,0,0,0);

    viualizationSite4Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite4Options.lineChart.setSelectedYears(firstYear, lastYear);


}

function convertUTCDateToYear(UTCDate) {
    var newDate = new Date(UTCDate);
    return '' + newDate.getUTCFullYear();
}

function loadDataSite4(){
    d3.tsv(viualizationSite4Options.dataFile, function(data){
        viualizationSite4Options.loadedFile = data;
        viualizationSite4Options.lineChart = new lineChart('site4', {pathOnMouseHelper: false});
        viualizationSite4Options.lineChart.setHeadersArrayForSecondaryAxis(['Säuglingssterblichkeit']);
        dataProcessingSite4();
        createVisualizationControlsSite4();
        viualizationSite4Options.lineChart.initialDraw();
        jQuery('#site4 div.key_label').each(function(){
                                                $(this).simulateClick('click');
                                            })
    });
}

function autostartVisualizationSite4(){
    if(!viualizationSite4Options.autostartVisualizationHapped){
        viualizationSite4Options.autostartVisualizationHapped = true;
        startVisualizationSite4();
    }
}

function stopVisualizationSite4(){
    if (typeof viualizationSite4Options.timeIntervall !== "undefined") {
        window.clearInterval(viualizationSite4Options.timeIntervall);
        d3.selectAll("#site4 .timeseries").remove();
        $('#startVisualizationSite4Button').prop('disabled', false);
    }
}

function startVisualizationSite4(){

    if($('#site4 .timeseries').length == 0){
        jQuery('#site4 div.key_label').each(function(){$(this).simulateClick('click');});
    }

    viualizationSite4Options.selectedEndYear = 1;

    var firstYear = Date.UTC('1950',0,1,0,0,0,0);
    var lastYear = Date.UTC('1951',0,1,0,0,0,0);

    viualizationSite4Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite4Options.lineChart.setSelectedYears(firstYear, lastYear);
    viualizationSite4Options.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1100});

    $('#startVisualizationSite4Button').prop('disabled', true);

    viualizationSite4Options.timeIntervall = setInterval(function(){
        
        var min = Date.UTC(viualizationSite4Options.selectableYears[0],0,1,0,0,0,0);
        var max = Date.UTC(viualizationSite4Options.selectableYears[viualizationSite4Options.selectedEndYear],0,1,0,0,0,0);
     
        if(!$('#site4 .timeseries').length){
            jQuery('#site4 div.key_label').each(function(){$(this).simulateClick('click');});
        }

        if(viualizationSite4Options.selectedEndYear >= viualizationSite4Options.selectableYears.length){
            viualizationSite4Options.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1100});
            window.clearInterval(viualizationSite4Options.timeIntervall);
            jQuery('#site4 div.key_label').each(function(){$(this).simulateClick('click');}).each(function(){$(this).simulateClick('click');});
            $('#startVisualizationSite4Button').prop('disabled', false);
        }else{
            viualizationSite4Options.lineChart.setXAxisUTCExtent([min, max]);
            viualizationSite4Options.lineChart.setSelectedYears(min, max);
            viualizationSite4Options.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 1100});
        }

        if(viualizationSite4Options.selectedEndYear > 4){
            viualizationSite4Options.selectedEndYear = viualizationSite4Options.selectedEndYear + 3;
        }else{
            viualizationSite4Options.selectedEndYear = viualizationSite4Options.selectedEndYear + 1;            
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

$('#visualizationSite4').ready(function(){
     loadDataSite4();
});
