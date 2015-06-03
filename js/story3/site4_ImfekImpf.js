var viualizationSite4_ImfekImpfOptions = {
    dataFile: 'tsv/site3_ImfekImpf.tsv',
    loadedFile: [],
    lineChart: {},
    loadedMarkerData: [],
    selectableYears: [],
    timeIntervall: {},
    selectedEndYear: '',
    autostartVisualizationHapped: false
}

function createVisualizationControlsSite4_ImfekImpf(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite4_ImfekImpf').css('margin-bottom', '25px');
    $('#visualizationControlsSite4_ImfekImpf').append( $('<p>').attr('id', 'displayDateRange').css('display', 'none') );
    // Container for the visual slider
    $('#visualizationControlsSite4_ImfekImpf').append( $('<div>').attr('id', 'displayDateRangeSilder').css({'margin-left': '5px', 'display': 'none'}) );
    // addClass (col-md-3) to limit the width of the slider
    $('#visualizationControlsSite4_ImfekImpf #displayDateRangeSilder').slider({
            min: 0,
            max: (viualizationSite4_ImfekImpfOptions.selectableYears.length-1),
            step: 1,
            values: [ 0, (viualizationSite4_ImfekImpfOptions.selectableYears.length-1) ],
            slide: function( event, ui ) {
                    var min = viualizationSite4_ImfekImpfOptions.selectableYears[ui.values[0]];
                    var max = viualizationSite4_ImfekImpfOptions.selectableYears[ui.values[1]];

                    var firstYear = Date.UTC(min,0,1,0,0,0,0);
                    var lastYear = Date.UTC(max,0,1,0,0,0,0);

                    viualizationSite4_ImfekImpfOptions.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
                    viualizationSite4_ImfekImpfOptions.lineChart.setSelectedYears(firstYear, lastYear);
                    $('#visualizationControlsSite4_ImfekImpf #displayDateRange').text('Zeitraum: ' + min + '-' + max);
                    viualizationSite4_ImfekImpfOptions.lineChart.updateYearRange();
                }
        }).addClass('col-md-3');
    // Set initial selected year range
    viualizationSite4_ImfekImpfOptions.selectedStartYear = viualizationSite4_ImfekImpfOptions.selectableYears[0];
    viualizationSite4_ImfekImpfOptions.selectedEndYear = viualizationSite4_ImfekImpfOptions.selectableYears[(viualizationSite4_ImfekImpfOptions.selectableYears.length-1)];
    $('#visualizationControlsSite4_ImfekImpf #displayDateRange').text('Zeitraum: ' + viualizationSite4_ImfekImpfOptions.selectedStartYear + '-' + viualizationSite4_ImfekImpfOptions.selectedEndYear);

    $('#visualizationControlsSite4_ImfekImpf').append( $( '<button>' )
                                                            .addClass('btn btn-default')
                                                            .attr('id', 'startVisualizationAIDSHepaBButton')
                                                            .text('Start')
                                                            .on('click', startVisualizationSite4_ImfekImpf )
                                                     );

    // Prepare containers for the chart and the menu on the right side
    d3.select("#visualizationSite4_ImfekImpf")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#visualizationSite4_ImfekImpf")
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

function dataProcessingSite4_ImfekImpf(){
    // Set MenuData (loaded File)
    viualizationSite4_ImfekImpfOptions.lineChart.setMenuData(viualizationSite4_ImfekImpfOptions.loadedFile);

    // Set dataheadername
    if(navigator.userAgent.toLowerCase().indexOf('chrome') > -1){
        viualizationSite4_ImfekImpfOptions.lineChart.setDataHeaderName(d3.entries(viualizationSite4_ImfekImpfOptions.loadedFile[0])[d3.entries(viualizationSite4_ImfekImpfOptions.loadedFile[0]).length-1].key);
    }else if((navigator.userAgent.toLowerCase().indexOf('safari') > -1) || (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)){
        viualizationSite4_ImfekImpfOptions.lineChart.setDataHeaderName(d3.entries(viualizationSite4_ImfekImpfOptions.loadedFile[0])[0].key);
    }else{
        viualizationSite4_ImfekImpfOptions.lineChart.setDataHeaderName(d3.entries(viualizationSite4_ImfekImpfOptions.loadedFile[0])[d3.entries(viualizationSite4_ImfekImpfOptions.loadedFile[0]).length-1].key);
    }

    // Convert Data to match Micha's golden Rule (Do not store data in the keys of a JSON blob.)
    var tempConvertedData;
    var convertedLoadedFile = [];
    for(var k = 0;k<viualizationSite4_ImfekImpfOptions.loadedFile.length;k++){
        tempConvertedData = d3.entries(viualizationSite4_ImfekImpfOptions.loadedFile[k])
        // Remove non-numeric data values
        tempConvertedData = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
        convertedLoadedFile = convertedLoadedFile.concat(tempConvertedData);
    }

    // Convert timelinedata
    var tempTimeLineName;
    var convertedTimeLineData = {};
    for(var k = 0; k<viualizationSite4_ImfekImpfOptions.loadedFile.length; k++){
        if(navigator.userAgent.toLowerCase().indexOf('chrome') > -1){
            tempTimeLineName = d3.entries(viualizationSite4_ImfekImpfOptions.loadedFile[k])[d3.entries(viualizationSite4_ImfekImpfOptions.loadedFile[k]).length-1].value;
        }else if((navigator.userAgent.toLowerCase().indexOf('safari') > -1) || (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)){
            tempTimeLineName = d3.entries(viualizationSite4_ImfekImpfOptions.loadedFile[k])[0].value;
        }else{
            tempTimeLineName = d3.entries(viualizationSite4_ImfekImpfOptions.loadedFile[k])[d3.entries(viualizationSite4_ImfekImpfOptions.loadedFile[k]).length-1].value;
        }
        tempConvertedData = d3.entries(viualizationSite4_ImfekImpfOptions.loadedFile[k]);
        // Remove non-numeric data values
        convertedTimeLineData[tempTimeLineName] = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
    }

    // Set timelineData
    viualizationSite4_ImfekImpfOptions.lineChart.setConvertedTimeLineData(convertedTimeLineData);

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
    viualizationSite4_ImfekImpfOptions.lineChart.setPrimYAxisData(yaxisDataPrim);
    viualizationSite4_ImfekImpfOptions.lineChart.setSecYAxisData(yaxisDataSek);

    // viualizationSite4_ImfekImpfOptions.lineChart.setSecYAxisData();
    viualizationSite4_ImfekImpfOptions.lineChart.setSecYAxisLabel('Fälle Neuerkrankungen');
    viualizationSite4_ImfekImpfOptions.lineChart.setPrimYAxisLabel('Fälle Neuerkrankungen');


    // Precalculate UTC Time for performance reasons
    $.each(convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            v[i].keyUTC = Date.UTC(v[i].key,0,1,0,0,0,0);
        }
    });

    // Get selectable years for dateRangeSlider
    viualizationSite4_ImfekImpfOptions.selectableYears = [];

    for(var i = 0;i<convertedLoadedFile.length;i++){
        if($.inArray(convertedLoadedFile[i].key, viualizationSite4_ImfekImpfOptions.selectableYears) === -1) viualizationSite4_ImfekImpfOptions.selectableYears.push(+convertedLoadedFile[i].key);
    }

    viualizationSite4_ImfekImpfOptions.selectableYears = $.unique(viualizationSite4_ImfekImpfOptions.selectableYears.sort()).sort(); 

    var firstYear = Date.UTC(viualizationSite4_ImfekImpfOptions.selectableYears[0],0,1,0,0,0,0);
    var lastYear = Date.UTC(viualizationSite4_ImfekImpfOptions.selectableYears[viualizationSite4_ImfekImpfOptions.selectableYears.length-1],0,1,0,0,0,0);

    viualizationSite4_ImfekImpfOptions.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite4_ImfekImpfOptions.lineChart.setSelectedYears(firstYear, lastYear);

    // Process markers
    for(var i = 0;i<viualizationSite4_ImfekImpfOptions.loadedMarkerData.length;i++){
        viualizationSite4_ImfekImpfOptions.loadedMarkerData[i].dateUTC = convertStringDateToJSUTCSite4ImfekImpf(viualizationSite4_ImfekImpfOptions.loadedMarkerData[i].date);
    }
    viualizationSite4_ImfekImpfOptions.lineChart.setMarkerData(viualizationSite4_ImfekImpfOptions.loadedMarkerData);
}

function loadDataSite4_ImfekImpf(){
    d3.json('json/lineChartLiveInfekImpf.json', function(data){
        viualizationSite4_ImfekImpfOptions.loadedMarkerData = data;
    });
    
    d3.tsv(viualizationSite4_ImfekImpfOptions.dataFile, function(data){
        viualizationSite4_ImfekImpfOptions.loadedFile = data;
        viualizationSite4_ImfekImpfOptions.lineChart = new lineChart('site4_ImfekImpf', {drawSecYAxis: true, drawMarkers: true});
        viualizationSite4_ImfekImpfOptions.lineChart.setHeadersArrayForSecondaryAxis(['Tuberkulose']);
        dataProcessingSite4_ImfekImpf();
        createVisualizationControlsSite4_ImfekImpf();
        viualizationSite4_ImfekImpfOptions.lineChart.initialDraw();
    });
}

function convertStringDateToJSUTCSite4ImfekImpf(stringDate) {
    return Date.UTC(stringDate.substring(0,4), (stringDate.substring(5,7)-1), stringDate.substring(8,10));
}

function autostartVisualizationSite4(){
    if(!viualizationSite4_ImfekImpfOptions.autostartVisualizationHapped){
        viualizationSite4_ImfekImpfOptions.autostartVisualizationHapped = true;
        startVisualizationSite4_ImfekImpf();
    }else{
        if(!$('#site4_ImfekImpf .timeseries').length){
            var min = Date.UTC(viualizationSite4_ImfekImpfOptions.selectableYears[0],0,1,0,0,0,0);
            var max = Date.UTC(viualizationSite4_ImfekImpfOptions.selectableYears[viualizationSite4_ImfekImpfOptions.selectableYears.length-1],0,1,0,0,0,0);
            viualizationSite4_ImfekImpfOptions.lineChart.setXAxisUTCExtent([min, max]);
            viualizationSite4_ImfekImpfOptions.lineChart.setSelectedYears(min, max);
            viualizationSite4_ImfekImpfOptions.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 1200});
            jQuery('#site4_ImfekImpf div.key div').each(function(){$(this).simulateClick('click');});
        }
    }
}

function stopVisualizationSite4(){
    if (typeof viualizationSite4_ImfekImpfOptions.timeIntervall !== "undefined") {
        window.clearInterval(viualizationSite4_ImfekImpfOptions.timeIntervall);
        d3.selectAll("#site4 .timeseries").remove();
        $('#startVisualizationImfekImpfButton').prop('disabled', false);
    }
    delete viualizationSite4_ImfekImpfOptions.timeIntervall;
}

function startVisualizationSite4_ImfekImpf(){

    if($('#site4_ImfekImpf .timeseries').length == 0){
        $('#site4_ImfekImpf div.key div').trigger("click");
    }

    viualizationSite4_ImfekImpfOptions.selectedEndYear = 1;

    var firstYear = Date.UTC('1980',0,1,0,0,0,0);
    var lastYear = Date.UTC('1981',0,1,0,0,0,0);

    viualizationSite4_ImfekImpfOptions.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite4_ImfekImpfOptions.lineChart.setSelectedYears(firstYear, lastYear);
    viualizationSite4_ImfekImpfOptions.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1200});

    $('#startVisualizationImfekImpfButton').prop('disabled', true);

    viualizationSite4_ImfekImpfOptions.timeIntervall = setInterval(function(){
        
        var min = Date.UTC(viualizationSite4_ImfekImpfOptions.selectableYears[0],0,1,0,0,0,0);
        var max = Date.UTC(viualizationSite4_ImfekImpfOptions.selectableYears[viualizationSite4_ImfekImpfOptions.selectedEndYear],0,1,0,0,0,0);
     
        if(!$('#site4_ImfekImpf .timeseries').length){
            jQuery('#site4_ImfekImpf div.key div').each(function(){$(this).simulateClick('click');});
        }

        if(viualizationSite4_ImfekImpfOptions.selectedEndYear >= viualizationSite4_ImfekImpfOptions.selectableYears.length){
            viualizationSite4_ImfekImpfOptions.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1000});
            window.clearInterval(viualizationSite4_ImfekImpfOptions.timeIntervall);
            jQuery('#site4_ImfekImpf div#key div').each(function(){$(this).simulateClick('click');}).each(function(){$(this).simulateClick('click');});
            $('#startVisualizationImfekImpfButton').prop('disabled', false);
        }else{
            viualizationSite4_ImfekImpfOptions.lineChart.setXAxisUTCExtent([min, max]);
            viualizationSite4_ImfekImpfOptions.lineChart.setSelectedYears(min, max);
            viualizationSite4_ImfekImpfOptions.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 1200});
        }

        viualizationSite4_ImfekImpfOptions.selectedEndYear++;            

    }, 1300);

}


$('#visualizationSite4_ImfekImpf').ready(function(){
     loadDataSite4_ImfekImpf();
});