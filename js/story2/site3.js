var viualizationSite3Options = {
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
    convertedTimeLineData: {}
}

function createVisualizationControlsSite3(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite3').css('margin-bottom', '25px');
    $('#visualizationControlsSite3').append( $('<p>').attr('id', 'displayDateRange') );
    // Container for the visual slider
    $('#visualizationControlsSite3').append( $('<div>').attr('id', 'displayDateRangeSilder').css('margin-left', '5px') );
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
    $('#visualizationControlsSite3 #displayDateRange').text('Zeitraum: ' + viualizationSite3Options.selectedStartYear + '-' + viualizationSite3Options.selectedEndYear);

    $('#visualizationControlsSite3').append( $('<br>'));

    // Create onBirth / 65years control buttons 
    $('#visualizationControlsSite3').append( $('<div>').attr('id', 'displayButtonsOnB65YSite3') );
    var input = $('<input>').attr({'type': "radio", 'id': "onBButtonSite3", 'name': "radioOnB65YSite3", 'checked': 'checked'});
    var label = $('<label>').attr('for', 'onBButtonSite3').text('Lebenserwartung bei Geburt');
    $('#visualizationControlsSite3 #displayButtonsOnB65YSite3').prepend( input );
    label.insertAfter(input);
    input = $('<input>').attr({'type': "radio", 'id': "65YButtonSite3", 'name': "radioOnB65YSite3"});
    label = $('<label>').attr('for', '65YButtonSite3').text('Lebenserwartung mit 65 Jahren');
    $('#visualizationControlsSite3 #displayButtonsOnB65YSite3').append( input );
    label.insertAfter(input);
    $( "#visualizationControlsSite3 #displayButtonsOnB65YSite3" ).buttonset();

    // Add click event on the total / activitytype control buttons
    $('#visualizationControlsSite3 #displayButtonsOnB65YSite3 :radio').click(function(){

        // Remove all lines
        viualizationSite3Options.lineChart.removeAllLines();

        // Filter new data
        var data = viualizationSite3Options.loadedFile;
        if($(this).attr('id')=="onBButtonSite3"){
            viualizationSite3Options.currentview = viualizationSite3Options.viewStyleEnum.onBirth;
            viualizationSite3Options.lineChart.setPrimYAxisLabel('Lebenserwartung in Jahren bei Geburt');
            data = data.filter(function(el) {return el[viualizationSite3Options.dataHeaderName].indexOf('Geburt') > -1 || el[viualizationSite3Options.dataHeaderName] == 'Gesundheitswesenkosten'});
        }else{
            viualizationSite3Options.currentview = viualizationSite3Options.viewStyleEnum.w65Y;
            viualizationSite3Options.lineChart.setPrimYAxisLabel('Lebenserwartung in Jahren 65-jährig');
            data = data.filter(function(el) {return el[viualizationSite3Options.dataHeaderName].indexOf('65') > -1 || el[viualizationSite3Options.dataHeaderName] == 'Gesundheitswesenkosten'});

        }

        // Set MenuData (loaded File)
        viualizationSite3Options.lineChart.setMenuData(data);
        viualizationSite3Options.lineChart.updateMenu();

        // Set data for primary Y axis
        var yaxisDataPrim = [];
        $.each(viualizationSite3Options.convertedTimeLineData, function(i, v){
            if((viualizationSite3Options.viewStyleEnum.onBirth == viualizationSite3Options.currentview)&&(i.indexOf('Geburt') > -1)){
                yaxisDataPrim = yaxisDataPrim.concat(v);
            }else if((viualizationSite3Options.viewStyleEnum.w65Y == viualizationSite3Options.currentview)&&(i.indexOf('65') > -1)){
                yaxisDataPrim = yaxisDataPrim.concat(v);
            }
        });

        // Add Y data
        viualizationSite3Options.lineChart.setPrimYAxisData(yaxisDataPrim);
        viualizationSite3Options.lineChart.updatePrimYAxis();

        //Display lines
        jQuery('#site3 div.key_label').each(function(){$(this).simulateClick('click');});
    });

    // Prepare containers for the chart and the menu on the right side
    d3.select("#site3 #visualizationSite3")
        .append('div')
            .attr('class', 'allTimeseries');

    d3.select("#site3 #visualizationSite3")
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
    // Set dataheadername
    viualizationSite3Options.dataHeaderName = d3.entries(viualizationSite3Options.loadedFile[0]).sort(sortYearsAscNameFirst)[0].key;
    viualizationSite3Options.lineChart.setDataHeaderName(viualizationSite3Options.dataHeaderName);

    // Set MenuData (loaded File)
    var data = viualizationSite3Options.loadedFile;
    if(viualizationSite3Options.viewStyleEnum.onBirth == viualizationSite3Options.currentview){
        data = data.filter(function(el) {return el[viualizationSite3Options.dataHeaderName].indexOf('65') == -1 || el[viualizationSite3Options.dataHeaderName] == 'Gesundheitswesenkosten'});
    }else{
        data = data.filter(function(el) {return el[viualizationSite3Options.dataHeaderName].indexOf('Geburt') == -1 || el[viualizationSite3Options.dataHeaderName] == 'Gesundheitswesenkosten'});
    }
    viualizationSite3Options.lineChart.setMenuData(data);

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
    for(var k = 0; k<viualizationSite3Options.loadedFile.length; k++){
        tempTimeLineName = d3.entries(viualizationSite3Options.loadedFile[k]).sort(sortYearsAscNameFirst)[0].value;
        tempConvertedData = d3.entries(viualizationSite3Options.loadedFile[k]);
        // Remove non-numeric data values
        viualizationSite3Options.convertedTimeLineData[tempTimeLineName] = tempConvertedData.filter(function(el) {return el.value.length && el.value==+el.value;});
    }

    // Set timelineData
    viualizationSite3Options.lineChart.setConvertedTimeLineData(viualizationSite3Options.convertedTimeLineData);

    // Set data for Y axes
    var yaxisDataPrim = [];
    var yaxisDataSek = [];
    $.each(viualizationSite3Options.convertedTimeLineData, function(i, v){
        if(i == 'Gesundheitswesenkosten'){
            yaxisDataSek = yaxisDataSek.concat(v);
        }else if((viualizationSite3Options.viewStyleEnum.onBirth == viualizationSite3Options.currentview)&&(i.indexOf('Geburt') > -1)){
            yaxisDataPrim = yaxisDataPrim.concat(v);
        }else if((viualizationSite3Options.viewStyleEnum.w65Y == viualizationSite3Options.currentview)&&(i.indexOf('65') > -1)){
            yaxisDataPrim = yaxisDataPrim.concat(v);
        }
    });

    // Add Y data
    viualizationSite3Options.lineChart.setPrimYAxisData(yaxisDataPrim);
    viualizationSite3Options.lineChart.setSecYAxisData(yaxisDataSek);

    // Precalculate UTC Time for performance reasons
    $.each(viualizationSite3Options.convertedTimeLineData, function(i, v){
        for(var i = 0;i<v.length;i++){
            v[i].keyUTC = Date.UTC(v[i].key,0,1,0,0,0,0);
        }
    });

    // Get selectable years for dateRangeSlider
    viualizationSite3Options.selectableYears = [];

    for(var i = 0;i<convertedLoadedFile.length;i++){
        if($.inArray(convertedLoadedFile[i].key, viualizationSite3Options.selectableYears) === -1) viualizationSite3Options.selectableYears.push(+convertedLoadedFile[i].key);
    }

    viualizationSite3Options.selectableYears.sort();

    var firstYear = Date.UTC(viualizationSite3Options.selectableYears[0],0,1,0,0,0,0);
    var lastYear = Date.UTC(viualizationSite3Options.selectableYears[viualizationSite3Options.selectableYears.length-1],0,1,0,0,0,0);

    viualizationSite3Options.lineChart.setXAxisUTCExtent([firstYear, lastYear]);
    viualizationSite3Options.lineChart.setSelectedYears(firstYear, lastYear);
}

function loadDataSite3(){
    d3.tsv(viualizationSite3Options.dataFile, function(data){
        viualizationSite3Options.loadedFile = data;
        viualizationSite3Options.lineChart = new lineChart('site3', {drawSecYAxis: true});
        viualizationSite3Options.lineChart.setHeadersArrayForSecondaryAxis(['Gesundheitswesenkosten']);
        viualizationSite3Options.lineChart.setSecYAxisLabel('Kosten des Gesundheitswesens in Millionen CHF');
        viualizationSite3Options.lineChart.setPrimYAxisLabel('Lebenserwartung in Jahren bei Geburt');
        viualizationSite3Options.lineChart.setSpecialDrawStyleForPath('Gesundheitswesenkosten', {'stroke-width': '10'});
        dataProcessingSite3();
        createVisualizationControlsSite3();
        viualizationSite3Options.lineChart.initialDraw();
        jQuery('#site3 div.key_label').each(function(){$(this).simulateClick('click');});
    });
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

$('#visualizationSite3').ready(function(){
     loadDataSite3();
});