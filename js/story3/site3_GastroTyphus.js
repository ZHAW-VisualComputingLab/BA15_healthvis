var viualizationSite3_GastroTyphusOptions = {
    dataFile: 'tsv/site3_GastroTyphus.tsv',
    loadedFile: [],
    lineChart: {},
    loadedMarkerData: [],
    selectableYears: [],
    timeIntervall: {},
    selectedEndYear: '',
    autostartVisualizationHapped: false
}

function createVisualizationControlsSite3_GastroTyphus(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite3_GastroTyphus').css('margin-bottom', '25px');
    $('#visualizationControlsSite3_GastroTyphus').append( $('<p>').attr('id', 'displayDateRange').css('display', 'none') );
    // Container for the visual slider
    $('#visualizationControlsSite3_GastroTyphus').append( $('<div>').attr('id', 'displayDateRangeSilder').css({'margin-left': '5px', 'display': 'none'}) );
    // addClass (col-md-3) to limit the width of the slider
    $('#visualizationControlsSite3_GastroTyphus #displayDateRangeSilder').slider({
            min: 0,
            max: (viualizationSite3_GastroTyphusOptions.selectableYears.length-1),
            step: 1,
            values: [ 0, (viualizationSite3_GastroTyphusOptions.selectableYears.length-1) ],
            slide: function( event, ui ) {
                    var min = viualizationSite3_GastroTyphusOptions.selectableYears[ui.values[0]];
                    var max = viualizationSite3_GastroTyphusOptions.selectableYears[ui.values[1]];

                    var firstYear = Date.UTC(min,0,1,0,0,0,0);
                    var lastYear = Date.UTC(max,0,1,0,0,0,0);

                    viualizationSite3_GastroTyphusOptions.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
                    viualizationSite3_GastroTyphusOptions.lineChart.setSelectedYears(firstYear, lastYear);
                    $('#visualizationControlsSite3_GastroTyphus #displayDateRange').text('Zeitraum: ' + min + '-' + max);
                    viualizationSite3_GastroTyphusOptions.lineChart.updateYearRange();
                }
        }).addClass('col-md-3');
    // Set initial selected year range
    viualizationSite3_GastroTyphusOptions.selectedStartYear = viualizationSite3_GastroTyphusOptions.selectableYears[0];
    viualizationSite3_GastroTyphusOptions.selectedEndYear = viualizationSite3_GastroTyphusOptions.selectableYears[(viualizationSite3_GastroTyphusOptions.selectableYears.length-1)];
    $('#visualizationControlsSite3_GastroTyphus #displayDateRange').text('Zeitraum: ' + viualizationSite3_GastroTyphusOptions.selectedStartYear + '-' + viualizationSite3_GastroTyphusOptions.selectedEndYear);

    $('#visualizationControlsSite3_GastroTyphus').append( $( '<button>' )
                                                            .addClass('btn btn-default')
                                                            .attr('id', 'startVisualizationAIDSHepaBButton')
                                                            .text('Start')
                                                            .on('click', startVisualizationSite3_GastroTyphus )
                                                     );

    // Prepare containers for the chart and the menu on the right side
    d3.select("#visualizationSite3_GastroTyphus")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#visualizationSite3_GastroTyphus")
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

function dataProcessingSite3_GastroTyphus(){
    // Set MenuData (loaded File)
    viualizationSite3_GastroTyphusOptions.lineChart.setMenuData(viualizationSite3_GastroTyphusOptions.loadedFile);

    // Set dataheadername
    viualizationSite3_GastroTyphusOptions.lineChart.setDataHeaderName(d3.entries(viualizationSite3_GastroTyphusOptions.loadedFile[0]).sort(sortYearsAscNameFirst)[0].key);

    // Convert Data to match Micha's golden Rule (Do not store data in the keys of a JSON blob.)
    var tempConvertedData;
    var convertedLoadedFile = [];
    for(var k = 0;k<viualizationSite3_GastroTyphusOptions.loadedFile.length;k++){
        tempConvertedData = d3.entries(viualizationSite3_GastroTyphusOptions.loadedFile[k])
        // Remove non-numeric data values
        tempConvertedData = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
        convertedLoadedFile = convertedLoadedFile.concat(tempConvertedData);
    }

    // Convert timelinedata
    var tempTimeLineName;
    var convertedTimeLineData = {};
    for(var k = 0; k<viualizationSite3_GastroTyphusOptions.loadedFile.length; k++){
        tempTimeLineName = d3.entries(viualizationSite3_GastroTyphusOptions.loadedFile[k]).sort(sortYearsAscNameFirst)[0].value;
        tempConvertedData = d3.entries(viualizationSite3_GastroTyphusOptions.loadedFile[k]);
        // Remove non-numeric data values
        convertedTimeLineData[tempTimeLineName] = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
    }

    // Set timelineData
    viualizationSite3_GastroTyphusOptions.lineChart.setConvertedTimeLineData(convertedTimeLineData);

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
    viualizationSite3_GastroTyphusOptions.lineChart.setPrimYAxisData(yaxisDataPrim);
    viualizationSite3_GastroTyphusOptions.lineChart.setSecYAxisData(yaxisDataSek);

    // viualizationSite3_GastroTyphusOptions.lineChart.setSecYAxisData();
    viualizationSite3_GastroTyphusOptions.lineChart.setSecYAxisLabel('Fälle Neuerkrankungen');
    viualizationSite3_GastroTyphusOptions.lineChart.setPrimYAxisLabel('Fälle Neuerkrankungen');


    // Precalculate UTC Time for performance reasons
    $.each(convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            v[i].keyUTC = Date.UTC(v[i].key,0,1,0,0,0,0);
        }
    });

    // Get selectable years for dateRangeSlider
    viualizationSite3_GastroTyphusOptions.selectableYears = [];

    for(var i = 0;i<convertedLoadedFile.length;i++){
        if($.inArray(convertedLoadedFile[i].key, viualizationSite3_GastroTyphusOptions.selectableYears) === -1) viualizationSite3_GastroTyphusOptions.selectableYears.push(+convertedLoadedFile[i].key);
    }

    viualizationSite3_GastroTyphusOptions.selectableYears = $.unique(viualizationSite3_GastroTyphusOptions.selectableYears.sort()).sort(); 

    var firstYear = Date.UTC(viualizationSite3_GastroTyphusOptions.selectableYears[0],0,1,0,0,0,0);
    var lastYear = Date.UTC(viualizationSite3_GastroTyphusOptions.selectableYears[viualizationSite3_GastroTyphusOptions.selectableYears.length-1],0,1,0,0,0,0);

    viualizationSite3_GastroTyphusOptions.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite3_GastroTyphusOptions.lineChart.setSelectedYears(firstYear, lastYear);

    // Process markers
    for(var i = 0;i<viualizationSite3_GastroTyphusOptions.loadedMarkerData.length;i++){
        viualizationSite3_GastroTyphusOptions.loadedMarkerData[i].dateUTC = convertStringDateToJSUTCSite3GastreTyphus(viualizationSite3_GastroTyphusOptions.loadedMarkerData[i].date);
    }
    viualizationSite3_GastroTyphusOptions.lineChart.setMarkerData(viualizationSite3_GastroTyphusOptions.loadedMarkerData);
}

function convertStringDateToJSUTCSite3GastreTyphus(stringDate) {
    return Date.UTC(stringDate.substring(0,4), (stringDate.substring(5,7)-1), stringDate.substring(8,10));
}

function loadDataSite3_GastroTyphus(){
    d3.json('json/lineChartLiveGastroTyphus.json', function(data){
        viualizationSite3_GastroTyphusOptions.loadedMarkerData = data;
    });

    d3.tsv(viualizationSite3_GastroTyphusOptions.dataFile, function(data){
        viualizationSite3_GastroTyphusOptions.loadedFile = data;
        viualizationSite3_GastroTyphusOptions.lineChart = new lineChart('site3_GastroTyphus', {drawSecYAxis: true, drawMarkers: true});
        viualizationSite3_GastroTyphusOptions.lineChart.setHeadersArrayForSecondaryAxis(['Akutegastrointestinale_Infektionen']);
        dataProcessingSite3_GastroTyphus();
        createVisualizationControlsSite3_GastroTyphus();
        viualizationSite3_GastroTyphusOptions.lineChart.initialDraw();
    });
}

function autostartVisualizationSite3(){
    if(!viualizationSite3_GastroTyphusOptions.autostartVisualizationHapped){
        viualizationSite3_GastroTyphusOptions.autostartVisualizationHapped = true;
        startVisualizationSite3_GastroTyphus();
    }else{
        if(!$('#site3_GastroTyphus .timeseries').length){
            var min = Date.UTC(viualizationSite3_GastroTyphusOptions.selectableYears[0],0,1,0,0,0,0);
            var max = Date.UTC(viualizationSite3_GastroTyphusOptions.selectableYears[viualizationSite3_GastroTyphusOptions.selectableYears.length-1],0,1,0,0,0,0);
            viualizationSite3_GastroTyphusOptions.lineChart.setXAxisUTCExtent([min, max]);
            viualizationSite3_GastroTyphusOptions.lineChart.setSelectedYears(min, max);
            viualizationSite3_GastroTyphusOptions.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 1200});
            jQuery('#site3_GastroTyphus div.key div').each(function(){$(this).simulateClick('click');});
        }
    }
}

function stopVisualizationSite3(){
    if (typeof viualizationSite3_GastroTyphusOptions.timeIntervall !== "undefined") {
        window.clearInterval(viualizationSite3_GastroTyphusOptions.timeIntervall);
        d3.selectAll("#site3 .timeseries").remove();
        $('#startVisualizationGastroTyphusButton').prop('disabled', false);
    }
    delete viualizationSite3_GastroTyphusOptions.timeIntervall;
}

function startVisualizationSite3_GastroTyphus(){

    if($('#site3_GastroTyphus .timeseries').length == 0){
        $('#site3_GastroTyphus div.key div').trigger("click");
    }

    viualizationSite3_GastroTyphusOptions.selectedEndYear = 1;

    var firstYear = Date.UTC('1980',0,1,0,0,0,0);
    var lastYear = Date.UTC('1981',0,1,0,0,0,0);

    viualizationSite3_GastroTyphusOptions.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite3_GastroTyphusOptions.lineChart.setSelectedYears(firstYear, lastYear);
    viualizationSite3_GastroTyphusOptions.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1200});

    $('#startVisualizationGastroTyphusButton').prop('disabled', true);

    viualizationSite3_GastroTyphusOptions.timeIntervall = setInterval(function(){
        
        var min = Date.UTC(viualizationSite3_GastroTyphusOptions.selectableYears[0],0,1,0,0,0,0);
        var max = Date.UTC(viualizationSite3_GastroTyphusOptions.selectableYears[viualizationSite3_GastroTyphusOptions.selectedEndYear],0,1,0,0,0,0);
     
        if(!$('#site3_GastroTyphus .timeseries').length){
            jQuery('#site3_GastroTyphus div.key div').each(function(){$(this).simulateClick('click');});
        }

        if(viualizationSite3_GastroTyphusOptions.selectedEndYear >= viualizationSite3_GastroTyphusOptions.selectableYears.length){
            viualizationSite3_GastroTyphusOptions.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1000});
            window.clearInterval(viualizationSite3_GastroTyphusOptions.timeIntervall);
            jQuery('#site3_GastroTyphus div.key div').each(function(){$(this).simulateClick('click');}).each(function(){$(this).simulateClick('click');});
            $('#startVisualizationGastroTyphusButton').prop('disabled', false);
        }else{
            viualizationSite3_GastroTyphusOptions.lineChart.setXAxisUTCExtent([min, max]);
            viualizationSite3_GastroTyphusOptions.lineChart.setSelectedYears(min, max);
            viualizationSite3_GastroTyphusOptions.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 1200});
        }

        viualizationSite3_GastroTyphusOptions.selectedEndYear++;            

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


$('#visualizationSite3_GastroTyphus').ready(function(){
     loadDataSite3_GastroTyphus();
});