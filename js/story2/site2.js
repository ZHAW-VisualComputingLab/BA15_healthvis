var viualizationSite2Options = {
    dataFile: 'tsv/site2.tsv',
    loadedFile: [],
    lineChart: {},
    selectableYears: [],
    DataHeaderName: '',
    viewStyleEnum: {
        onBirth: 0,
        w65Y: 1
    },
    currentview: 0,
    convertedTimeLineData: {},
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
    $('#visualizationControlsSite2 #displayDateRange').text('Zeitraum: ' + viualizationSite2Options.selectedStartYear + '-' + viualizationSite2Options.selectedEndYear);

    $('#visualizationControlsSite2').append( $( '<button>' )
                                                            .addClass('btn btn-default')
                                                            .attr('id', 'startVisualizationSite2Button')
                                                            .text('Start')
                                                            .on('click', startVisualizationSite2 )
                                                     );

    $('#visualizationControlsSite2').append( $('<br>'));

    // Create onBirth / 65years control buttons 
    $('#visualizationControlsSite2').append( $('<div>').attr('id', 'displayButtonsOnB65Y').css('display', 'none') );
    var input = $('<input>').attr({'type': "radio", 'id': "onBButton", 'name': "radioOnB65Y", 'checked': 'checked'});
    var label = $('<label>').attr('for', 'onBButton').text('Lebenserwartung bei Geburt');
    $('#visualizationControlsSite2 #displayButtonsOnB65Y').prepend( input );
    label.insertAfter(input);
    input = $('<input>').attr({'type': "radio", 'id': "65YButton", 'name': "radioOnB65Y"});
    label = $('<label>').attr('for', '65YButton').text('Lebenserwartung mit 65 Jahren');
    $('#visualizationControlsSite2 #displayButtonsOnB65Y').append( input );
    label.insertAfter(input);
    $( "#visualizationControlsSite2 #displayButtonsOnB65Y" ).buttonset();

    // Add click event on the total / activitytype control buttons
    $('#visualizationControlsSite2 #displayButtonsOnB65Y :radio').click(function(){

        // Remove all lines
        viualizationSite2Options.lineChart.removeAllLines();

        // Filter new data
        var data = viualizationSite2Options.loadedFile;
        if($(this).attr('id')=="onBButton"){
            viualizationSite2Options.currentview = viualizationSite2Options.viewStyleEnum.onBirth;
            viualizationSite2Options.lineChart.setPrimYAxisLabel('Lebenserwartung in Jahren bei Geburt');
            data = data.filter(function(el) {return el[viualizationSite2Options.dataHeaderName].indexOf('Geburt') > -1 || el[viualizationSite2Options.dataHeaderName] == 'Gesundheitswesenkosten'});
        }else{
            viualizationSite2Options.currentview = viualizationSite2Options.viewStyleEnum.w65Y;
            viualizationSite2Options.lineChart.setPrimYAxisLabel('Lebenserwartung in Jahren 65-jährig');
            data = data.filter(function(el) {return el[viualizationSite2Options.dataHeaderName].indexOf('65') > -1 || el[viualizationSite2Options.dataHeaderName] == 'Gesundheitswesenkosten'});

        }

        // Set MenuData (loaded File)
        viualizationSite2Options.lineChart.setMenuData(data);
        viualizationSite2Options.lineChart.updateMenu();

        // Set data for primary Y axis
        var yaxisDataPrim = [];
        $.each(viualizationSite2Options.convertedTimeLineData, function(i, v){
            if((viualizationSite2Options.viewStyleEnum.onBirth == viualizationSite2Options.currentview)&&(i.indexOf('Geburt') > -1)){
                yaxisDataPrim = yaxisDataPrim.concat(v);
            }else if((viualizationSite2Options.viewStyleEnum.w65Y == viualizationSite2Options.currentview)&&(i.indexOf('65') > -1)){
                yaxisDataPrim = yaxisDataPrim.concat(v);
            }
        });

        // Add Y data
        viualizationSite2Options.lineChart.setPrimYAxisData(yaxisDataPrim);
        viualizationSite2Options.lineChart.updatePrimYAxis();

    });

    // Prepare containers for the chart and the menu on the right side
    d3.select("#site2 #visualizationSite2")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#site2 #visualizationSite2")
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
    // Set dataheadername
    viualizationSite2Options.dataHeaderName = d3.entries(viualizationSite2Options.loadedFile[0]).sort(sortYearsAscNameFirst)[0].key;
    viualizationSite2Options.lineChart.setDataHeaderName(viualizationSite2Options.dataHeaderName);

    // Set MenuData (loaded File)
    var data = viualizationSite2Options.loadedFile;
    if(viualizationSite2Options.viewStyleEnum.onBirth == viualizationSite2Options.currentview){
        data = data.filter(function(el) {return el[viualizationSite2Options.dataHeaderName].indexOf('65') == -1 || el[viualizationSite2Options.dataHeaderName] == 'Gesundheitswesenkosten'});
    }else{
        data = data.filter(function(el) {return el[viualizationSite2Options.dataHeaderName].indexOf('Geburt') == -1 || el[viualizationSite2Options.dataHeaderName] == 'Gesundheitswesenkosten'});
    }
    viualizationSite2Options.lineChart.setMenuData(data);

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
    for(var k = 0; k<viualizationSite2Options.loadedFile.length; k++){
        tempTimeLineName = d3.entries(viualizationSite2Options.loadedFile[k]).sort(sortYearsAscNameFirst)[0].value;
        tempConvertedData = d3.entries(viualizationSite2Options.loadedFile[k]);
        // Remove non-numeric data values
        viualizationSite2Options.convertedTimeLineData[tempTimeLineName] = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
    }

    // Set timelineData
    viualizationSite2Options.lineChart.setConvertedTimeLineData(viualizationSite2Options.convertedTimeLineData);

    // Set data for Y axes
    var yaxisDataPrim = [];
    var yaxisDataSek = [];
    $.each(viualizationSite2Options.convertedTimeLineData, function(i, v){
        if(i == 'Gesundheitswesenkosten'){
            yaxisDataSek = yaxisDataSek.concat(v);
        }else if((viualizationSite2Options.viewStyleEnum.onBirth == viualizationSite2Options.currentview)&&(i.indexOf('Geburt') > -1)){
            yaxisDataPrim = yaxisDataPrim.concat(v);
        }else if((viualizationSite2Options.viewStyleEnum.w65Y == viualizationSite2Options.currentview)&&(i.indexOf('65') > -1)){
            yaxisDataPrim = yaxisDataPrim.concat(v);
        }
    });

    // Add Y data
    viualizationSite2Options.lineChart.setPrimYAxisData(yaxisDataPrim);
    viualizationSite2Options.lineChart.setSecYAxisData(yaxisDataSek);

    // Precalculate UTC Time for performance reasons
    $.each(viualizationSite2Options.convertedTimeLineData, function(i, v){
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

function loadDataSite2(){
    d3.tsv(viualizationSite2Options.dataFile, function(data){
        viualizationSite2Options.loadedFile = data;
        viualizationSite2Options.lineChart = new lineChart('site2', {drawSecYAxis: true});
        viualizationSite2Options.lineChart.setHeadersArrayForSecondaryAxis(['Gesundheitswesenkosten']);
        viualizationSite2Options.lineChart.setSecYAxisLabel('Kosten des Gesundheitswesens in Millionen CHF');
        viualizationSite2Options.lineChart.setPrimYAxisLabel('Lebenserwartung in Jahren bei Geburt');
        viualizationSite2Options.lineChart.setSpecialDrawStyleForPath('Gesundheitswesenkosten', {'stroke-width': '10'});
        dataProcessingSite2();
        createVisualizationControlsSite2();
        viualizationSite2Options.lineChart.initialDraw();
    });
}

function autostartVisualizationSite2(){
    if(!viualizationSite2Options.autostartVisualizationHapped){
        viualizationSite2Options.autostartVisualizationHapped = true;
        startVisualizationSite2();
    }else{
        if(!$('#site2 .timeseries').length){
            var min = Date.UTC(viualizationSite2Options.selectableYears[0],0,1,0,0,0,0);
            var max = Date.UTC(viualizationSite2Options.selectableYears[viualizationSite2Options.selectableYears.length-1],0,1,0,0,0,0);
            viualizationSite2Options.lineChart.setXAxisUTCExtent([min, max]);
            viualizationSite2Options.lineChart.setSelectedYears(min, max);
            viualizationSite2Options.lineChart.updateYearRange({onlyDrawPath: true, updateIntervall: 1100});
            jQuery('#site2 div.key_label').each(function(){$(this).simulateClick('click');});
        }
    }
}

function stopVisualizationSite2(){
    if (typeof viualizationSite2Options.timeIntervall !== "undefined") {
        window.clearInterval(viualizationSite2Options.timeIntervall);
        d3.selectAll("#site2 .timeseries").remove();
        $('#startVisualizationSite2Button').prop('disabled', false);
    }
    delete viualizationSite2Options.timeIntervall;
}

function startVisualizationSite2(){

    if($('#site2 .timeseries').length == 0){
        jQuery('#site2 div.key_label').each(function(){$(this).simulateClick('click');});
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