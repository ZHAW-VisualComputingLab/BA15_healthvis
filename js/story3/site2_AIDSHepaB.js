var viualizationSite2_AIDSHepaBOptions = {
    dataFile: 'tsv/site3_AIDSHepaB.tsv',
    loadedFile: [],
    lineChart: {},
    loadedMarkerData: [],
    selectableYears: [],
    timeIntervall: {},
    selectedEndYear: '',
    autostartVisualizationHapped: false
}

function createVisualizationControlsSite2_AIDSHepaB(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite2_AIDSHepaB').css('margin-bottom', '25px');
    $('#visualizationControlsSite2_AIDSHepaB').append( $('<p>').attr('id', 'displayDateRange').css('display', 'none') );
    // Container for the visual slider
    $('#visualizationControlsSite2_AIDSHepaB').append( $('<div>').attr('id', 'displayDateRangeSilder').css({'margin-left': '5px', 'display': 'none'}) );
    // addClass (col-md-3) to limit the width of the slider
    $('#visualizationControlsSite2_AIDSHepaB #displayDateRangeSilder').slider({
            min: 0,
            max: (viualizationSite2_AIDSHepaBOptions.selectableYears.length-1),
            step: 1,
            values: [ 0, (viualizationSite2_AIDSHepaBOptions.selectableYears.length-1) ],
            slide: function( event, ui ) {
                    var min = viualizationSite2_AIDSHepaBOptions.selectableYears[ui.values[0]];
                    var max = viualizationSite2_AIDSHepaBOptions.selectableYears[ui.values[1]];

                    var firstYear = Date.UTC(min,0,1,0,0,0,0);
                    var lastYear = Date.UTC(max,0,1,0,0,0,0);

                    viualizationSite2_AIDSHepaBOptions.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
                    viualizationSite2_AIDSHepaBOptions.lineChart.setSelectedYears(firstYear, lastYear);
                    $('#visualizationControlsSite2_AIDSHepaB #displayDateRange').text('Zeitraum: ' + min + '-' + max);
                    viualizationSite2_AIDSHepaBOptions.lineChart.updateYearRange();
                }
        }).addClass('col-md-3');
    // Set initial selected year range
    viualizationSite2_AIDSHepaBOptions.selectedStartYear = viualizationSite2_AIDSHepaBOptions.selectableYears[0];
    viualizationSite2_AIDSHepaBOptions.selectedEndYear = viualizationSite2_AIDSHepaBOptions.selectableYears[(viualizationSite2_AIDSHepaBOptions.selectableYears.length-1)];
    $('#visualizationControlsSite2_AIDSHepaB #displayDateRange').text('Zeitraum: ' + viualizationSite2_AIDSHepaBOptions.selectedStartYear + '-' + viualizationSite2_AIDSHepaBOptions.selectedEndYear);

    $('#visualizationControlsSite2_AIDSHepaB').append( $( '<button>' )
                                                            .addClass('btn btn-default')
                                                            .attr('id', 'startVisualizationAIDSHepaBButton')
                                                            .text('Start')
                                                            .on('click', startVisualizationSite2_AIDSHepaB )
                                                     );

    // Prepare containers for the chart and the menu on the right side
    d3.select("#visualizationSite2_AIDSHepaB")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#visualizationSite2_AIDSHepaB")
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

function dataProcessingSite2_AIDSHepaB(){


    // Set MenuData (loaded File)
    viualizationSite2_AIDSHepaBOptions.lineChart.setMenuData(viualizationSite2_AIDSHepaBOptions.loadedFile);

    // Set dataheadername
    if(navigator.userAgent.toLowerCase().indexOf('chrome') > -1){
        viualizationSite2_AIDSHepaBOptions.lineChart.setDataHeaderName(d3.entries(viualizationSite2_AIDSHepaBOptions.loadedFile[0])[d3.entries(viualizationSite2_AIDSHepaBOptions.loadedFile[0]).length-1].key);
    }else if((navigator.userAgent.toLowerCase().indexOf('safari') > -1) || (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)){
        viualizationSite2_AIDSHepaBOptions.lineChart.setDataHeaderName(d3.entries(viualizationSite2_AIDSHepaBOptions.loadedFile[0])[0].key);
    }else{
        viualizationSite2_AIDSHepaBOptions.lineChart.setDataHeaderName(d3.entries(viualizationSite2_AIDSHepaBOptions.loadedFile[0])[d3.entries(viualizationSite2_AIDSHepaBOptions.loadedFile[0]).length-1].key);
    }

    // Convert Data to match Micha's golden Rule (Do not store data in the keys of a JSON blob.)
    var tempConvertedData;
    var convertedLoadedFile = [];
    for(var k = 0;k<viualizationSite2_AIDSHepaBOptions.loadedFile.length;k++){
        tempConvertedData = d3.entries(viualizationSite2_AIDSHepaBOptions.loadedFile[k])
        // Remove non-numeric data values
        tempConvertedData = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
        convertedLoadedFile = convertedLoadedFile.concat(tempConvertedData);
    }

    // Convert timelinedata
    var tempTimeLineName;
    var convertedTimeLineData = {};
    for(var k = 0; k<viualizationSite2_AIDSHepaBOptions.loadedFile.length; k++){
        if(navigator.userAgent.toLowerCase().indexOf('chrome') > -1){
            tempTimeLineName = d3.entries(viualizationSite2_AIDSHepaBOptions.loadedFile[k])[d3.entries(viualizationSite2_AIDSHepaBOptions.loadedFile[k]).length-1].value;
        }else if((navigator.userAgent.toLowerCase().indexOf('safari') > -1) || (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)){
            tempTimeLineName = d3.entries(viualizationSite2_AIDSHepaBOptions.loadedFile[k])[0].value;
        }else{
            tempTimeLineName = d3.entries(viualizationSite2_AIDSHepaBOptions.loadedFile[k])[d3.entries(viualizationSite2_AIDSHepaBOptions.loadedFile[k]).length-1].value;
        }
        tempConvertedData = d3.entries(viualizationSite2_AIDSHepaBOptions.loadedFile[k]);
        // Remove non-numeric data values
        convertedTimeLineData[tempTimeLineName] = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
    }

    // Set timelineData
    viualizationSite2_AIDSHepaBOptions.lineChart.setConvertedTimeLineData(convertedTimeLineData);

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
    viualizationSite2_AIDSHepaBOptions.lineChart.setPrimYAxisData(yaxisDataPrim);
    viualizationSite2_AIDSHepaBOptions.lineChart.setSecYAxisData(yaxisDataSek);

    // viualizationSite2_AIDSHepaBOptions.lineChart.setSecYAxisData();
    viualizationSite2_AIDSHepaBOptions.lineChart.setSecYAxisLabel('Fälle Neuerkrankungen');
    viualizationSite2_AIDSHepaBOptions.lineChart.setPrimYAxisLabel('Fälle Neuerkrankungen');


    // Precalculate UTC Time for performance reasons
    $.each(convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            v[i].keyUTC = Date.UTC(v[i].key,0,1,0,0,0,0);
        }
    });

    // Get selectable years for dateRangeSlider
    viualizationSite2_AIDSHepaBOptions.selectableYears = [];

    for(var i = 0;i<convertedLoadedFile.length;i++){
        if($.inArray(convertedLoadedFile[i].key, viualizationSite2_AIDSHepaBOptions.selectableYears) === -1) viualizationSite2_AIDSHepaBOptions.selectableYears.push(+convertedLoadedFile[i].key);
    }

    viualizationSite2_AIDSHepaBOptions.selectableYears = $.unique(viualizationSite2_AIDSHepaBOptions.selectableYears.sort()).sort(); 

    var firstYear = Date.UTC(viualizationSite2_AIDSHepaBOptions.selectableYears[0],0,1,0,0,0,0);
    var lastYear = Date.UTC(viualizationSite2_AIDSHepaBOptions.selectableYears[viualizationSite2_AIDSHepaBOptions.selectableYears.length-1],0,1,0,0,0,0);

    //Set new Data
    viualizationSite2_AIDSHepaBOptions.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite2_AIDSHepaBOptions.lineChart.setSelectedYears(firstYear, lastYear);

    // Process markers
    for(var i = 0;i<viualizationSite2_AIDSHepaBOptions.loadedMarkerData.length;i++){
        viualizationSite2_AIDSHepaBOptions.loadedMarkerData[i].dateUTC = convertStringDateToJSUTCSite2AIDSHepa(viualizationSite2_AIDSHepaBOptions.loadedMarkerData[i].date);
    }
    viualizationSite2_AIDSHepaBOptions.lineChart.setMarkerData(viualizationSite2_AIDSHepaBOptions.loadedMarkerData);
}

function convertStringDateToJSUTCSite2AIDSHepa(stringDate) {
    return Date.UTC(stringDate.substring(0,4), (stringDate.substring(5,7)-1), stringDate.substring(8,10));
}

function loadDataSite2_AIDSHepaB(){
    d3.json('json/lineChartLiveAIDSHepaB.json', function(data){
        viualizationSite2_AIDSHepaBOptions.loadedMarkerData = data;
    });
    
    d3.tsv(viualizationSite2_AIDSHepaBOptions.dataFile, function(data){
        viualizationSite2_AIDSHepaBOptions.loadedFile = data;
        viualizationSite2_AIDSHepaBOptions.lineChart = new lineChart('site2_AIDSHepaB', {drawSecYAxis: false, drawMarkers: true});
        dataProcessingSite2_AIDSHepaB();
        createVisualizationControlsSite2_AIDSHepaB();
        viualizationSite2_AIDSHepaBOptions.lineChart.initialDraw();
    });
}

function autostartVisualizationSite2(){
    if(!viualizationSite2_AIDSHepaBOptions.autostartVisualizationHapped){
        viualizationSite2_AIDSHepaBOptions.autostartVisualizationHapped = true;
        startVisualizationSite2_AIDSHepaB();
    }else{
        if(!$('#site2_AIDSHepaB .timeseries').length){
            var min = Date.UTC(viualizationSite2_AIDSHepaBOptions.selectableYears[0],0,1,0,0,0,0);
            var max = Date.UTC(viualizationSite2_AIDSHepaBOptions.selectableYears[viualizationSite2_AIDSHepaBOptions.selectableYears.length-1],0,1,0,0,0,0);
            viualizationSite2_AIDSHepaBOptions.lineChart.setXAxisUTCExtent([min, max]);
            viualizationSite2_AIDSHepaBOptions.lineChart.setSelectedYears(min, max);
            viualizationSite2_AIDSHepaBOptions.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 1200});
            jQuery('#site2_AIDSHepaB div.key div').each(function(){$(this).simulateClick('click');});
        }
    }
}

function stopVisualizationSite2(){
    if (typeof viualizationSite2_AIDSHepaBOptions.timeIntervall !== "undefined") {
        window.clearInterval(viualizationSite2_AIDSHepaBOptions.timeIntervall);
        d3.selectAll("#site2 .timeseries").remove();
        $('#startVisualizationAIDSHepaBButton').prop('disabled', false);
    }
    delete viualizationSite2_AIDSHepaBOptions.timeIntervall;
}

function startVisualizationSite2_AIDSHepaB(){

    if($('#site2_AIDSHepaB .timeseries').length == 0){
        jQuery('#site2_AIDSHepaB div.key div').each(function(){$(this).simulateClick('click');});
    }

    viualizationSite2_AIDSHepaBOptions.selectedEndYear = 1;

    var firstYear = Date.UTC('1980',0,1,0,0,0,0);
    var lastYear = Date.UTC('1981',0,1,0,0,0,0);

    viualizationSite2_AIDSHepaBOptions.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite2_AIDSHepaBOptions.lineChart.setSelectedYears(firstYear, lastYear);
    viualizationSite2_AIDSHepaBOptions.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1200});

    $('#startVisualizationAIDSHepaBButton').prop('disabled', true);

    viualizationSite2_AIDSHepaBOptions.timeIntervall = setInterval(function(){
        
        var min = Date.UTC(viualizationSite2_AIDSHepaBOptions.selectableYears[0],0,1,0,0,0,0);
        var max = Date.UTC(viualizationSite2_AIDSHepaBOptions.selectableYears[viualizationSite2_AIDSHepaBOptions.selectedEndYear],0,1,0,0,0,0);
     
        if(!$('#site2_AIDSHepaB .timeseries').length){
            jQuery('#site2_AIDSHepaB div.key div').each(function(){$(this).simulateClick('click');});
        }

        if(viualizationSite2_AIDSHepaBOptions.selectedEndYear >= viualizationSite2_AIDSHepaBOptions.selectableYears.length){
            viualizationSite2_AIDSHepaBOptions.lineChart.updateYearRange({onlyDrawPath: false, updateIntervall: 1000});
            window.clearInterval(viualizationSite2_AIDSHepaBOptions.timeIntervall);
            jQuery('#site2_AIDSHepaB div.key div').each(function(){$(this).simulateClick('click');}).each(function(){$(this).simulateClick('click');});
            $('#startVisualizationAIDSHepaBButton').prop('disabled', false);
        }else{
            viualizationSite2_AIDSHepaBOptions.lineChart.setXAxisUTCExtent([min, max]);
            viualizationSite2_AIDSHepaBOptions.lineChart.setSelectedYears(min, max);
            viualizationSite2_AIDSHepaBOptions.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 1200});
        }

        if(viualizationSite2_AIDSHepaBOptions.selectedEndYear < 2){
            viualizationSite2_AIDSHepaBOptions.selectedEndYear = viualizationSite2_AIDSHepaBOptions.selectedEndYear + 4;
        }else{
            viualizationSite2_AIDSHepaBOptions.selectedEndYear = viualizationSite2_AIDSHepaBOptions.selectedEndYear + 1;            
        }

    }, 1300);

}


$('#visualizationSite2_AIDSHepaB').ready(function(){
     loadDataSite2_AIDSHepaB();
});