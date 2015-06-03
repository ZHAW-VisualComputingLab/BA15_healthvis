

// Globally used options / variables in relaiton to the swissmap
var swissMapOptionsSite6 = {
    swissMapJSONFile: 'json/switzerland.json',
    loadedSwissMapJSONFile: '',
    viewStyleEnum: {
        coloredDetailView: 0,
        colorlessNationalView: 1,
        singleSelectionView: 2
    },
    cantons: {},
    svg: {},
    tierViewData: [],
    viewStyle: 0,
    container_dimensions: {width: 720, height: 480},
    colorgradient: {}
}

// Globally used options / variables in relaiton to the pieChart
var pieChartOptionsSite6 = {
    container_dimensions: {width: 606, height: 240},
    svg: {},
    color: {},
    arc: {},
    pie: {},
    outerArc: {},
    radius: {},
    slicesData: [],
    currentKPIPrefix: '',
    labels: ['(A) Akutbehandlung', '(B) Geburtshäuser', '(P) Psychiatrie', '(R) Rehabilitation / Geriatrie'],
    titleText: {},
    isSliceSelected: false
}

// Globally used options / variables in relaiton to the displayed data table
var tableViewOptionsSite6 = {
    panelHeading: '',
    tableHeading: [],
    tableContent: {},
    viewStyleEnum: {
        cantonView: 0,
        nationalView: 1
    },
    currentview: '',
    viewStyle: '',
    currentProcessedLabelHeader: 0,
    htmlDataTables: [],
    panelHeadingTitle: {},
    isRowSelected: false
}

// Globally used options / variables in relaiton to overall visualization
var viualizationOptionsSite6 = {
    hospitalDataFiles: ['tsv/Kennzahlen_Spital/kzp09.tsv',
            'tsv/Kennzahlen_Spital/kzp10.tsv',
            'tsv/Kennzahlen_Spital/kzp11.tsv',
            'tsv/Kennzahlen_Spital/kzp12.tsv'],
    hospitalLabelsTotalDataFile: 'tsv/Kennzahlen_Spital/labelsTotaleDaten.tsv',
    hospitalLabelsActivityDataFile: 'tsv/Kennzahlen_Spital/labelsAktivitaetsDatenSite6.tsv',
    populationDataFiles: ['tsv/Bevoelkerung_Alter_Kanton/population_2009_hd.tsv',
            'tsv/Bevoelkerung_Alter_Kanton/population_2010_hd.tsv',
            'tsv/Bevoelkerung_Alter_Kanton/population_2011_hd.tsv',
            'tsv/Bevoelkerung_Alter_Kanton/population_2012_hd.tsv'],
    loadedHospitalData: [],
    loadedHospitalLabelsTotalData: [],
    loadedHospitalLabelsActivityData: [],
    loadedPopulationData: [],
    selectedCanton: '',
    selectedDataTypeAbsRel: 1,
    selectedDataTypeTotActiv: 3,
    selectedDataKPI: 'KostLangA',
    selectedStartYear: 2009,
    selectedEndYear: 2012,
    selectedRelativeAmount: 1,
    dataTypeEnum: {
        absolute: 0,
        relative: 1,
        total: 2,
        activitytype: 3
    },
    activitytypeEndings: ['A', 'B', 'P', 'R'],
    visualizationSteps: 4,
    currentVisualizedKPI: 0,
    runningVisualization: {},
    selectableSlideValuesAbsRel: [],
    amountOfAbsRelSliderValues: 7
}

function initialDrawSwissMapSite6(){
    // Projection settings of the swissmap
    var projection = d3.geo.albers()
        .rotate([0, 0])
        .center([8.4, 46.7])
        .scale(12500)
        .translate([swissMapOptionsSite6.container_dimensions.width / 2, swissMapOptionsSite6.container_dimensions.height / 2])
        .precision(.1);

    var path = d3.geo.path()
        .projection(projection);

    swissMapOptionsSite6.svg = d3.select("#site6 #swissMapVisualizationSite6").append("svg")
        .attr("width", swissMapOptionsSite6.container_dimensions.width)
        .attr("height", swissMapOptionsSite6.container_dimensions.height)
        .attr("id", "svg");

    var tooltip = d3.select("#site6 #swissMapVisualizationSite6")
        .append("div")
        .attr("id", "tooltip");

    // Load canton data from topojson
    swissMapOptionsSite6.cantons = topojson.feature(swissMapOptionsSite6.loadedSwissMapJSONFile, swissMapOptionsSite6.loadedSwissMapJSONFile.objects.cantons);

    // Draws each Canton as a seperate Object, needed for specific selection
    swissMapOptionsSite6.svg.selectAll("#site6 .canton")
        .data(topojson.feature(swissMapOptionsSite6.loadedSwissMapJSONFile, swissMapOptionsSite6.loadedSwissMapJSONFile.objects.cantons).features)
        .enter()
        .append("path")
        .attr("class", function (d) { 
                return "canton";
            })
        .style('fill', '#cccccc')
        .attr("id", function (d) {
                return "SVGcanton"+d.id;
            })
        .attr("d", path)
        .on("mouseenter",function (d){
            stopVisualizationSite6();
            viualizationOptionsSite6.selectedCanton = d.id;
            tableViewOptionsSite6.viewStyle = tableViewOptionsSite6.viewStyleEnum.cantonView;
            updateTableDataSite6();
            swissMapOptionsSite6.viewStyle = swissMapOptionsSite6.viewStyleEnum.singleSelectionView;
            updateSwissMapDataSite6();
        })
        .on("mouseout",function (d){
            viualizationOptionsSite6.selectedCanton = '';
            viualizationOptionsSite6.selectedDataKPI = '';
            tableViewOptionsSite6.viewStyle = tableViewOptionsSite6.viewStyleEnum.nationalView;
            updateTableDataSite6();
            swissMapOptionsSite6.viewStyle = swissMapOptionsSite6.viewStyleEnum.colorlessNationalView;
            updateSwissMapDataSite6();
            startVisualizationSite6();
        });

    //Draws the borders of the cantons
    swissMapOptionsSite6.svg.append("path")
        .datum(topojson.mesh(swissMapOptionsSite6.loadedSwissMapJSONFile, swissMapOptionsSite6.loadedSwissMapJSONFile.objects.cantons, function (a, b) {
            return a !== b;
        }))
        .attr("class", "canton-boundary")
        .attr("d", path)

    //draws the Labels of the cantons
    swissMapOptionsSite6.svg.selectAll("#site6 text")
        .data(swissMapOptionsSite6.cantons.features)
        .enter().append("text")
        .attr("transform", function (d) {
            return "translate(" + path.centroid(d) + ")";
        })
        .attr("dy", ".35em")
        .attr('class', 'noselect')
        .text(function (d) {
            return d.properties.name;
        });

    //Set the colorgradient
    swissMapOptionsSite6.colorgradient = d3.scale.linear()
        .domain([0, 50, 100])
        .range(["#91CF60", "#FFFFBF", "#FC8D59"]);
}

function loadDataSite6(){
    queue()
        .defer(d3.tsv, viualizationOptionsSite6.hospitalDataFiles[0])
        .defer(d3.tsv, viualizationOptionsSite6.hospitalDataFiles[1])
        .defer(d3.tsv, viualizationOptionsSite6.hospitalDataFiles[2])
        .defer(d3.tsv, viualizationOptionsSite6.hospitalDataFiles[3])
        .defer(d3.tsv, viualizationOptionsSite6.hospitalLabelsTotalDataFile)
        .defer(d3.tsv, viualizationOptionsSite6.hospitalLabelsActivityDataFile)
        .defer(d3.tsv, viualizationOptionsSite6.populationDataFiles[0])
        .defer(d3.tsv, viualizationOptionsSite6.populationDataFiles[1])
        .defer(d3.tsv, viualizationOptionsSite6.populationDataFiles[2])
        .defer(d3.tsv, viualizationOptionsSite6.populationDataFiles[3])
        .defer(d3.json, swissMapOptionsSite6.swissMapJSONFile)
        .await(function(error, d1, d2, d3, d4, l1, l2, p1, p2, p3, p4, swissMapJSONData) {
            viualizationOptionsSite6.loadedHospitalData['2009'] = d1;
            viualizationOptionsSite6.loadedHospitalData['2010'] = d2;
            viualizationOptionsSite6.loadedHospitalData['2011'] = d3;
            viualizationOptionsSite6.loadedHospitalData['2012'] = d4;
            viualizationOptionsSite6.loadedHospitalLabelsTotalData = l1;
            viualizationOptionsSite6.loadedHospitalLabelsActivityData = l2;
            viualizationOptionsSite6.loadedPopulationData['2009'] = p1;
            viualizationOptionsSite6.loadedPopulationData['2010'] = p2;
            viualizationOptionsSite6.loadedPopulationData['2011'] = p3;
            viualizationOptionsSite6.loadedPopulationData['2012'] = p4;
            swissMapOptionsSite6.loadedSwissMapJSONFile = swissMapJSONData;
            dataProcessingSite6();
            initialDrawSwissMapSite6();
            initialDrawPieChartSite6();
            initialTableDrawSite6();
            updatePieChartDataSite6();
            updateTableDataSite6();
            updateSwissMapDataSite6();
            startVisualizationSite6();
        });
}

function updateSwissMapDataSite6(){
    if(swissMapOptionsSite6.viewStyle == swissMapOptionsSite6.viewStyleEnum.coloredDetailView){
        var tempDataAmoutOverOneYear;
        var tempPopulationAmoutOverSelectedPeriod;
        // Counter needed for average calculation of percent Data
        var countPercentData;
        // Each SVG canton
        for(var i = 0;i<swissMapOptionsSite6.cantons.features.length;i++){
            swissMapOptionsSite6.cantons.features[i]['dataValueToDisplay'] = dataGathererSite6(viualizationOptionsSite6.selectedDataKPI, swissMapOptionsSite6.cantons.features[i].id);
        }

        // Get extent of canton data (index0=min, index1=max)
        swissMapOptionsSite6.cantons.extent = [];
        for(var i = 0;i<swissMapOptionsSite6.cantons.features.length;i++){
            if(i == 0){
                // Initial borders
                swissMapOptionsSite6.cantons.extent[0] = swissMapOptionsSite6.cantons.features[i]['dataValueToDisplay'];
                swissMapOptionsSite6.cantons.extent[1] = swissMapOptionsSite6.cantons.features[i]['dataValueToDisplay'];
            }else{
                // Move border if greater or lower value
                if(swissMapOptionsSite6.cantons.features[i]['dataValueToDisplay']>swissMapOptionsSite6.cantons.extent[1]){
                    swissMapOptionsSite6.cantons.extent[1] = Math.ceil(swissMapOptionsSite6.cantons.features[i]['dataValueToDisplay']);
                }else if(swissMapOptionsSite6.cantons.features[i]['dataValueToDisplay']<swissMapOptionsSite6.cantons.extent[0]){
                    swissMapOptionsSite6.cantons.extent[0] = Math.floor(swissMapOptionsSite6.cantons.features[i]['dataValueToDisplay']);
                }
            }
        }

        // Calculate range for every step from tier to tier level
        var calculatedValueRange = (swissMapOptionsSite6.cantons.extent[1]-swissMapOptionsSite6.cantons.extent[0])/3;

        // Build tier object suited for the swissMpaView part
        // Every tier get an start vlaue and an end Value
        swissMapOptionsSite6.tierViewData = [];
        // Only 3 tiers supported
        for(var i = 0;i<3;i++){
            // Every tier is stored in an object
            swissMapOptionsSite6.tierViewData[i] = {}
            // Set tier name with specific index
            swissMapOptionsSite6.tierViewData[i].tier = "tier"+(i+1);
            // First tier (i==0), tier1, will get the minimum Value of all (extent[0])
            if(i==0)swissMapOptionsSite6.tierViewData[i].value = Math.floor(swissMapOptionsSite6.cantons.extent[0]);
            if(i==1)swissMapOptionsSite6.tierViewData[i].value = Math.round(Math.floor(swissMapOptionsSite6.cantons.extent[0]) + (Math.ceil(swissMapOptionsSite6.cantons.extent[1]) - Math.floor(swissMapOptionsSite6.cantons.extent[0]))/2);
            if(i==2)swissMapOptionsSite6.tierViewData[i].value = Math.ceil(swissMapOptionsSite6.cantons.extent[1]);
        }
    }
    updateSwissMapViewSite6();
}

function updateSwissMapViewSite6(){
    //Reset settings from previous views
    // Every CSS class from previous view will be resettet to default class "canton"
    d3.selectAll('#site6 .canton').style('fill', '#cccccc');
    // Remove old legend from an previous view
    $('#site6 .legend').remove();

    if(swissMapOptionsSite6.viewStyle == swissMapOptionsSite6.viewStyleEnum.singleSelectionView){
        // Specific view settings for the "singleSelectionView" (mouseover on a svg canton)
        // The canton with the mouseover will get selected by the id and gets the additional class selectedCanton
        if(viualizationOptionsSite6.selectedCanton !== ''){
            d3.select('#site6 #SVGcanton'+viualizationOptionsSite6.selectedCanton)
                .style('fill', '#2E90BD');
        }
    }else if(swissMapOptionsSite6.viewStyle == swissMapOptionsSite6.viewStyleEnum.colorlessNationalView){
        // Specific view settings for the "colorlessNationalView" (mouseout from an svg canton)

    }else if(swissMapOptionsSite6.viewStyle == swissMapOptionsSite6.viewStyleEnum.coloredDetailView){
        // Specific view settings for the "coloredDetailView" (mouseover on the displayed data table)
        // Get the generated tiewViewData object from the updateSwissMapDataSite6 function and create enterselection
        var legend = swissMapOptionsSite6.svg.selectAll("#site6 .legend")
            .data(swissMapOptionsSite6.tierViewData)
                .enter()
                .append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) {
                    // Normal swissMap legend position in top right corner
                    return "translate(-20," + i * 20 + ")";
                });
         
        // Create colored gradient
        var legendSVG = swissMapOptionsSite6.svg.append("g")
            .attr("class", "legend")
            .attr("width", 18)
            .attr("height", 54);

        var gradient = legendSVG.append("defs")
          .append("linearGradient")
            .attr("id", "gradientSite6")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#91CF60");

        gradient.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "#FFFFBF");

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#FC8D59");

        legendSVG.append("rect")
            .attr("x", swissMapOptionsSite6.container_dimensions.width - 36)
            .attr("width", 18)
            .attr("height", 54)
            .style("fill", "url(#gradientSite6)");
        
        // Add text to the legend
        legend.append("text")
            .attr("x", swissMapOptionsSite6.container_dimensions.width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { 
               // Arguments[1] is the specific index for the specific legend part
                // this way is needed because the symbols "< > =" are diffrent for every tier
                if(arguments[1] == 0) return "Erster Wert bei " + Math.floor(swissMapOptionsSite6.cantons.extent[0]);
                if(arguments[1] == 1) return "Mittlerer Wert bei " + swissMapOptionsSite6.tierViewData[1].value;
                if(arguments[1] == 2) return "Letzter Wert bei " + Math.ceil(swissMapOptionsSite6.cantons.extent[1]);
               
            });

        // Add tier class to the specific svg canton
        swissMapOptionsSite6.svg.selectAll("#site6 .canton")
            .transition()
            .style('fill', function(d){
                // Go trough each data canton
                for(var i = 0;i<swissMapOptionsSite6.cantons.features.length;i++){
                    // SVG canton and data canton match
                    if(swissMapOptionsSite6.cantons.features[i].id == d.id){
                        calculatedPercentage = (swissMapOptionsSite6.cantons.features[i]['dataValueToDisplay'] == 0 ? 0 : 100*(swissMapOptionsSite6.cantons.features[i]['dataValueToDisplay']-Math.floor(swissMapOptionsSite6.cantons.extent[0]))/(Math.ceil(swissMapOptionsSite6.cantons.extent[1])-Math.floor(swissMapOptionsSite6.cantons.extent[0])));
                        return swissMapOptionsSite6.colorgradient(calculatedPercentage);
                    }
                }
            });
    }
}

function updateTableDataSite6(){
    // Viewstyle settings
    if(tableViewOptionsSite6.viewStyle == tableViewOptionsSite6.viewStyleEnum.nationalView){
        // Custom tableheading for acitve "nationalView" (no canton got an mouseover)
        tableViewOptionsSite6.panelHeading = 'Nationaler Überblick (Jahresdurchschnitt über selektierte Jahre)';
        tableViewOptionsSite6.tableHeading = ['Bezeichnung', 'Wert'];
    }else if(tableViewOptionsSite6.viewStyle == tableViewOptionsSite6.viewStyleEnum.cantonView){
        // Custom tableheading for acitve "cantonView" (a canton got an mouseover)
        tableViewOptionsSite6.panelHeading = 'Kanton ' + viualizationOptionsSite6.selectedCanton + ' Überblick (Jahresdurchschnitt über selektierte Jahre)';
        tableViewOptionsSite6.tableHeading = ['Bezeichnung', 'Wert'];
    }

    // Gather data for the displayed table
    // temporary variable used to summarize every medical environment from an single canton
    var tempDataAmoutOverOneYear;
    // temporary variable t
    var tempPopulationAmoutOverSelectedPeriod;
    // Counter needed for average calculation of percent Data
    var countPercentData;
    // tableContent will contain the data which will be displayed in the table, depending on the selected dataType total or splitted by activitytype
    if(viualizationOptionsSite6.selectedDataTypeTotActiv == viualizationOptionsSite6.dataTypeEnum.total){
        tableViewOptionsSite6.tableContent = $.extend(true, [], viualizationOptionsSite6.loadedHospitalLabelsTotalData);
    }else if(viualizationOptionsSite6.selectedDataTypeTotActiv == viualizationOptionsSite6.dataTypeEnum.activitytype){
        tableViewOptionsSite6.tableContent = $.extend(true, [], viualizationOptionsSite6.loadedHospitalLabelsActivityData);
    }
    // For better performance only process the selected Label Header
    // For each label
    for(var g = 0; g<tableViewOptionsSite6.tableContent[tableViewOptionsSite6.currentProcessedLabelHeader].values.length; g++){
        // Gather Data depending on the current KPI name and if an canton is selected or not
        if(viualizationOptionsSite6.selectedCanton == ''){
            tableViewOptionsSite6.tableContent[tableViewOptionsSite6.currentProcessedLabelHeader].values[g].value = Math.round10(dataGathererSite6(tableViewOptionsSite6.tableContent[tableViewOptionsSite6.currentProcessedLabelHeader].values[g].Name),-2);
        }else{
            tableViewOptionsSite6.tableContent[tableViewOptionsSite6.currentProcessedLabelHeader].values[g].value = Math.round10(dataGathererSite6(tableViewOptionsSite6.tableContent[tableViewOptionsSite6.currentProcessedLabelHeader].values[g].Name, viualizationOptionsSite6.selectedCanton),-2);
        }
    }
    updateTableViewSite6();
}

// Source: https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Math/round
(function() {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
})();

function initialTableDrawSite6(){
    // Remove displayed table with possible old values from previous viewstyles
    if (!$('#tableViewSite6').is(':empty')){
        $('#tableViewSite6').empty();
    }

    // Build new result panel
    var htmlPanel = $( '<div>' ).attr('class', 'panel panel-default');

    // Build new result panel-heading
    var htmlPanelHeading = $( '<div>' ).attr('class', 'panel-heading').css('table-layout', 'fixed'); 
    tableViewOptionsSite6.panelHeadingTitle = $( '<strong>' ).text(tableViewOptionsSite6.panelHeading)
    htmlPanelHeading.append( tableViewOptionsSite6.panelHeadingTitle );
    htmlPanel.append(htmlPanelHeading);

    var accordion = $( '<div>' ).attr('id', 'accordionSite6');

    // Build the accordion
    if(viualizationOptionsSite6.selectedDataTypeTotActiv == viualizationOptionsSite6.dataTypeEnum.total){
        for(var i = 0;i<viualizationOptionsSite6.loadedHospitalLabelsTotalData.length;i++){
            accordion.append($( '<h3>' ).text(viualizationOptionsSite6.loadedHospitalLabelsTotalData[i].key));
            tableViewOptionsSite6.htmlDataTables[i] = $( '<div>' );
            accordion.append(tableViewOptionsSite6.htmlDataTables[i]);
        }    
    }else if(viualizationOptionsSite6.selectedDataTypeTotActiv == viualizationOptionsSite6.dataTypeEnum.activitytype){
        for(var i = 0;i<viualizationOptionsSite6.loadedHospitalLabelsActivityData.length;i++){
            accordion.append($( '<h3>' ).text(viualizationOptionsSite6.loadedHospitalLabelsActivityData[i].key));
            tableViewOptionsSite6.htmlDataTables[i] = $( '<div>' );
            accordion.append(tableViewOptionsSite6.htmlDataTables[i]);
        }
    }

    $( '#tableViewSite6' ).append(htmlPanel);
    $( '#tableViewSite6' ).append(accordion);

    // Create JQuery UI Accordion on the displayed table
    $( "#site6 #accordionSite6" ).accordion({
        heightStyle: "content",
        event: "click hoverintent",
        active: tableViewOptionsSite6.currentProcessedLabelHeader,
        activate: function( event, ui ) {
            $('.blockHover').remove();
        },
        beforeActivate: function( event, ui ){
            tableViewOptionsSite6.currentProcessedLabelHeader = ui.newHeader.index()/2;
            updateTableDataSite6();
            // Needed to prevent instant hover on new table, before animation is complete
            $('body').append($('<div>').attr('class', 'blockHover').css({'position': 'fixed', 'width' : '100%', 'height': '100%', 'top': '0px', 'left': '0px', 'z-index': '1000'}));
        }
    });
}

function updateTableViewSite6(){

    // Set panelHeadingTitleText
    tableViewOptionsSite6.panelHeadingTitle.text(tableViewOptionsSite6.panelHeading);

    var htmlTable;
    var htmlTableHeading;
    var htmlTrTableHeading;

    // Build the accordion
    for(var i = 0;i<tableViewOptionsSite6.tableContent.length;i++){
            tableViewOptionsSite6.htmlDataTables[i].empty();
        // For better performance only process the selected Label Header
        if(i == tableViewOptionsSite6.currentProcessedLabelHeader){
            // Build new result table
            htmlTable = $( '<table>' ).attr('class', 'table table-hover');

            // Build new result table-heading
            htmlTrTableHeading = $( '<tr>' );
            for(var k = 0;k<tableViewOptionsSite6.tableHeading.length;k++){
                htmlTrTableHeading.append( $( '<th>' ).text( tableViewOptionsSite6.tableHeading[k] ) );
            }
            htmlTableHeading = $( '<thead>' ).append( htmlTrTableHeading );
            htmlTable.append(htmlTableHeading);

            // Iterate trough all found url's each found package
            for(var m = 0;m<tableViewOptionsSite6.tableContent[i].values.length;m++){
                if(viualizationOptionsSite6.selectedDataKPI == tableViewOptionsSite6.tableContent[i].values[m].Name){
                    htmlTable.append( $( '<tr>' ).attr('title', tableViewOptionsSite6.tableContent[i].values[m].Description).addClass('cursorHelp')
                                                    .append( $( '<td>' ).text( tableViewOptionsSite6.tableContent[i].values[m].Name ).css('width', '20px').addClass('success') )
                                                    .append( $( '<td>' ).text( numberWithCommasSite6(tableViewOptionsSite6.tableContent[i].values[m].value) + " CHF" ) )
                                                    .append( $( '<td>' ).text( tableViewOptionsSite6.tableContent[i].values[m].Description.substring(0,9) + "..." ) )
                                                );
                }else{
                    htmlTable.append( $( '<tr>' ).attr('title', tableViewOptionsSite6.tableContent[i].values[m].Description).addClass('cursorHelp')
                                                    .append( $( '<td>' ).text( tableViewOptionsSite6.tableContent[i].values[m].Name ).css('width', '20px') )
                                                    .append( $( '<td>' ).text( numberWithCommasSite6(tableViewOptionsSite6.tableContent[i].values[m].value) + " CHF" ) )
                                                    .append( $( '<td>' ).text( tableViewOptionsSite6.tableContent[i].values[m].Description.substring(0,9) + "..." ) )
                                                );
                }
            }

            tableViewOptionsSite6.htmlDataTables[i].append(htmlTable);
        }
    }

    $( "#accordionSite6" ).accordion( "refresh" );

    // Create onclick event to all tablerows from the displayed table
    // $('#tableViewSite6 tbody tr').mouseover(mouseoverTableRowSite6);
    $('#tableViewSite6 tbody tr').mouseenter(function(){
        stopVisualizationSite6();
        // Remove the css class from the displayed table rows which indicates an mouseover
        $('td').removeClass('success');
        // This is the actual row
        // the first child is the left cell on the current row
        $(this).children().first().addClass('success');
        // Save the selected KPI for further visualisation processes
        viualizationOptionsSite6.selectedDataKPI = $(this).children().first().text();
        tableViewOptionsSite6.isRowSelected = true;
        swissMapOptionsSite6.viewStyle = swissMapOptionsSite6.viewStyleEnum.coloredDetailView;
        updateSwissMapDataSite6();
        updatePieChartDataSite6();
    });
    $('#tableViewSite6 tbody tr').mouseout(function(){
       tableViewOptionsSite6.isRowSelected = false;
       startVisualizationSite6();
    });

    // Activate jQuery UI tooltip function
    // Adds tooltip to every element with an title attribute
    // Track option to follow the cursor
    $( document ).tooltip({
        track: true
    });
}

function dataProcessingSite6(){
    // Remove Empty, 'NA', oder not existing data rows from the Hospital Data
    for(var i = 2009; i<=2012; i++){
        viualizationOptionsSite6.loadedHospitalData[i].forEach(function(d){
            $.each(d, function(i, v){if(v=="NA" || v=="" || typeof v === "undefined")delete d[i];})
        });
        // Group every medical environment by canton
        viualizationOptionsSite6.loadedHospitalData[i] = d3.nest()
            .key(function(d) { return d.KT; })
            .entries(viualizationOptionsSite6.loadedHospitalData[i]);
        // Remove possible 'CH' canton or rows without canton groupkey
        viualizationOptionsSite6.loadedHospitalData[i].splice(26,2);
    }
    // Remove unused data from loaded populationData (only total and Kanton are used)
    for(var i = 2009; i<=2012; i++){
        viualizationOptionsSite6.loadedPopulationData[i].forEach(function(d){
            $.each(d, function(i, v){if(i!=="total" && i!=="Kanton")delete d[i];})
        });
    }
    // Group totalData labes by Header
    var data = viualizationOptionsSite6.loadedHospitalLabelsTotalData;
    var nest = d3.nest()
        .key(function(d) { return d.Header; });
    viualizationOptionsSite6.loadedHospitalLabelsTotalData = nest.entries(data);

    // Group activityData labes by Header
    data = viualizationOptionsSite6.loadedHospitalLabelsActivityData;
    nest = d3.nest()
        .key(function(d) { return d.Header; });
    viualizationOptionsSite6.loadedHospitalLabelsActivityData = nest.entries(data);
}

function createVisualizationControlsSite6(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite6').append( $('<p>').attr('id', 'displayDateRange') );
    // Container for the visual slider
    $('#visualizationControlsSite6').append( $('<div>').attr('id', 'displayDateRangeSilder').css('margin-left', '5px') );
    // addClass (col-md-3) to limit the width of the slider
    $('#displayDateRangeSilder').slider({
            range: true,
            min: 2009,
            max: 2012,
            values: [ 2009, 2012 ],
            slide: function( event, ui ) {
                    viualizationOptionsSite6.selectedStartYear = ui.values[ 0 ];
                    viualizationOptionsSite6.selectedEndYear = ui.values[ 1 ];
                    $('#displayDateRange').text('Zeitraum: ' + ui.values[ 0 ] + '-' + ui.values[ 1 ]);
                    updateTableDataSite6();
                    updateSwissMapDataSite6();
                }
        }).addClass('col-md-3');
    // Set initial selected year range
    $('#displayDateRange').text('Zeitraum: ' + $('#displayDateRangeSilder').slider('values', 0 ) + '-' + $('#displayDateRangeSilder').slider('values', 1 ));
    $('#visualizationControlsSite6').append( $('<br>') );

    // Create total / activitytype control buttons 
    $('#visualizationControlsSite6').append( $('<div>').attr('id', 'displayButtonsTotalActivity') );
    var input = $('<input>').attr({'type': "radio", 'id': "totalButton", 'name': "radioTotActiv"});
    var label = $('<label>').attr('for', 'totalButton').text('Totale Daten');
    $('#displayButtonsTotalActivity').prepend( input );
    label.insertAfter(input);
    input = $('<input>').attr({'type': "radio", 'id': "activityButton", 'name': "radioTotActiv", 'checked': 'checked'});
    label = $('<label>').attr('for', 'activityButton').text('Aufgeteillt auf Aktivitäten');
    $('#displayButtonsTotalActivity').append( input );
    label.insertAfter(input);
    $( "#displayButtonsTotalActivity" ).buttonset();

    // Add click event on the total / activitytype control buttons
    $('#displayButtonsTotalActivity :radio').click(function(){
        if($(this).attr('id')=="activityButton"){
            viualizationOptionsSite6.selectedDataTypeTotActiv = viualizationOptionsSite6.dataTypeEnum.activitytype;
            viualizationOptionsSite6.selectedDataKPI = 'PtageStatA';
            updatePieChartDataSite6();
            $('#pieChartViewSite6').show('slow');
            initialTableDrawSite6();
        }else{
            viualizationOptionsSite6.selectedDataTypeTotActiv = viualizationOptionsSite6.dataTypeEnum.total;
            $('#pieChartViewSite6').hide('slow');
            initialTableDrawSite6();
        }
        updateTableDataSite6();
        updateSwissMapDataSite6();
    });

    // Create absolute / relative control buttons 
    $('#visualizationControlsSite6').append( $('<div>').attr('id', 'displayButtonsAbsoluteRelative') );
    input = $('<input>').attr({'type': "radio", 'id': "absoluteButton", 'name': "radioAbsRel"});
    label = $('<label>').attr('for', 'absoluteButton').text('Absolute Daten');
    $('#displayButtonsAbsoluteRelative').prepend( input );
    label.insertAfter(input);
    input = $('<input>').attr({'type': "radio", 'id': "relativeButton", 'name': "radioAbsRel", 'checked': 'checked'});
    label = $('<label>').attr('for', 'relativeButton').text('Relaitve Daten');
    $('#displayButtonsAbsoluteRelative').append( input );
    label.insertAfter(input);
    $( "#displayButtonsAbsoluteRelative" ).buttonset();

    // Add click event on the absolute / realitve control buttons
    $('#displayButtonsAbsoluteRelative :radio').click(function(){
        if($(this).attr('id')=="relativeButton"){
            viualizationOptionsSite6.selectedDataTypeAbsRel = viualizationOptionsSite6.dataTypeEnum.relative;
            $('#displayRelativeDataControl').show('slow');
        }else{
            viualizationOptionsSite6.selectedDataTypeAbsRel = viualizationOptionsSite6.dataTypeEnum.absolute;
            $('#displayRelativeDataControl').hide('slow');
        }
        updateTableDataSite6();
        updateSwissMapDataSite6();
    });

    // Relative / Absolut Data Slider: Possible Slide Values
    for(var i = 0; i<viualizationOptionsSite6.amountOfAbsRelSliderValues; i++){
        viualizationOptionsSite6.selectableSlideValuesAbsRel[i] = Math.pow(10, i); 
    }

    // Create single ended slider for selecting the amount of relative data
    $('#visualizationControlsSite6').append( $('<div>').attr('id', 'displayRelativeDataControl') );
    $('#displayRelativeDataControl').append( $('<p>').attr('id', 'displayRelativeRange') );
    $('#displayRelativeDataControl').append( $('<div>').attr('id', 'displayRelativeRangeSlider').css('margin-left', '5px') );
    // addClass (col-md-3) to limit the width of the slider
    $('#displayRelativeRangeSlider').slider({
        range: "min",
        value: 0,
        min: 0,
        step: 1,
        max: (viualizationOptionsSite6.selectableSlideValuesAbsRel.length-1),
        slide: function( event, ui ) {
            $('#displayRelativeRange').text('Darstellung der Relativen Daten: pro ' + numberWithCommasSite6(viualizationOptionsSite6.selectableSlideValuesAbsRel[ui.value]) + ' Person(en)');
            viualizationOptionsSite6.selectedRelativeAmount = viualizationOptionsSite6.selectableSlideValuesAbsRel[ui.value];
            updateTableDataSite6();
            updateSwissMapDataSite6();
        }
    }).addClass('col-md-3');
    // Set initial selected amout of realtive data
    $('#displayRelativeRange').text('Darstellung der Relativen Daten: pro '+ numberWithCommasSite6(viualizationOptionsSite6.selectableSlideValuesAbsRel[$('#displayRelativeRangeSlider').slider( "option", "value" )]) + ' Person(en)');

}

function betweenPlusLowerBoundSite6(x, min, max) {
  return min <= x && x < max;
}

 /*
* hoverIntent | Copyright 2011 Brian Cherne
* http://cherne.net/brian/resources/jquery.hoverIntent.html
* modified by the jQuery UI team
*/
$.event.special.hoverintent = {
    setup: function() {
        $( this ).bind( "mouseover", jQuery.event.special.hoverintent.handler );
    },
    teardown: function() {
        $( this ).unbind( "mouseover", jQuery.event.special.hoverintent.handler );
    },
    handler: function( event ) {
        var currentX, currentY, timeout,
        args = arguments,
        target = $( event.target ),
        previousX = event.pageX,
        previousY = event.pageY;
        function track( event ) {
            currentX = event.pageX;
            currentY = event.pageY;
        };
        function clear() {
            target
            .unbind( "mousemove", track )
            .unbind( "mouseout", clear );
            clearTimeout( timeout );
        }
        function handler() {
            var prop,
            orig = event;
            if ( ( Math.abs( previousX - currentX ) +
                Math.abs( previousY - currentY ) ) < 7 ) {
                clear();
                event = $.Event( "hoverintent" );
                for ( prop in orig ) {
                    if ( !( prop in event ) ) {
                        event[ prop ] = orig[ prop ];
                    }
                }
                // Prevent accessing the original event since the new event
                // is fired asynchronously and the old event is no longer
                // usable (#6028)
                delete event.originalEvent;
                target.trigger( event );
            } else {
                previousX = currentX;
                previousY = currentY;
                timeout = setTimeout( handler, 100 );
            }
        }
        timeout = setTimeout( handler, 100 );
        target.bind({
            mousemove: track,
            mouseout: clear
        });
    }
};

// From https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommasSite6(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

// Based on following source: //http://bl.ocks.org/dbuezas/9306799
function initialDrawPieChartSite6() {
    // Setup pieChart and legends SVG Size
    pieChartOptionsSite6.svg = d3.select("#site6 #pieChartViewSite6")
        .append("svg")
        .attr("width", pieChartOptionsSite6.container_dimensions.width)
        .attr("height", pieChartOptionsSite6.container_dimensions.height);
    pieChartOptionsSite6.radius = Math.min(pieChartOptionsSite6.container_dimensions.width, pieChartOptionsSite6.container_dimensions.height) / 2;

    // Create groups fo further elements
    pieChartOptionsSite6.svg.append("g")
        .attr("class", "slices");
    pieChartOptionsSite6.svg.append("g")
        .attr("class", "labels");
    pieChartOptionsSite6.svg.append("g")
        .attr("class", "lines");
    
    // Select Layout pie with disabled sorting function (sort(null)) and with associated accessor function (getting the values)
    pieChartOptionsSite6.pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

    // Define the arc for the actual pieChart (inner and outer curve of the circle)
    pieChartOptionsSite6.arc = d3.svg.arc()
        .outerRadius(pieChartOptionsSite6.radius * 0.8)
        .innerRadius(pieChartOptionsSite6.radius * 0.4);

    // Define the arc for the legend lines
    pieChartOptionsSite6.outerArc = d3.svg.arc()
        .innerRadius(pieChartOptionsSite6.radius * 0.9)
        .outerRadius(pieChartOptionsSite6.radius * 0.9);

    pieChartOptionsSite6.color = d3.scale.ordinal()
        .domain(pieChartOptionsSite6.labels)
        .range(["#80b1d3", "#f6c9d2", "#bc80bd", "#bf812d"]);

    pieChartOptionsSite6.titleText = pieChartOptionsSite6.svg.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .style("text-anchor", "middle")

}

function updatePieChartDataSite6(data) {

    // Get the current selected KPI Prefix (very char except the last char)
    pieChartOptionsSite6.currentKPIPrefix = viualizationOptionsSite6.selectedDataKPI.substring(0, viualizationOptionsSite6.selectedDataKPI.length - 1);

    // Create data array with all activitytype-labels to select based on the current selection
    // This will create an array containing objects with an label composed of the current KPI prefix and an activitytype ending
    pieChartOptionsSite6.slicesData = [];
    for(var i = 0;i<pieChartOptionsSite6.labels.length;i++){
        pieChartOptionsSite6.slicesData[i] = {label: pieChartOptionsSite6.labels[i], KPIName: pieChartOptionsSite6.currentKPIPrefix + viualizationOptionsSite6.activitytypeEndings[i]};
    }

    var tempPopulationAmoutOverSelectedPeriod;
    var tempDataAmoutOverOneYear;

    // Counter needed for average calculation of percent Data
    for(var i = 0;i<viualizationOptionsSite6.activitytypeEndings.length;i++){
        pieChartOptionsSite6.slicesData[i].value = dataGathererSite6(pieChartOptionsSite6.currentKPIPrefix + viualizationOptionsSite6.activitytypeEndings[i]);
    }
    updatePieChartViewSite6();
}

// Based on following source: //http://bl.ocks.org/dbuezas/9306799
function updatePieChartViewSite6(){

    //Draw Title
    pieChartOptionsSite6.titleText.text(pieChartOptionsSite6.currentKPIPrefix);

    data = pieChartOptionsSite6.slicesData;

    if($('#pieChartViewSite6').is(':hidden')){
        // Needed to prevent instant hover on other KPI, before animation is complete
        $('body').append($('<div>').attr('id', 'blockHover').css({'position': 'fixed', 'width' : '100%', 'height': '100%', 'top': '0px', 'left': '0px', 'z-index': '1000'}));
        $('#pieChartViewSite6').show('slow', function(){
            $('#blockHover').remove();
        });
    }

    var key = function(d){ return d.data.label; };    

    // Positioning of all groups and texts
    pieChartOptionsSite6.svg.selectAll("#site6 div#pieChartViewSite6 svg > g, #site6 div#pieChartViewSite6 svg > text")
        .attr("transform", "translate(" + pieChartOptionsSite6.container_dimensions.width / 2 + "," + pieChartOptionsSite6.container_dimensions.height / 2 + ")");

    /* ------- PIE SLICES -------*/
    var slice = pieChartOptionsSite6.svg.select("#site6 .slices").selectAll("#site6 path.slice")
        .data(pieChartOptionsSite6.pie(data), key);

    slice.enter()
        .insert("path")
        .style("fill", function(d) { return pieChartOptionsSite6.color(d.data.label); })
        .attr("class", "slice");

    slice       
        .transition().duration(1000)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return pieChartOptionsSite6.arc(interpolate(t));
            };
        });

    slice.on("mouseenter",function (d){
            stopVisualizationSite6();
            pieChartOptionsSite6.isSliceSelected = true;
            var currentSlice = this;
            d3.selectAll("#site6 .slice").style("opacity", function(){
                return (this === currentSlice) ? 1.0 : 0.25;
            });
            d3.selectAll("#site6 .slice").style("stroke", function(d){
                console.log(pieChartOptionsSite6.color(d.data.label));
                return (this === currentSlice) ? pieChartOptionsSite6.color(d.data.label) : null;
            });
            viualizationOptionsSite6.selectedDataKPI = d.data.KPIName;
            swissMapOptionsSite6.viewStyle = swissMapOptionsSite6.viewStyleEnum.coloredDetailView;
            updateSwissMapDataSite6();
            updateTableDataSite6();
        })

    slice.on("mouseout",function (d){
            pieChartOptionsSite6.isSliceSelected = false;
            d3.selectAll("#site6 .slice").style("opacity", 1);
            d3.selectAll("#site6 .slice").style("stroke", null);
            viualizationOptionsSite6.selectedCanton = '';
            tableViewOptionsSite6.viewStyle = tableViewOptionsSite6.viewStyleEnum.nationalView;
            updateTableDataSite6();
            updateSwissMapDataSite6();
            startVisualizationSite6();
        })


    slice.exit()
        .remove();

    /* ------- TEXT LABELS -------*/

    var text = pieChartOptionsSite6.svg.select("#site6 .labels").selectAll("#site6 text")
        .data(pieChartOptionsSite6.pie(data), key);

    text.enter()
        .append("text")
        .attr("dy", ".35em")
        .text(function(d) {
            return d.data.label;
        });
    
    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text.transition().duration(1000)
        .attrTween("transform", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = pieChartOptionsSite6.outerArc.centroid(d2);
                pos[0] = pieChartOptionsSite6.radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate("+ pos +")";
            };
        })
        .styleTween("text-anchor", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start":"end";
            };
        });

    text.exit()
        .remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = pieChartOptionsSite6.svg.select("#site6 .lines").selectAll("#site6 polyline")
        .data(pieChartOptionsSite6.pie(data), key);
    
    polyline.enter()
        .append("polyline");

    polyline.transition().duration(1000)
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = pieChartOptionsSite6.outerArc.centroid(d2);
                pos[0] = pieChartOptionsSite6.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [pieChartOptionsSite6.arc.centroid(d2), pieChartOptionsSite6.outerArc.centroid(d2), pos];
            };          
        });
    
    polyline.exit()
        .remove();
}

// gather all data for specific KPI (canton is optional)
// If canton is set, then only for the set canton data will be gathered
// IF canton is not set (undefined) all data from every canton will be gathered
function dataGathererSite6(KPItoGather, canton){

    var countPercentData = 0;
    var tempPopulationAmoutOverSelectedPeriod = 0;
    var KPIValue = 0;

    // Go trough every slected year
    for(var k = viualizationOptionsSite6.selectedStartYear; k<=viualizationOptionsSite6.selectedEndYear; k++){
        // Reset countPercentData if label starts with small p (indicates a percent data column)
        if(KPItoGather.charAt(0) == 'p')countPercentData=0;
        // temporary yearly variable
        // used to add every value form every medical environment
        tempDataAmoutOverOneYear = 0;
        // Go trough every canton
        for(var m = 0;m<viualizationOptionsSite6.loadedHospitalData[k].length;m++){
            // Only for selected canton or for all cantons if selectedCanton == '' (means national view)
            if((canton == undefined) || (viualizationOptionsSite6.loadedHospitalData[k][m].key == canton)){
                // Go trough every medical environment
                for(var o = 0;o<viualizationOptionsSite6.loadedHospitalData[k][m].values.length;o++){
                    // Filter set without data
                    if(typeof viualizationOptionsSite6.loadedHospitalData[k][m].values[o][KPItoGather] !== 'undefined'){
                        // Convert number from point notation to comma notation
                        viualizationOptionsSite6.loadedHospitalData[k][m].values[o][KPItoGather].replace('.',',');
                        // second plus needed to convert string to number
                        tempDataAmoutOverOneYear += +viualizationOptionsSite6.loadedHospitalData[k][m].values[o][KPItoGather];
                        // If label starts with small p (indicates a percent data column) increment countPercentData
                        if(KPItoGather.charAt(0) == 'p')countPercentData++;
                    }
                }
            }
        }                                                
        // If label starts with small p (indicates a percent data column) calculate average of percent
        if(KPItoGather.charAt(0) == 'p' && countPercentData !== 0)tempDataAmoutOverOneYear=tempDataAmoutOverOneYear/countPercentData;
        // Add summarized year
        KPIValue += tempDataAmoutOverOneYear;
    }
    // calcualte average over every selected year
    // Divide by amout of selected years
    KPIValue = KPIValue / (viualizationOptionsSite6.selectedEndYear - viualizationOptionsSite6.selectedStartYear + 1);
    // Condition if relative data is selected
    if(viualizationOptionsSite6.selectedDataTypeAbsRel == viualizationOptionsSite6.dataTypeEnum.relative){
        tempPopulationAmoutOverSelectedPeriod = 0
        // Every selected year
        for(var k = viualizationOptionsSite6.selectedStartYear; k<=viualizationOptionsSite6.selectedEndYear; k++){
            // Go search canton
            for(var m = 0; m<viualizationOptionsSite6.loadedPopulationData[k].length; m++){
                // Add summarized year and calcualte average for the national view if selectedCanton == '' (means national view, no cantons selected)
                if((viualizationOptionsSite6.loadedPopulationData[k][m].Kanton == 'CH') && (canton == undefined)){
                    tempPopulationAmoutOverSelectedPeriod += +viualizationOptionsSite6.loadedPopulationData[k][m].total;
                }
                // Add summarized year and calcualte average for the cantonal view if selectedCanton matches (means cantonView, one canton got mouseover)
                if(viualizationOptionsSite6.loadedPopulationData[k][m].Kanton == canton){
                    tempPopulationAmoutOverSelectedPeriod += +viualizationOptionsSite6.loadedPopulationData[k][m].total;
                }
            }
        }
        // Divide by amout of selected years
        tempPopulationAmoutOverSelectedPeriod = tempPopulationAmoutOverSelectedPeriod / (viualizationOptionsSite6.selectedEndYear - viualizationOptionsSite6.selectedStartYear + 1);
        // Multiplay by amout of selected relative data
        KPIValue = KPIValue * viualizationOptionsSite6.selectedRelativeAmount;
        // Divide by population
        KPIValue = KPIValue / tempPopulationAmoutOverSelectedPeriod;
    }
    return KPIValue;
}

function stopVisualizationSite6(){
    window.clearInterval(viualizationOptionsSite6.runningVisualization);
    delete viualizationOptionsSite6.runningVisualization;
}

function startVisualizationSite6(){
    visualizationSite6();
    viualizationOptionsSite6.runningVisualization = setInterval(visualizationSite6, 5000);
}

function visualizationSite6(){
    if(viualizationOptionsSite6.runningVisualization !== undefined){
        swissMapOptionsSite6.viewStyle = swissMapOptionsSite6.viewStyleEnum.coloredDetailView;
        viualizationOptionsSite6.currentVisualizedKPI++;
        viualizationOptionsSite6.currentVisualizedKPI = viualizationOptionsSite6.currentVisualizedKPI % viualizationOptionsSite6.visualizationSteps;
            
        switch(viualizationOptionsSite6.currentVisualizedKPI) {
          case 0:
            viualizationOptionsSite6.selectedDataKPI = 'KostLangA';
            break;
          case 1:
            viualizationOptionsSite6.selectedDataKPI = 'KostLangP';
            break;
          case 2:
            viualizationOptionsSite6.selectedDataKPI = 'KostLangR';
            break;
          case 3:
            viualizationOptionsSite6.selectedDataKPI = 'KostLangB';
            break;
          default:
              console.log('Error: No switchcase');
            }
        updateTableDataSite6();
        updateSwissMapDataSite6();
        updatePieChartDataSite6();
    }
}

$(document).ready(function(){
    createVisualizationControlsSite6();
    loadDataSite6();
});