

// Globally used options / variables in relaiton to the swissmap
var swissMapOptionsSite5 = {
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
var pieChartOptionsSite5 = {
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
var tableViewOptionsSite5 = {
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
var viualizationOptionsSite5 = {
    hospitalDataFiles: ['tsv/Kennzahlen_Spital/kzp09.tsv',
            'tsv/Kennzahlen_Spital/kzp10.tsv',
            'tsv/Kennzahlen_Spital/kzp11.tsv',
            'tsv/Kennzahlen_Spital/kzp12.tsv'],
    hospitalLabelsTotalDataFile: 'tsv/Kennzahlen_Spital/labelsTotaleDaten.tsv',
    hospitalLabelsActivityDataFile: 'tsv/Kennzahlen_Spital/labelsAktivitaetsDatenSite5.tsv',
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
    selectedDataKPI: 'KostStatA',
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

function initialDrawSwissMapSite5(){
    // Projection settings of the swissmap
    var projection = d3.geo.albers()
        .rotate([0, 0])
        .center([8.4, 46.7])
        .scale(12500)
        .translate([swissMapOptionsSite5.container_dimensions.width / 2, swissMapOptionsSite5.container_dimensions.height / 2])
        .precision(.1);

    var path = d3.geo.path()
        .projection(projection);

    swissMapOptionsSite5.svg = d3.select("#site5 #swissMapVisualizationSite5").append("svg")
        .attr("width", swissMapOptionsSite5.container_dimensions.width)
        .attr("height", swissMapOptionsSite5.container_dimensions.height)
        .attr("id", "svg");

    var tooltip = d3.select("#site5 #swissMapVisualizationSite5")
        .append("div")
        .attr("id", "tooltip");

    // Load canton data from topojson
    swissMapOptionsSite5.cantons = topojson.feature(swissMapOptionsSite5.loadedSwissMapJSONFile, swissMapOptionsSite5.loadedSwissMapJSONFile.objects.cantons);

    // Draws each Canton as a seperate Object, needed for specific selection
    swissMapOptionsSite5.svg.selectAll("#site5 .canton")
        .data(topojson.feature(swissMapOptionsSite5.loadedSwissMapJSONFile, swissMapOptionsSite5.loadedSwissMapJSONFile.objects.cantons).features)
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
            stopVisualizationSite5();
            viualizationOptionsSite5.selectedCanton = d.id;
            tableViewOptionsSite5.viewStyle = tableViewOptionsSite5.viewStyleEnum.cantonView;
            updateTableDataSite5();
            swissMapOptionsSite5.viewStyle = swissMapOptionsSite5.viewStyleEnum.singleSelectionView;
            updateSwissMapDataSite5();
        })
        .on("mouseout",function (d){
            viualizationOptionsSite5.selectedCanton = '';
            viualizationOptionsSite5.selectedDataKPI = '';
            tableViewOptionsSite5.viewStyle = tableViewOptionsSite5.viewStyleEnum.nationalView;
            updateTableDataSite5();
            swissMapOptionsSite5.viewStyle = swissMapOptionsSite5.viewStyleEnum.colorlessNationalView;
            updateSwissMapDataSite5();
            startVisualizationSite5();
        });

    //Draws the borders of the cantons
    swissMapOptionsSite5.svg.append("path")
        .datum(topojson.mesh(swissMapOptionsSite5.loadedSwissMapJSONFile, swissMapOptionsSite5.loadedSwissMapJSONFile.objects.cantons, function (a, b) {
            return a !== b;
        }))
        .attr("class", "canton-boundary")
        .attr("d", path)

    //draws the Labels of the cantons
    swissMapOptionsSite5.svg.selectAll("#site5 text")
        .data(swissMapOptionsSite5.cantons.features)
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
    swissMapOptionsSite5.colorgradient = d3.scale.linear()
        .domain([0, 50, 100])
        .range(["#91CF60", "#FFFFBF", "#FC8D59"]);
}

function loadDataSite5(){
    queue()
        .defer(d3.tsv, viualizationOptionsSite5.hospitalDataFiles[0])
        .defer(d3.tsv, viualizationOptionsSite5.hospitalDataFiles[1])
        .defer(d3.tsv, viualizationOptionsSite5.hospitalDataFiles[2])
        .defer(d3.tsv, viualizationOptionsSite5.hospitalDataFiles[3])
        .defer(d3.tsv, viualizationOptionsSite5.hospitalLabelsTotalDataFile)
        .defer(d3.tsv, viualizationOptionsSite5.hospitalLabelsActivityDataFile)
        .defer(d3.tsv, viualizationOptionsSite5.populationDataFiles[0])
        .defer(d3.tsv, viualizationOptionsSite5.populationDataFiles[1])
        .defer(d3.tsv, viualizationOptionsSite5.populationDataFiles[2])
        .defer(d3.tsv, viualizationOptionsSite5.populationDataFiles[3])
        .defer(d3.json, swissMapOptionsSite5.swissMapJSONFile)
        .await(function(error, d1, d2, d3, d4, l1, l2, p1, p2, p3, p4, swissMapJSONData) {
            viualizationOptionsSite5.loadedHospitalData['2009'] = d1;
            viualizationOptionsSite5.loadedHospitalData['2010'] = d2;
            viualizationOptionsSite5.loadedHospitalData['2011'] = d3;
            viualizationOptionsSite5.loadedHospitalData['2012'] = d4;
            viualizationOptionsSite5.loadedHospitalLabelsTotalData = l1;
            viualizationOptionsSite5.loadedHospitalLabelsActivityData = l2;
            viualizationOptionsSite5.loadedPopulationData['2009'] = p1;
            viualizationOptionsSite5.loadedPopulationData['2010'] = p2;
            viualizationOptionsSite5.loadedPopulationData['2011'] = p3;
            viualizationOptionsSite5.loadedPopulationData['2012'] = p4;
            swissMapOptionsSite5.loadedSwissMapJSONFile = swissMapJSONData;
            dataProcessingSite5();
            initialDrawSwissMapSite5();
            initialDrawPieChartSite5();
            initialTableDrawSite5();
            updatePieChartDataSite5();
            updateTableDataSite5();
            updateSwissMapDataSite5();
            startVisualizationSite5();
        });
}

function updateSwissMapDataSite5(){
    if(swissMapOptionsSite5.viewStyle == swissMapOptionsSite5.viewStyleEnum.coloredDetailView){
        var tempDataAmoutOverOneYear;
        var tempPopulationAmoutOverSelectedPeriod;
        // Counter needed for average calculation of percent Data
        var countPercentData;
        // Each SVG canton
        for(var i = 0;i<swissMapOptionsSite5.cantons.features.length;i++){
            swissMapOptionsSite5.cantons.features[i]['dataValueToDisplay'] = dataGathererSite5(viualizationOptionsSite5.selectedDataKPI, swissMapOptionsSite5.cantons.features[i].id);
        }

        // Get extent of canton data (index0=min, index1=max)
        swissMapOptionsSite5.cantons.extent = [];
        for(var i = 0;i<swissMapOptionsSite5.cantons.features.length;i++){
            if(i == 0){
                // Initial borders
                swissMapOptionsSite5.cantons.extent[0] = swissMapOptionsSite5.cantons.features[i]['dataValueToDisplay'];
                swissMapOptionsSite5.cantons.extent[1] = swissMapOptionsSite5.cantons.features[i]['dataValueToDisplay'];
            }else{
                // Move border if greater or lower value
                if(swissMapOptionsSite5.cantons.features[i]['dataValueToDisplay']>swissMapOptionsSite5.cantons.extent[1]){
                    swissMapOptionsSite5.cantons.extent[1] = Math.ceil(swissMapOptionsSite5.cantons.features[i]['dataValueToDisplay']);
                }else if(swissMapOptionsSite5.cantons.features[i]['dataValueToDisplay']<swissMapOptionsSite5.cantons.extent[0]){
                    swissMapOptionsSite5.cantons.extent[0] = Math.floor(swissMapOptionsSite5.cantons.features[i]['dataValueToDisplay']);
                }
            }
        }

        // Calculate range for every step from tier to tier level
        var calculatedValueRange = (swissMapOptionsSite5.cantons.extent[1]-swissMapOptionsSite5.cantons.extent[0])/3;

        // Build tier object suited for the swissMpaView part
        // Every tier get an start vlaue and an end Value
        swissMapOptionsSite5.tierViewData = [];
        // Only 3 tiers supported
        for(var i = 0;i<3;i++){
            // Every tier is stored in an object
            swissMapOptionsSite5.tierViewData[i] = {}
            // Set tier name with specific index
            swissMapOptionsSite5.tierViewData[i].tier = "tier"+(i+1);
            // First tier (i==0), tier1, will get the minimum Value of all (extent[0])
            if(i==0)swissMapOptionsSite5.tierViewData[i].value = Math.floor(swissMapOptionsSite5.cantons.extent[0]);
            if(i==1)swissMapOptionsSite5.tierViewData[i].value = Math.round(Math.floor(swissMapOptionsSite5.cantons.extent[0]) + (Math.ceil(swissMapOptionsSite5.cantons.extent[1]) - Math.floor(swissMapOptionsSite5.cantons.extent[0]))/2);
            if(i==2)swissMapOptionsSite5.tierViewData[i].value = Math.ceil(swissMapOptionsSite5.cantons.extent[1]);
        }
    }
    updateSwissMapViewSite5();
}

function updateSwissMapViewSite5(){
    //Reset settings from previous views
    // Every CSS class from previous view will be resettet to default class "canton"
    d3.selectAll('#site5 .canton').style('fill', '#cccccc');
    // Remove old legend from an previous view
    $('#site5 .legend').remove();

    if(swissMapOptionsSite5.viewStyle == swissMapOptionsSite5.viewStyleEnum.singleSelectionView){
        // Specific view settings for the "singleSelectionView" (mouseover on a svg canton)
        // The canton with the mouseover will get selected by the id and gets the additional class selectedCanton
        if(viualizationOptionsSite5.selectedCanton !== ''){
            d3.select('#site5 #SVGcanton'+viualizationOptionsSite5.selectedCanton)
                .style('fill', '#2E90BD');
        }
    }else if(swissMapOptionsSite5.viewStyle == swissMapOptionsSite5.viewStyleEnum.colorlessNationalView){
        // Specific view settings for the "colorlessNationalView" (mouseout from an svg canton)

    }else if(swissMapOptionsSite5.viewStyle == swissMapOptionsSite5.viewStyleEnum.coloredDetailView){
        // Specific view settings for the "coloredDetailView" (mouseover on the displayed data table)
        // Get the generated tiewViewData object from the updateSwissMapDataSite5 function and create enterselection
        var legend = swissMapOptionsSite5.svg.selectAll("#site5 .legend")
            .data(swissMapOptionsSite5.tierViewData)
                .enter()
                .append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) {
                    // Normal swissMap legend position in top right corner
                    return "translate(-20," + i * 20 + ")";
                });
         
        // Create colored gradient
        var legendSVG = swissMapOptionsSite5.svg.append("g")
            .attr("class", "legend")
            .attr("width", 18)
            .attr("height", 54);

        var gradient = legendSVG.append("defs")
          .append("linearGradient")
            .attr("id", "gradientSite5")
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
            .attr("x", swissMapOptionsSite5.container_dimensions.width - 36)
            .attr("width", 18)
            .attr("height", 54)
            .style("fill", "url(#gradientSite5)");
        
        // Add text to the legend
        legend.append("text")
            .attr("x", swissMapOptionsSite5.container_dimensions.width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { 
                // Arguments[1] is the specific index for the specific legend part
                // this way is needed because the symbols "< > =" are diffrent for every tier
                if(arguments[1] == 0) return "Erster Wert bei " + Math.floor(swissMapOptionsSite5.cantons.extent[0]);
                if(arguments[1] == 1) return "Mittlerer Wert bei " + swissMapOptionsSite5.tierViewData[1].value;
                if(arguments[1] == 2) return "Letzter Wert bei " + Math.ceil(swissMapOptionsSite5.cantons.extent[1]);
            });

        // Add tier class to the specific svg canton
        swissMapOptionsSite5.svg.selectAll("#site5 .canton")
            .transition()
            .style('fill', function(d){
                // Go trough each data canton
                for(var i = 0;i<swissMapOptionsSite5.cantons.features.length;i++){
                    // SVG canton and data canton match
                    if(swissMapOptionsSite5.cantons.features[i].id == d.id){
                        calculatedPercentage = (swissMapOptionsSite5.cantons.features[i]['dataValueToDisplay'] == 0 ? 0 : 100*(swissMapOptionsSite5.cantons.features[i]['dataValueToDisplay']-Math.floor(swissMapOptionsSite5.cantons.extent[0]))/(Math.ceil(swissMapOptionsSite5.cantons.extent[1])-Math.floor(swissMapOptionsSite5.cantons.extent[0])));
                        return swissMapOptionsSite5.colorgradient(calculatedPercentage);
                    }
                }
            });
    }
}

function updateTableDataSite5(){
    // Viewstyle settings
    if(tableViewOptionsSite5.viewStyle == tableViewOptionsSite5.viewStyleEnum.nationalView){
        // Custom tableheading for acitve "nationalView" (no canton got an mouseover)
        tableViewOptionsSite5.panelHeading = 'Nationaler Überblick (Jahresdurchschnitt über selektierte Jahre)';
        tableViewOptionsSite5.tableHeading = ['Bezeichnung', 'Wert'];
    }else if(tableViewOptionsSite5.viewStyle == tableViewOptionsSite5.viewStyleEnum.cantonView){
        // Custom tableheading for acitve "cantonView" (a canton got an mouseover)
        tableViewOptionsSite5.panelHeading = 'Kanton ' + viualizationOptionsSite5.selectedCanton + ' Überblick (Jahresdurchschnitt über selektierte Jahre)';
        tableViewOptionsSite5.tableHeading = ['Bezeichnung', 'Wert'];
    }

    // Gather data for the displayed table
    // temporary variable used to summarize every medical environment from an single canton
    var tempDataAmoutOverOneYear;
    // temporary variable t
    var tempPopulationAmoutOverSelectedPeriod;
    // Counter needed for average calculation of percent Data
    var countPercentData;
    // tableContent will contain the data which will be displayed in the table, depending on the selected dataType total or splitted by activitytype
    if(viualizationOptionsSite5.selectedDataTypeTotActiv == viualizationOptionsSite5.dataTypeEnum.total){
        tableViewOptionsSite5.tableContent = $.extend(true, [], viualizationOptionsSite5.loadedHospitalLabelsTotalData);
    }else if(viualizationOptionsSite5.selectedDataTypeTotActiv == viualizationOptionsSite5.dataTypeEnum.activitytype){
        tableViewOptionsSite5.tableContent = $.extend(true, [], viualizationOptionsSite5.loadedHospitalLabelsActivityData);
    }
    // For better performance only process the selected Label Header
    // For each label
    for(var g = 0; g<tableViewOptionsSite5.tableContent[tableViewOptionsSite5.currentProcessedLabelHeader].values.length; g++){
        // Gather Data depending on the current KPI name and if an canton is selected or not
        if(viualizationOptionsSite5.selectedCanton == ''){
            tableViewOptionsSite5.tableContent[tableViewOptionsSite5.currentProcessedLabelHeader].values[g].value = Math.round10(dataGathererSite5(tableViewOptionsSite5.tableContent[tableViewOptionsSite5.currentProcessedLabelHeader].values[g].Name),-2);
        }else{
            tableViewOptionsSite5.tableContent[tableViewOptionsSite5.currentProcessedLabelHeader].values[g].value = Math.round10(dataGathererSite5(tableViewOptionsSite5.tableContent[tableViewOptionsSite5.currentProcessedLabelHeader].values[g].Name, viualizationOptionsSite5.selectedCanton),-2);
        }
    }
    updateTableViewSite5();
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

function initialTableDrawSite5(){
    // Remove displayed table with possible old values from previous viewstyles
    if (!$('#tableViewSite5').is(':empty')){
        $('#tableViewSite5').empty();
    }

    // Build new result panel
    var htmlPanel = $( '<div>' ).attr('class', 'panel panel-default');

    // Build new result panel-heading
    var htmlPanelHeading = $( '<div>' ).attr('class', 'panel-heading').css('table-layout', 'fixed'); 
    tableViewOptionsSite5.panelHeadingTitle = $( '<strong>' ).text(tableViewOptionsSite5.panelHeading)
    htmlPanelHeading.append( tableViewOptionsSite5.panelHeadingTitle );
    htmlPanel.append(htmlPanelHeading);

    var accordion = $( '<div>' ).attr('id', 'accordionSite5');

    // Build the accordion
    if(viualizationOptionsSite5.selectedDataTypeTotActiv == viualizationOptionsSite5.dataTypeEnum.total){
        for(var i = 0;i<viualizationOptionsSite5.loadedHospitalLabelsTotalData.length;i++){
            accordion.append($( '<h3>' ).text(viualizationOptionsSite5.loadedHospitalLabelsTotalData[i].key));
            tableViewOptionsSite5.htmlDataTables[i] = $( '<div>' );
            accordion.append(tableViewOptionsSite5.htmlDataTables[i]);
        }    
    }else if(viualizationOptionsSite5.selectedDataTypeTotActiv == viualizationOptionsSite5.dataTypeEnum.activitytype){
        for(var i = 0;i<viualizationOptionsSite5.loadedHospitalLabelsActivityData.length;i++){
            accordion.append($( '<h3>' ).text(viualizationOptionsSite5.loadedHospitalLabelsActivityData[i].key));
            tableViewOptionsSite5.htmlDataTables[i] = $( '<div>' );
            accordion.append(tableViewOptionsSite5.htmlDataTables[i]);
        }
    }

    $( '#tableViewSite5' ).append(htmlPanel);
    $( '#tableViewSite5' ).append(accordion);

    // Create JQuery UI Accordion on the displayed table
    $( "#site5 #accordionSite5" ).accordion({
        heightStyle: "content",
        event: "click hoverintent",
        active: tableViewOptionsSite5.currentProcessedLabelHeader,
        activate: function( event, ui ) {
            $('.blockHover').remove();
        },
        beforeActivate: function( event, ui ){
            tableViewOptionsSite5.currentProcessedLabelHeader = ui.newHeader.index()/2;
            updateTableDataSite5();
            // Needed to prevent instant hover on new table, before animation is complete
            $('body').append($('<div>').attr('class', 'blockHover').css({'position': 'fixed', 'width' : '100%', 'height': '100%', 'top': '0px', 'left': '0px', 'z-index': '1000'}));
        }
    });
}

function updateTableViewSite5(){

    // Set panelHeadingTitleText
    tableViewOptionsSite5.panelHeadingTitle.text(tableViewOptionsSite5.panelHeading);

    var htmlTable;
    var htmlTableHeading;
    var htmlTrTableHeading;

    // Build the accordion
    for(var i = 0;i<tableViewOptionsSite5.tableContent.length;i++){
            tableViewOptionsSite5.htmlDataTables[i].empty();
        // For better performance only process the selected Label Header
        if(i == tableViewOptionsSite5.currentProcessedLabelHeader){
            // Build new result table
            htmlTable = $( '<table>' ).attr('class', 'table table-hover');

            // Build new result table-heading
            htmlTrTableHeading = $( '<tr>' );
            for(var k = 0;k<tableViewOptionsSite5.tableHeading.length;k++){
                htmlTrTableHeading.append( $( '<th>' ).text( tableViewOptionsSite5.tableHeading[k] ) );
            }
            htmlTableHeading = $( '<thead>' ).append( htmlTrTableHeading );
            htmlTable.append(htmlTableHeading);

            // Iterate trough all found url's each found package
            for(var m = 0;m<tableViewOptionsSite5.tableContent[i].values.length;m++){
                if(viualizationOptionsSite5.selectedDataKPI == tableViewOptionsSite5.tableContent[i].values[m].Name){
                    htmlTable.append( $( '<tr>' ).attr('title', tableViewOptionsSite5.tableContent[i].values[m].Description).addClass('cursorHelp')
                                                    .append( $( '<td>' ).text( tableViewOptionsSite5.tableContent[i].values[m].Name ).css('width', '20px').addClass('success') )
                                                    .append( $( '<td>' ).text( numberWithCommasSite5(tableViewOptionsSite5.tableContent[i].values[m].value) + " CHF" ) )
                                                    .append( $( '<td>' ).text( tableViewOptionsSite5.tableContent[i].values[m].Description.substring(0,9) + "..." ) )
                                                );
                }else{
                    htmlTable.append( $( '<tr>' ).attr('title', tableViewOptionsSite5.tableContent[i].values[m].Description).addClass('cursorHelp')
                                                    .append( $( '<td>' ).text( tableViewOptionsSite5.tableContent[i].values[m].Name ).css('width', '20px') )
                                                    .append( $( '<td>' ).text( numberWithCommasSite5(tableViewOptionsSite5.tableContent[i].values[m].value) + " CHF" ) )
                                                    .append( $( '<td>' ).text( tableViewOptionsSite5.tableContent[i].values[m].Description.substring(0,9) + "..." ) )
                                                );
                }
            }

            tableViewOptionsSite5.htmlDataTables[i].append(htmlTable);
        }
    }

    $( "#accordionSite5" ).accordion( "refresh" );

    // Create onclick event to all tablerows from the displayed table
    // $('#tableViewSite5 tbody tr').mouseover(mouseoverTableRowSite5);
    $('#tableViewSite5 tbody tr').mouseenter(function(){
        stopVisualizationSite5();
        // Remove the css class from the displayed table rows which indicates an mouseover
        $('td').removeClass('success');
        // This is the actual row
        // the first child is the left cell on the current row
        $(this).children().first().addClass('success');
        // Save the selected KPI for further visualisation processes
        viualizationOptionsSite5.selectedDataKPI = $(this).children().first().text();
        tableViewOptionsSite5.isRowSelected = true;
        swissMapOptionsSite5.viewStyle = swissMapOptionsSite5.viewStyleEnum.coloredDetailView;
        updateSwissMapDataSite5();
        updatePieChartDataSite5();
    });
    $('#tableViewSite5 tbody tr').mouseout(function(){
       tableViewOptionsSite5.isRowSelected = false;
       startVisualizationSite5();
    });

    // Activate jQuery UI tooltip function
    // Adds tooltip to every element with an title attribute
    // Track option to follow the cursor
    $( document ).tooltip({
        track: true
    });
}

function dataProcessingSite5(){
    // Remove Empty, 'NA', oder not existing data rows from the Hospital Data
    for(var i = 2009; i<=2012; i++){
        viualizationOptionsSite5.loadedHospitalData[i].forEach(function(d){
            $.each(d, function(i, v){if(v=="NA" || v=="" || typeof v === "undefined")delete d[i];})
        });
        // Group every medical environment by canton
        viualizationOptionsSite5.loadedHospitalData[i] = d3.nest()
            .key(function(d) { return d.KT; })
            .entries(viualizationOptionsSite5.loadedHospitalData[i]);
        // Remove possible 'CH' canton or rows without canton groupkey
        viualizationOptionsSite5.loadedHospitalData[i].splice(26,2);
    }
    // Remove unused data from loaded populationData (only total and Kanton are used)
    for(var i = 2009; i<=2012; i++){
        viualizationOptionsSite5.loadedPopulationData[i].forEach(function(d){
            $.each(d, function(i, v){if(i!=="total" && i!=="Kanton")delete d[i];})
        });
    }
    // Group totalData labes by Header
    var data = viualizationOptionsSite5.loadedHospitalLabelsTotalData;
    var nest = d3.nest()
        .key(function(d) { return d.Header; });
    viualizationOptionsSite5.loadedHospitalLabelsTotalData = nest.entries(data);

    // Group activityData labes by Header
    data = viualizationOptionsSite5.loadedHospitalLabelsActivityData;
    nest = d3.nest()
        .key(function(d) { return d.Header; });
    viualizationOptionsSite5.loadedHospitalLabelsActivityData = nest.entries(data);
}

function createVisualizationControlsSite5(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite5').append( $('<p>').attr('id', 'displayDateRange') );
    // Container for the visual slider
    $('#visualizationControlsSite5').append( $('<div>').attr('id', 'displayDateRangeSilder').css('margin-left', '5px') );
    // addClass (col-md-3) to limit the width of the slider
    $('#displayDateRangeSilder').slider({
            range: true,
            min: 2009,
            max: 2012,
            values: [ 2009, 2012 ],
            slide: function( event, ui ) {
                    viualizationOptionsSite5.selectedStartYear = ui.values[ 0 ];
                    viualizationOptionsSite5.selectedEndYear = ui.values[ 1 ];
                    $('#displayDateRange').text('Zeitraum: ' + ui.values[ 0 ] + '-' + ui.values[ 1 ]);
                    updateTableDataSite5();
                    updateSwissMapDataSite5();
                }
        }).addClass('col-md-3');
    // Set initial selected year range
    $('#displayDateRange').text('Zeitraum: ' + $('#displayDateRangeSilder').slider('values', 0 ) + '-' + $('#displayDateRangeSilder').slider('values', 1 ));
    $('#visualizationControlsSite5').append( $('<br>') );

    // Create total / activitytype control buttons 
    $('#visualizationControlsSite5').append( $('<div>').attr('id', 'displayButtonsTotalActivity') );
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
            viualizationOptionsSite5.selectedDataTypeTotActiv = viualizationOptionsSite5.dataTypeEnum.activitytype;
            viualizationOptionsSite5.selectedDataKPI = 'PtageStatA';
            updatePieChartDataSite5();
            $('#pieChartViewSite5').show('slow');
            initialTableDrawSite5();
        }else{
            viualizationOptionsSite5.selectedDataTypeTotActiv = viualizationOptionsSite5.dataTypeEnum.total;
            $('#pieChartViewSite5').hide('slow');
            initialTableDrawSite5();
        }
        updateTableDataSite5();
        updateSwissMapDataSite5();
    });

    // Create absolute / relative control buttons 
    $('#visualizationControlsSite5').append( $('<div>').attr('id', 'displayButtonsAbsoluteRelative') );
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
            viualizationOptionsSite5.selectedDataTypeAbsRel = viualizationOptionsSite5.dataTypeEnum.relative;
            $('#displayRelativeDataControl').show('slow');
        }else{
            viualizationOptionsSite5.selectedDataTypeAbsRel = viualizationOptionsSite5.dataTypeEnum.absolute;
            $('#displayRelativeDataControl').hide('slow');
        }
        updateTableDataSite5();
        updateSwissMapDataSite5();
    });

    // Relative / Absolut Data Slider: Possible Slide Values
    for(var i = 0; i<viualizationOptionsSite5.amountOfAbsRelSliderValues; i++){
        viualizationOptionsSite5.selectableSlideValuesAbsRel[i] = Math.pow(10, i); 
    }

    // Create single ended slider for selecting the amount of relative data
    $('#visualizationControlsSite5').append( $('<div>').attr('id', 'displayRelativeDataControl') );
    $('#displayRelativeDataControl').append( $('<p>').attr('id', 'displayRelativeRange') );
    $('#displayRelativeDataControl').append( $('<div>').attr('id', 'displayRelativeRangeSlider').css('margin-left', '5px') );
    // addClass (col-md-3) to limit the width of the slider
    $('#displayRelativeRangeSlider').slider({
        range: "min",
        value: 0,
        min: 0,
        step: 1,
        max: (viualizationOptionsSite5.selectableSlideValuesAbsRel.length-1),
        slide: function( event, ui ) {
            $('#displayRelativeRange').text('Darstellung der Relativen Daten: pro ' + numberWithCommasSite5(viualizationOptionsSite5.selectableSlideValuesAbsRel[ui.value]) + ' Person(en)');
            viualizationOptionsSite5.selectedRelativeAmount = viualizationOptionsSite5.selectableSlideValuesAbsRel[ui.value];
            updateTableDataSite5();
            updateSwissMapDataSite5();
        }
    }).addClass('col-md-3');
    // Set initial selected amout of realtive data
    $('#displayRelativeRange').text('Darstellung der Relativen Daten: pro '+ numberWithCommasSite5(viualizationOptionsSite5.selectableSlideValuesAbsRel[$('#displayRelativeRangeSlider').slider( "option", "value" )]) + ' Person(en)');
}

function betweenPlusLowerBoundSite5(x, min, max) {
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
function numberWithCommasSite5(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

// Based on following source: //http://bl.ocks.org/dbuezas/9306799
function initialDrawPieChartSite5() {
    // Setup pieChart and legends SVG Size
    pieChartOptionsSite5.svg = d3.select("#site5 #pieChartViewSite5")
        .append("svg")
        .attr("width", pieChartOptionsSite5.container_dimensions.width)
        .attr("height", pieChartOptionsSite5.container_dimensions.height);
    pieChartOptionsSite5.radius = Math.min(pieChartOptionsSite5.container_dimensions.width, pieChartOptionsSite5.container_dimensions.height) / 2;

    // Create groups fo further elements
    pieChartOptionsSite5.svg.append("g")
        .attr("class", "slices");
    pieChartOptionsSite5.svg.append("g")
        .attr("class", "labels");
    pieChartOptionsSite5.svg.append("g")
        .attr("class", "lines");
    
    // Select Layout pie with disabled sorting function (sort(null)) and with associated accessor function (getting the values)
    pieChartOptionsSite5.pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

    // Define the arc for the actual pieChart (inner and outer curve of the circle)
    pieChartOptionsSite5.arc = d3.svg.arc()
        .outerRadius(pieChartOptionsSite5.radius * 0.8)
        .innerRadius(pieChartOptionsSite5.radius * 0.4);

    // Define the arc for the legend lines
    pieChartOptionsSite5.outerArc = d3.svg.arc()
        .innerRadius(pieChartOptionsSite5.radius * 0.9)
        .outerRadius(pieChartOptionsSite5.radius * 0.9);

    pieChartOptionsSite5.color = d3.scale.ordinal()
        .domain(pieChartOptionsSite5.labels)
        .range(["#80b1d3", "#f6c9d2", "#bc80bd", "#bf812d"]);

    pieChartOptionsSite5.titleText = pieChartOptionsSite5.svg.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .style("text-anchor", "middle")

}

function updatePieChartDataSite5(data) {

    // Get the current selected KPI Prefix (very char except the last char)
    pieChartOptionsSite5.currentKPIPrefix = viualizationOptionsSite5.selectedDataKPI.substring(0, viualizationOptionsSite5.selectedDataKPI.length - 1);

    // Create data array with all activitytype-labels to select based on the current selection
    // This will create an array containing objects with an label composed of the current KPI prefix and an activitytype ending
    pieChartOptionsSite5.slicesData = [];
    for(var i = 0;i<pieChartOptionsSite5.labels.length;i++){
        pieChartOptionsSite5.slicesData[i] = {label: pieChartOptionsSite5.labels[i], KPIName: pieChartOptionsSite5.currentKPIPrefix + viualizationOptionsSite5.activitytypeEndings[i]};
    }

    var tempPopulationAmoutOverSelectedPeriod;
    var tempDataAmoutOverOneYear;

    // Counter needed for average calculation of percent Data
    for(var i = 0;i<viualizationOptionsSite5.activitytypeEndings.length;i++){
        pieChartOptionsSite5.slicesData[i].value = dataGathererSite5(pieChartOptionsSite5.currentKPIPrefix + viualizationOptionsSite5.activitytypeEndings[i]);
    }
    updatePieChartViewSite5();
}

// Based on following source: //http://bl.ocks.org/dbuezas/9306799
function updatePieChartViewSite5(){

    //Draw Title
    pieChartOptionsSite5.titleText.text(pieChartOptionsSite5.currentKPIPrefix);

    data = pieChartOptionsSite5.slicesData;

    if($('#pieChartViewSite5').is(':hidden')){
        // Needed to prevent instant hover on other KPI, before animation is complete
        $('body').append($('<div>').attr('id', 'blockHover').css({'position': 'fixed', 'width' : '100%', 'height': '100%', 'top': '0px', 'left': '0px', 'z-index': '1000'}));
        $('#pieChartViewSite5').show('slow', function(){
            $('#blockHover').remove();
        });
    }

    var key = function(d){ return d.data.label; };    

    // Positioning of all groups and texts
    pieChartOptionsSite5.svg.selectAll("#site5 div#pieChartViewSite5 svg > g, #site5 div#pieChartViewSite5 svg > text")
        .attr("transform", "translate(" + pieChartOptionsSite5.container_dimensions.width / 2 + "," + pieChartOptionsSite5.container_dimensions.height / 2 + ")");

    /* ------- PIE SLICES -------*/
    var slice = pieChartOptionsSite5.svg.select("#site5 .slices").selectAll("#site5 path.slice")
        .data(pieChartOptionsSite5.pie(data), key);

    slice.enter()
        .insert("path")
        .style("fill", function(d) { return pieChartOptionsSite5.color(d.data.label); })
        .attr("class", "slice");

    slice       
        .transition().duration(1000)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return pieChartOptionsSite5.arc(interpolate(t));
            };
        });

    slice.on("mouseenter",function (d){
            stopVisualizationSite5();
            pieChartOptionsSite5.isSliceSelected = true;
            var currentSlice = this;
            d3.selectAll("#site5 .slice").style("opacity", function(){
                return (this === currentSlice) ? 1.0 : 0.25;
            });
            d3.selectAll("#site5 .slice").style("stroke", function(d){
                console.log(pieChartOptionsSite5.color(d.data.label));
                return (this === currentSlice) ? pieChartOptionsSite5.color(d.data.label) : null;
            });
            viualizationOptionsSite5.selectedDataKPI = d.data.KPIName;
            swissMapOptionsSite5.viewStyle = swissMapOptionsSite5.viewStyleEnum.coloredDetailView;
            updateSwissMapDataSite5();
            updateTableDataSite5();
        })

    slice.on("mouseout",function (d){
            pieChartOptionsSite5.isSliceSelected = false;
            d3.selectAll("#site5 .slice").style("opacity", 1);
            d3.selectAll("#site5 .slice").style("stroke", null);
            viualizationOptionsSite5.selectedCanton = '';
            tableViewOptionsSite5.viewStyle = tableViewOptionsSite5.viewStyleEnum.nationalView;
            updateTableDataSite5();
            updateSwissMapDataSite5();
            startVisualizationSite5();
        })


    slice.exit()
        .remove();

    /* ------- TEXT LABELS -------*/

    var text = pieChartOptionsSite5.svg.select("#site5 .labels").selectAll("#site5 text")
        .data(pieChartOptionsSite5.pie(data), key);

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
                var pos = pieChartOptionsSite5.outerArc.centroid(d2);
                pos[0] = pieChartOptionsSite5.radius * (midAngle(d2) < Math.PI ? 1 : -1);
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

    var polyline = pieChartOptionsSite5.svg.select("#site5 .lines").selectAll("#site5 polyline")
        .data(pieChartOptionsSite5.pie(data), key);
    
    polyline.enter()
        .append("polyline");

    polyline.transition().duration(1000)
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = pieChartOptionsSite5.outerArc.centroid(d2);
                pos[0] = pieChartOptionsSite5.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [pieChartOptionsSite5.arc.centroid(d2), pieChartOptionsSite5.outerArc.centroid(d2), pos];
            };          
        });
    
    polyline.exit()
        .remove();
}

// gather all data for specific KPI (canton is optional)
// If canton is set, then only for the set canton data will be gathered
// IF canton is not set (undefined) all data from every canton will be gathered
function dataGathererSite5(KPItoGather, canton){

    var countPercentData = 0;
    var tempPopulationAmoutOverSelectedPeriod = 0;
    var KPIValue = 0;

    // Go trough every slected year
    for(var k = viualizationOptionsSite5.selectedStartYear; k<=viualizationOptionsSite5.selectedEndYear; k++){
        // Reset countPercentData if label starts with small p (indicates a percent data column)
        if(KPItoGather.charAt(0) == 'p')countPercentData=0;
        // temporary yearly variable
        // used to add every value form every medical environment
        tempDataAmoutOverOneYear = 0;
        // Go trough every canton
        for(var m = 0;m<viualizationOptionsSite5.loadedHospitalData[k].length;m++){
            // Only for selected canton or for all cantons if selectedCanton == '' (means national view)
            if((canton == undefined) || (viualizationOptionsSite5.loadedHospitalData[k][m].key == canton)){
                // Go trough every medical environment
                for(var o = 0;o<viualizationOptionsSite5.loadedHospitalData[k][m].values.length;o++){
                    // Filter set without data
                    if(typeof viualizationOptionsSite5.loadedHospitalData[k][m].values[o][KPItoGather] !== 'undefined'){
                        // Convert number from point notation to comma notation
                        viualizationOptionsSite5.loadedHospitalData[k][m].values[o][KPItoGather].replace('.',',');
                        // second plus needed to convert string to number
                        tempDataAmoutOverOneYear += +viualizationOptionsSite5.loadedHospitalData[k][m].values[o][KPItoGather];
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
    KPIValue = KPIValue / (viualizationOptionsSite5.selectedEndYear - viualizationOptionsSite5.selectedStartYear + 1);
    // Condition if relative data is selected
    if(viualizationOptionsSite5.selectedDataTypeAbsRel == viualizationOptionsSite5.dataTypeEnum.relative){
        tempPopulationAmoutOverSelectedPeriod = 0
        // Every selected year
        for(var k = viualizationOptionsSite5.selectedStartYear; k<=viualizationOptionsSite5.selectedEndYear; k++){
            // Go search canton
            for(var m = 0; m<viualizationOptionsSite5.loadedPopulationData[k].length; m++){
                // Add summarized year and calcualte average for the national view if selectedCanton == '' (means national view, no cantons selected)
                if((viualizationOptionsSite5.loadedPopulationData[k][m].Kanton == 'CH') && (canton == undefined)){
                    tempPopulationAmoutOverSelectedPeriod += +viualizationOptionsSite5.loadedPopulationData[k][m].total;
                }
                // Add summarized year and calcualte average for the cantonal view if selectedCanton matches (means cantonView, one canton got mouseover)
                if(viualizationOptionsSite5.loadedPopulationData[k][m].Kanton == canton){
                    tempPopulationAmoutOverSelectedPeriod += +viualizationOptionsSite5.loadedPopulationData[k][m].total;
                }
            }
        }
        // Divide by amout of selected years
        tempPopulationAmoutOverSelectedPeriod = tempPopulationAmoutOverSelectedPeriod / (viualizationOptionsSite5.selectedEndYear - viualizationOptionsSite5.selectedStartYear + 1);
        // Multiplay by amout of selected relative data
        KPIValue = KPIValue * viualizationOptionsSite5.selectedRelativeAmount;
        // Divide by population
        KPIValue = KPIValue / tempPopulationAmoutOverSelectedPeriod;
    }
    return KPIValue;
}

function stopVisualizationSite5(){
    window.clearInterval(viualizationOptionsSite5.runningVisualization);
    delete viualizationOptionsSite5.runningVisualization;
}

function startVisualizationSite5(){
    visualizationSite5();
    viualizationOptionsSite5.runningVisualization = setInterval(visualizationSite5, 5000);
}

function visualizationSite5(){
    if(viualizationOptionsSite5.runningVisualization !== undefined){
        swissMapOptionsSite5.viewStyle = swissMapOptionsSite5.viewStyleEnum.coloredDetailView;
        viualizationOptionsSite5.currentVisualizedKPI++;
        viualizationOptionsSite5.currentVisualizedKPI = viualizationOptionsSite5.currentVisualizedKPI % viualizationOptionsSite5.visualizationSteps;
            
        switch(viualizationOptionsSite5.currentVisualizedKPI) {
          case 0:
            viualizationOptionsSite5.selectedDataKPI = 'KostStatA';
            break;
          case 1:
            viualizationOptionsSite5.selectedDataKPI = 'KostStatP';
            break;
          case 2:
            viualizationOptionsSite5.selectedDataKPI = 'KostStatR';
            break;
          case 3:
            viualizationOptionsSite5.selectedDataKPI = 'KostStatB';
            break;
          default:
              console.log('Error: No switchcase');
            }
        updateTableDataSite5();
        updateSwissMapDataSite5();
        updatePieChartDataSite5();
    }
}

$(document).ready(function(){
    createVisualizationControlsSite5();
    loadDataSite5();
});