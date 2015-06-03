// Globally used options / variables in relaiton to the swissmap
var swissMapOptionsSite2 = {
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
var pieChartOptionsSite2 = {
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
var tableViewOptionsSite2 = {
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
var viualizationOptionsSite2 = {
    hospitalDataFiles: ['tsv/Kennzahlen_Spital/kzp09.tsv',
            'tsv/Kennzahlen_Spital/kzp10.tsv',
            'tsv/Kennzahlen_Spital/kzp11.tsv',
            'tsv/Kennzahlen_Spital/kzp12.tsv'],
    hospitalLabelsTotalDataFile: 'tsv/Kennzahlen_Spital/labelsTotaleDaten.tsv',
    hospitalLabelsActivityDataFile: 'tsv/Kennzahlen_Spital/labelsAktivitaetsDatenSite2.tsv',
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
    selectedDataKPI: 'BettenStatA',
    selectedStartYear: 2009,
    selectedEndYear: 2012,
    selectedRelativeAmount: 1000000,
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

function initialDrawSwissMapSite2(){
    // Projection settings of the swissmap
    var projection = d3.geo.albers()
        .rotate([0, 0])
        .center([8.4, 46.7])
        .scale(12500)
        .translate([swissMapOptionsSite2.container_dimensions.width / 2, swissMapOptionsSite2.container_dimensions.height / 2])
        .precision(.1);

    var path = d3.geo.path()
        .projection(projection);

    swissMapOptionsSite2.svg = d3.select("#site2 #swissMapVisualizationSite2").append("svg")
        .attr("width", swissMapOptionsSite2.container_dimensions.width)
        .attr("height", swissMapOptionsSite2.container_dimensions.height)
        .attr("id", "svg");

    var tooltip = d3.select("#site2 #swissMapVisualizationSite2")
        .append("div")
        .attr("id", "tooltip");

    // Load canton data from topojson
    swissMapOptionsSite2.cantons = topojson.feature(swissMapOptionsSite2.loadedSwissMapJSONFile, swissMapOptionsSite2.loadedSwissMapJSONFile.objects.cantons);

    // Draws each Canton as a seperate Object, needed for specific selection
    swissMapOptionsSite2.svg.selectAll("#site2 .canton")
        .data(topojson.feature(swissMapOptionsSite2.loadedSwissMapJSONFile, swissMapOptionsSite2.loadedSwissMapJSONFile.objects.cantons).features)
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
            stopVisualizationSite2();
            viualizationOptionsSite2.selectedCanton = d.id;
            tableViewOptionsSite2.viewStyle = tableViewOptionsSite2.viewStyleEnum.cantonView;
            updateTableDataSite2();
            swissMapOptionsSite2.viewStyle = swissMapOptionsSite2.viewStyleEnum.singleSelectionView;
            updateSwissMapDataSite2();
        })
        .on("mouseout",function (d){
            viualizationOptionsSite2.selectedCanton = '';
            viualizationOptionsSite2.selectedDataKPI = '';
            tableViewOptionsSite2.viewStyle = tableViewOptionsSite2.viewStyleEnum.nationalView;
            updateTableDataSite2();
            swissMapOptionsSite2.viewStyle = swissMapOptionsSite2.viewStyleEnum.colorlessNationalView;
            updateSwissMapDataSite2();
            startVisualizationSite2();
        });

    //Draws the borders of the cantons
    swissMapOptionsSite2.svg.append("path")
        .datum(topojson.mesh(swissMapOptionsSite2.loadedSwissMapJSONFile, swissMapOptionsSite2.loadedSwissMapJSONFile.objects.cantons, function (a, b) {
            return a !== b;
        }))
        .attr("class", "canton-boundary")
        .attr("d", path)

    //draws the Labels of the cantons
    swissMapOptionsSite2.svg.selectAll("#site2 text")
        .data(swissMapOptionsSite2.cantons.features)
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
    swissMapOptionsSite2.colorgradient = d3.scale.linear()
        .domain([0, 50, 100])
        .range(["#91CF60", "#FFFFBF", "#FC8D59"]);
}

function loadDataSite2(){
    queue()
        .defer(d3.tsv, viualizationOptionsSite2.hospitalDataFiles[0])
        .defer(d3.tsv, viualizationOptionsSite2.hospitalDataFiles[1])
        .defer(d3.tsv, viualizationOptionsSite2.hospitalDataFiles[2])
        .defer(d3.tsv, viualizationOptionsSite2.hospitalDataFiles[3])
        .defer(d3.tsv, viualizationOptionsSite2.hospitalLabelsTotalDataFile)
        .defer(d3.tsv, viualizationOptionsSite2.hospitalLabelsActivityDataFile)
        .defer(d3.tsv, viualizationOptionsSite2.populationDataFiles[0])
        .defer(d3.tsv, viualizationOptionsSite2.populationDataFiles[1])
        .defer(d3.tsv, viualizationOptionsSite2.populationDataFiles[2])
        .defer(d3.tsv, viualizationOptionsSite2.populationDataFiles[3])
        .defer(d3.json, swissMapOptionsSite2.swissMapJSONFile)
        .await(function(error, d1, d2, d3, d4, l1, l2, p1, p2, p3, p4, swissMapJSONData) {
            viualizationOptionsSite2.loadedHospitalData['2009'] = d1;
            viualizationOptionsSite2.loadedHospitalData['2010'] = d2;
            viualizationOptionsSite2.loadedHospitalData['2011'] = d3;
            viualizationOptionsSite2.loadedHospitalData['2012'] = d4;
            viualizationOptionsSite2.loadedHospitalLabelsTotalData = l1;
            viualizationOptionsSite2.loadedHospitalLabelsActivityData = l2;
            viualizationOptionsSite2.loadedPopulationData['2009'] = p1;
            viualizationOptionsSite2.loadedPopulationData['2010'] = p2;
            viualizationOptionsSite2.loadedPopulationData['2011'] = p3;
            viualizationOptionsSite2.loadedPopulationData['2012'] = p4;
            swissMapOptionsSite2.loadedSwissMapJSONFile = swissMapJSONData;
            dataProcessingSite2();
            initialDrawSwissMapSite2();
            initialDrawPieChartSite2();
            initialTableDrawSite2();
            updatePieChartDataSite2();
            updateTableDataSite2();
            updateSwissMapDataSite2();
            startVisualizationSite2();
        });
}

function updateSwissMapDataSite2(){
    if(swissMapOptionsSite2.viewStyle == swissMapOptionsSite2.viewStyleEnum.coloredDetailView){
        var tempDataAmoutOverOneYear;
        var tempPopulationAmoutOverSelectedPeriod;
        // Counter needed for average calculation of percent Data
        var countPercentData;
        // Each SVG canton
        for(var i = 0;i<swissMapOptionsSite2.cantons.features.length;i++){
            swissMapOptionsSite2.cantons.features[i]['dataValueToDisplay'] = dataGathererSite2(viualizationOptionsSite2.selectedDataKPI, swissMapOptionsSite2.cantons.features[i].id);
        }

        // Get extent of canton data (index0=min, index1=max)
        swissMapOptionsSite2.cantons.extent = [];
        for(var i = 0;i<swissMapOptionsSite2.cantons.features.length;i++){
            if(i == 0){
                // Initial borders
                swissMapOptionsSite2.cantons.extent[0] = swissMapOptionsSite2.cantons.features[i]['dataValueToDisplay'];
                swissMapOptionsSite2.cantons.extent[1] = swissMapOptionsSite2.cantons.features[i]['dataValueToDisplay'];
            }else{
                // Move border if greater or lower value
                if(swissMapOptionsSite2.cantons.features[i]['dataValueToDisplay']>swissMapOptionsSite2.cantons.extent[1]){
                    swissMapOptionsSite2.cantons.extent[1] = Math.ceil(swissMapOptionsSite2.cantons.features[i]['dataValueToDisplay']);
                }else if(swissMapOptionsSite2.cantons.features[i]['dataValueToDisplay']<swissMapOptionsSite2.cantons.extent[0]){
                    swissMapOptionsSite2.cantons.extent[0] = Math.floor(swissMapOptionsSite2.cantons.features[i]['dataValueToDisplay']);
                }
            }
        }
        
        // Calculate range for every step from tier to tier level
        var calculatedValueRange = (swissMapOptionsSite2.cantons.extent[1]-swissMapOptionsSite2.cantons.extent[0])/3;

        // Build tier object suited for the swissMpaView part
        // Every tier get an start vlaue and an end Value
        swissMapOptionsSite2.tierViewData = [];
        // Only 3 tiers supported
        for(var i = 0;i<3;i++){
            // Every tier is stored in an object
            swissMapOptionsSite2.tierViewData[i] = {}
            // Set tier name with specific index
            swissMapOptionsSite2.tierViewData[i].tier = "tier"+(i+1);
            // First tier (i==0), tier1, will get the minimum Value of all (extent[0])
            if(i==0)swissMapOptionsSite2.tierViewData[i].value = Math.floor(swissMapOptionsSite2.cantons.extent[0]);
            if(i==1)swissMapOptionsSite2.tierViewData[i].value = Math.round(Math.floor(swissMapOptionsSite2.cantons.extent[0]) + (Math.ceil(swissMapOptionsSite2.cantons.extent[1]) - Math.floor(swissMapOptionsSite2.cantons.extent[0]))/2);
            if(i==2)swissMapOptionsSite2.tierViewData[i].value = Math.ceil(swissMapOptionsSite2.cantons.extent[1]);
        }
    }
    updateSwissMapViewSite2();
}

function updateSwissMapViewSite2(){
    //Reset settings from previous views
    // Every CSS class from previous view will be resettet to default class "canton"
    d3.selectAll('#site2 .canton').style('fill', '#cccccc');
    // Remove old legend from an previous view
    $('#site2 .legend').remove();

    if(swissMapOptionsSite2.viewStyle == swissMapOptionsSite2.viewStyleEnum.singleSelectionView){
        // Specific view settings for the "singleSelectionView" (mouseover on a svg canton)
        // The canton with the mouseover will get selected by the id and gets the additional class selectedCanton
        if(viualizationOptionsSite2.selectedCanton !== ''){
            d3.select('#site2 #SVGcanton'+viualizationOptionsSite2.selectedCanton)
                .style('fill', '#2E90BD');
        }
    }else if(swissMapOptionsSite2.viewStyle == swissMapOptionsSite2.viewStyleEnum.colorlessNationalView){
        // Specific view settings for the "colorlessNationalView" (mouseout from an svg canton)

    }else if(swissMapOptionsSite2.viewStyle == swissMapOptionsSite2.viewStyleEnum.coloredDetailView){
        // Specific view settings for the "coloredDetailView" (mouseover on the displayed data table)
        // Get the generated tiewViewData object from the updateSwissMapDataSite2 function and create enterselection
        var legend = swissMapOptionsSite2.svg.selectAll("#site2 .legend")
            .data(swissMapOptionsSite2.tierViewData)
                .enter()
                .append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) {
                    // Normal swissMap legend position in top right corner
                    return "translate(-20," + i * 20 + ")";
                });
         
        // Create colored gradient
        var legendSVG = swissMapOptionsSite2.svg.append("g")
            .attr("class", "legend")
            .attr("width", 18)
            .attr("height", 54);

        var gradient = legendSVG.append("defs")
          .append("linearGradient")
            .attr("id", "gradientSite2")
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
            .attr("x", swissMapOptionsSite2.container_dimensions.width - 36)
            .attr("width", 18)
            .attr("height", 54)
            .style("fill", "url(#gradientSite2)");
        
        // Add text to the legend
        legend.append("text")
            .attr("x", swissMapOptionsSite2.container_dimensions.width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { 
                // Arguments[1] is the specific index for the specific legend part
                // this way is needed because the symbols "< > =" are diffrent for every tier
                if(arguments[1] == 0) return "Erster Wert bei " + Math.floor(swissMapOptionsSite2.cantons.extent[0]);
                if(arguments[1] == 1) return "Mittlerer Wert bei " + swissMapOptionsSite2.tierViewData[1].value;
                if(arguments[1] == 2) return "Letzter Wert bei " + Math.ceil(swissMapOptionsSite2.cantons.extent[1]);
               
            });

        // Add tier class to the specific svg canton
        var calculatedPercentage;
        swissMapOptionsSite2.svg.selectAll("#site2 .canton")
            .transition()
            .style('fill', function(d){
                // Go trough each data canton
                for(var i = 0;i<swissMapOptionsSite2.cantons.features.length;i++){
                    // SVG canton and data canton match
                    if(swissMapOptionsSite2.cantons.features[i].id == d.id){
                        calculatedPercentage = (swissMapOptionsSite2.cantons.features[i]['dataValueToDisplay'] == 0 ? 0 : 100*(swissMapOptionsSite2.cantons.features[i]['dataValueToDisplay']-Math.floor(swissMapOptionsSite2.cantons.extent[0]))/(Math.ceil(swissMapOptionsSite2.cantons.extent[1])-Math.floor(swissMapOptionsSite2.cantons.extent[0])));
                        return swissMapOptionsSite2.colorgradient(calculatedPercentage);
                    }
                }
            });
    }
}

function updateTableDataSite2(){
    // Viewstyle settings
    if(tableViewOptionsSite2.viewStyle == tableViewOptionsSite2.viewStyleEnum.nationalView){
        // Custom tableheading for acitve "nationalView" (no canton got an mouseover)
        tableViewOptionsSite2.panelHeading = 'Nationaler Überblick (Jahresdurchschnitt über selektierte Jahre)';
        tableViewOptionsSite2.tableHeading = ['Bezeichnung', 'Wert'];
    }else if(tableViewOptionsSite2.viewStyle == tableViewOptionsSite2.viewStyleEnum.cantonView){
        // Custom tableheading for acitve "cantonView" (a canton got an mouseover)
        tableViewOptionsSite2.panelHeading = 'Kanton ' + viualizationOptionsSite2.selectedCanton + ' Überblick (Jahresdurchschnitt über selektierte Jahre)';
        tableViewOptionsSite2.tableHeading = ['Bezeichnung', 'Wert'];
    }

    // Gather data for the displayed table
    // temporary variable used to summarize every medical environment from an single canton
    var tempDataAmoutOverOneYear;
    // temporary variable t
    var tempPopulationAmoutOverSelectedPeriod;
    // Counter needed for average calculation of percent Data
    var countPercentData;
    // tableContent will contain the data which will be displayed in the table, depending on the selected dataType total or splitted by activitytype
    if(viualizationOptionsSite2.selectedDataTypeTotActiv == viualizationOptionsSite2.dataTypeEnum.total){
        tableViewOptionsSite2.tableContent = $.extend(true, [], viualizationOptionsSite2.loadedHospitalLabelsTotalData);
    }else if(viualizationOptionsSite2.selectedDataTypeTotActiv == viualizationOptionsSite2.dataTypeEnum.activitytype){
        tableViewOptionsSite2.tableContent = $.extend(true, [], viualizationOptionsSite2.loadedHospitalLabelsActivityData);
    }
    // For better performance only process the selected Label Header
    // For each label
    for(var g = 0; g<tableViewOptionsSite2.tableContent[tableViewOptionsSite2.currentProcessedLabelHeader].values.length; g++){
        // Gather Data depending on the current KPI name and if an canton is selected or not
        if(viualizationOptionsSite2.selectedCanton == ''){            
            tableViewOptionsSite2.tableContent[tableViewOptionsSite2.currentProcessedLabelHeader].values[g].value = Math.round(dataGathererSite2(tableViewOptionsSite2.tableContent[tableViewOptionsSite2.currentProcessedLabelHeader].values[g].Name));
        }else{
            tableViewOptionsSite2.tableContent[tableViewOptionsSite2.currentProcessedLabelHeader].values[g].value = Math.round(dataGathererSite2(tableViewOptionsSite2.tableContent[tableViewOptionsSite2.currentProcessedLabelHeader].values[g].Name, viualizationOptionsSite2.selectedCanton));
        }
    }
    updateTableViewSite2();
}

function initialTableDrawSite2(){
    // Remove displayed table with possible old values from previous viewstyles
    if (!$('#tableViewSite2').is(':empty')){
        $('#tableViewSite2').empty();
    }

    // Build new result panel
    var htmlPanel = $( '<div>' ).attr('class', 'panel panel-default');

    // Build new result panel-heading
    var htmlPanelHeading = $( '<div>' ).attr('class', 'panel-heading').css('table-layout', 'fixed'); 
    tableViewOptionsSite2.panelHeadingTitle = $( '<strong>' ).text(tableViewOptionsSite2.panelHeading)
    htmlPanelHeading.append( tableViewOptionsSite2.panelHeadingTitle );
    htmlPanel.append(htmlPanelHeading);

    var accordion = $( '<div>' ).attr('id', 'accordionSite2');

    // Build the accordion
    if(viualizationOptionsSite2.selectedDataTypeTotActiv == viualizationOptionsSite2.dataTypeEnum.total){
        for(var i = 0;i<viualizationOptionsSite2.loadedHospitalLabelsTotalData.length;i++){
            accordion.append($( '<h3>' ).text(viualizationOptionsSite2.loadedHospitalLabelsTotalData[i].key));
            tableViewOptionsSite2.htmlDataTables[i] = $( '<div>' );
            accordion.append(tableViewOptionsSite2.htmlDataTables[i]);
        }    
    }else if(viualizationOptionsSite2.selectedDataTypeTotActiv == viualizationOptionsSite2.dataTypeEnum.activitytype){
        for(var i = 0;i<viualizationOptionsSite2.loadedHospitalLabelsActivityData.length;i++){
            accordion.append($( '<h3>' ).text(viualizationOptionsSite2.loadedHospitalLabelsActivityData[i].key));
            tableViewOptionsSite2.htmlDataTables[i] = $( '<div>' );
            accordion.append(tableViewOptionsSite2.htmlDataTables[i]);
        }
    }

    $( '#tableViewSite2' ).append(htmlPanel);
    $( '#tableViewSite2' ).append(accordion);

    // Create JQuery UI Accordion on the displayed table
    $( "#site2 #accordionSite2" ).accordion({
        heightStyle: "content",
        event: "click hoverintent",
        active: tableViewOptionsSite2.currentProcessedLabelHeader,
        activate: function( event, ui ) {
            $('.blockHover').remove();
        },
        beforeActivate: function( event, ui ){
            tableViewOptionsSite2.currentProcessedLabelHeader = ui.newHeader.index()/2;
            updateTableDataSite2();
            // Needed to prevent instant hover on new table, before animation is complete
            $('body').append($('<div>').attr('class', 'blockHover').css({'position': 'fixed', 'width' : '100%', 'height': '100%', 'top': '0px', 'left': '0px', 'z-index': '1000'}));
        }
    });
}

function updateTableViewSite2(){

    // Set panelHeadingTitleText
    tableViewOptionsSite2.panelHeadingTitle.text(tableViewOptionsSite2.panelHeading);

    var htmlTable;
    var htmlTableHeading;
    var htmlTrTableHeading;

    // Build the accordion
    for(var i = 0;i<tableViewOptionsSite2.tableContent.length;i++){
            tableViewOptionsSite2.htmlDataTables[i].empty();
        // For better performance only process the selected Label Header
        if(i == tableViewOptionsSite2.currentProcessedLabelHeader){
            // Build new result table
            htmlTable = $( '<table>' ).attr('class', 'table table-hover');

            // Build new result table-heading
            htmlTrTableHeading = $( '<tr>' );
            for(var k = 0;k<tableViewOptionsSite2.tableHeading.length;k++){
                htmlTrTableHeading.append( $( '<th>' ).text( tableViewOptionsSite2.tableHeading[k] ) );
            }
            htmlTableHeading = $( '<thead>' ).append( htmlTrTableHeading );
            htmlTable.append(htmlTableHeading);

            // Iterate trough all found url's each found package
            for(var m = 0;m<tableViewOptionsSite2.tableContent[i].values.length;m++){
                if(viualizationOptionsSite2.selectedDataKPI == tableViewOptionsSite2.tableContent[i].values[m].Name){
                    htmlTable.append( $( '<tr>' ).attr('title', tableViewOptionsSite2.tableContent[i].values[m].Description).addClass('cursorHelp')
                                                    .append( $( '<td>' ).text( tableViewOptionsSite2.tableContent[i].values[m].Name ).css('width', '20px').addClass('success') )
                                                    .append( $( '<td>' ).text( numberWithCommasSite2(tableViewOptionsSite2.tableContent[i].values[m].value) ) )
                                                    .append( $( '<td>' ).text( tableViewOptionsSite2.tableContent[i].values[m].Description.substring(0,9) + "..." ) )
                                                );
                }else{
                    htmlTable.append( $( '<tr>' ).attr('title', tableViewOptionsSite2.tableContent[i].values[m].Description).addClass('cursorHelp')
                                                    .append( $( '<td>' ).text( tableViewOptionsSite2.tableContent[i].values[m].Name ).css('width', '20px') )
                                                    .append( $( '<td>' ).text( numberWithCommasSite2(tableViewOptionsSite2.tableContent[i].values[m].value) ) )
                                                    .append( $( '<td>' ).text( tableViewOptionsSite2.tableContent[i].values[m].Description.substring(0,9) + "..." ) )
                                                );
                }
            }

            tableViewOptionsSite2.htmlDataTables[i].append(htmlTable);
        }
    }

    $( "#accordionSite2" ).accordion( "refresh" );

    // Create onclick event to all tablerows from the displayed table
    // $('#tableViewSite2 tbody tr').mouseover(mouseoverTableRowSite2);
    $('#tableViewSite2 tbody tr').mouseenter(function(){
        stopVisualizationSite2();
        // Remove the css class from the displayed table rows which indicates an mouseover
        $('td').removeClass('success');
        // This is the actual row
        // the first child is the left cell on the current row
        $(this).children().first().addClass('success');
        // Save the selected KPI for further visualisation processes
        viualizationOptionsSite2.selectedDataKPI = $(this).children().first().text();
        tableViewOptionsSite2.isRowSelected = true;
        swissMapOptionsSite2.viewStyle = swissMapOptionsSite2.viewStyleEnum.coloredDetailView;
        updateSwissMapDataSite2();
        updatePieChartDataSite2();
    });
    $('#tableViewSite2 tbody tr').mouseout(function(){
       tableViewOptionsSite2.isRowSelected = false;
       startVisualizationSite2();
    });

    // Activate jQuery UI tooltip function
    // Adds tooltip to every element with an title attribute
    // Track option to follow the cursor
    $( document ).tooltip({
        track: true
    });
}

function dataProcessingSite2(){
    // Remove Empty, 'NA', oder not existing data rows from the Hospital Data
    for(var i = 2009; i<=2012; i++){
        viualizationOptionsSite2.loadedHospitalData[i].forEach(function(d){
            $.each(d, function(i, v){if(v=="NA" || v=="" || typeof v === "undefined")delete d[i];})
        });
        // Group every medical environment by canton
        viualizationOptionsSite2.loadedHospitalData[i] = d3.nest()
            .key(function(d) { return d.KT; })
            .entries(viualizationOptionsSite2.loadedHospitalData[i]);
        // Remove possible 'CH' canton or rows without canton groupkey
        viualizationOptionsSite2.loadedHospitalData[i].splice(26,2);
    }
    // Remove unused data from loaded populationData (only total and Kanton are used)
    for(var i = 2009; i<=2012; i++){
        viualizationOptionsSite2.loadedPopulationData[i].forEach(function(d){
            $.each(d, function(i, v){if(i!=="total" && i!=="Kanton")delete d[i];})
        });
    }
    // Group totalData labes by Header
    var data = viualizationOptionsSite2.loadedHospitalLabelsTotalData;
    var nest = d3.nest()
        .key(function(d) { return d.Header; });
    viualizationOptionsSite2.loadedHospitalLabelsTotalData = nest.entries(data);

    // Group activityData labes by Header
    data = viualizationOptionsSite2.loadedHospitalLabelsActivityData;
    nest = d3.nest()
        .key(function(d) { return d.Header; });
    viualizationOptionsSite2.loadedHospitalLabelsActivityData = nest.entries(data);
}

function createVisualizationControlsSite2(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite2').append( $('<p>').attr('id', 'displayDateRange') );
    // Container for the visual slider
    $('#visualizationControlsSite2').append( $('<div>').attr('id', 'displayDateRangeSilder').css('margin-left', '5px') );
    // addClass (col-md-3) to limit the width of the slider
    $('#displayDateRangeSilder').slider({
            range: true,
            min: 2009,
            max: 2012,
            values: [ 2009, 2012 ],
            slide: function( event, ui ) {
                    viualizationOptionsSite2.selectedStartYear = ui.values[ 0 ];
                    viualizationOptionsSite2.selectedEndYear = ui.values[ 1 ];
                    $('#displayDateRange').text('Zeitraum: ' + ui.values[ 0 ] + '-' + ui.values[ 1 ]);
                    updateTableDataSite2();
                    updateSwissMapDataSite2();
                }
        }).addClass('col-md-3');
    // Set initial selected year range
    $('#displayDateRange').text('Zeitraum: ' + $('#displayDateRangeSilder').slider('values', 0 ) + '-' + $('#displayDateRangeSilder').slider('values', 1 ));
    $('#visualizationControlsSite2').append( $('<br>') );

    // Create total / activitytype control buttons 
    $('#visualizationControlsSite2').append( $('<div>').attr('id', 'displayButtonsTotalActivity') );
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
            viualizationOptionsSite2.selectedDataTypeTotActiv = viualizationOptionsSite2.dataTypeEnum.activitytype;
            viualizationOptionsSite2.selectedDataKPI = 'PtageStatA';
            updatePieChartDataSite2();
            $('#pieChartViewSite2').show('slow');
            initialTableDrawSite2();
        }else{
            viualizationOptionsSite2.selectedDataTypeTotActiv = viualizationOptionsSite2.dataTypeEnum.total;
            $('#pieChartViewSite2').hide('slow');
            initialTableDrawSite2();
        }
        updateTableDataSite2();
        updateSwissMapDataSite2();
    });

    // Create absolute / relative control buttons 
    $('#visualizationControlsSite2').append( $('<div>').attr('id', 'displayButtonsAbsoluteRelative') );
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
            viualizationOptionsSite2.selectedDataTypeAbsRel = viualizationOptionsSite2.dataTypeEnum.relative;
            $('#displayRelativeDataControl').show('slow');
        }else{
            viualizationOptionsSite2.selectedDataTypeAbsRel = viualizationOptionsSite2.dataTypeEnum.absolute;
            $('#displayRelativeDataControl').hide('slow');
        }
        updateTableDataSite2();
        updateSwissMapDataSite2();
    });

    // Relative / Absolut Data Slider: Possible Slide Values
    for(var i = 0; i<viualizationOptionsSite2.amountOfAbsRelSliderValues; i++){
        viualizationOptionsSite2.selectableSlideValuesAbsRel[i] = Math.pow(10, i); 
    }

    // Create single ended slider for selecting the amount of relative data
    $('#visualizationControlsSite2').append( $('<div>').attr('id', 'displayRelativeDataControl') );
    $('#displayRelativeDataControl').append( $('<p>').attr('id', 'displayRelativeRange') );
    $('#displayRelativeDataControl').append( $('<div>').attr('id', 'site2 #displayRelativeRangeSlider').css('margin-left', '5px') );
    // addClass (col-md-3) to limit the width of the slider
    $('#site2 #displayRelativeRangeSlider').slider({
        range: "min",
        value: 6,
        min: 0,
        step: 1,
        max: (viualizationOptionsSite2.selectableSlideValuesAbsRel.length-1),
        slide: function( event, ui ) {
            $('#displayRelativeRange').text('Darstellung der Relativen Daten: pro ' + numberWithCommasSite2(viualizationOptionsSite2.selectableSlideValuesAbsRel[ui.value]) + ' Person(en)');
            viualizationOptionsSite2.selectedRelativeAmount = viualizationOptionsSite2.selectableSlideValuesAbsRel[ui.value];
            updateTableDataSite2();
            updateSwissMapDataSite2();
        }
    }).addClass('col-md-3');
    // Set initial selected amout of realtive data
    $('#displayRelativeRange').text('Darstellung der Relativen Daten: pro '+ numberWithCommasSite2(viualizationOptionsSite2.selectableSlideValuesAbsRel[6]) + ' Person(en)');
}

function betweenPlusLowerBoundSite2(x, min, max) {
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
function numberWithCommasSite2(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

// Based on following source: //http://bl.ocks.org/dbuezas/9306799
function initialDrawPieChartSite2() {
    // Setup pieChart and legends SVG Size
    pieChartOptionsSite2.svg = d3.select("#site2 #pieChartViewSite2")
        .append("svg")
        .attr("width", pieChartOptionsSite2.container_dimensions.width)
        .attr("height", pieChartOptionsSite2.container_dimensions.height);
    pieChartOptionsSite2.radius = Math.min(pieChartOptionsSite2.container_dimensions.width, pieChartOptionsSite2.container_dimensions.height) / 2;

    // Create groups fo further elements
    pieChartOptionsSite2.svg.append("g")
        .attr("class", "slices");
    pieChartOptionsSite2.svg.append("g")
        .attr("class", "labels");
    pieChartOptionsSite2.svg.append("g")
        .attr("class", "lines");
    
    // Select Layout pie with disabled sorting function (sort(null)) and with associated accessor function (getting the values)
    pieChartOptionsSite2.pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

    // Define the arc for the actual pieChart (inner and outer curve of the circle)
    pieChartOptionsSite2.arc = d3.svg.arc()
        .outerRadius(pieChartOptionsSite2.radius * 0.8)
        .innerRadius(pieChartOptionsSite2.radius * 0.4);

    // Define the arc for the legend lines
    pieChartOptionsSite2.outerArc = d3.svg.arc()
        .innerRadius(pieChartOptionsSite2.radius * 0.9)
        .outerRadius(pieChartOptionsSite2.radius * 0.9);

    // Color map
    pieChartOptionsSite2.color = d3.scale.ordinal()
        .domain(pieChartOptionsSite2.labels)
        .range(["#80b1d3", "#f6c9d2", "#bc80bd", "#bf812d"]);

    pieChartOptionsSite2.titleText = pieChartOptionsSite2.svg.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .style("text-anchor", "middle")

}

function updatePieChartDataSite2(data) {

    // Get the current selected KPI Prefix (very char except the last char)
    pieChartOptionsSite2.currentKPIPrefix = viualizationOptionsSite2.selectedDataKPI.substring(0, viualizationOptionsSite2.selectedDataKPI.length - 1);

    // Create data array with all activitytype-labels to select based on the current selection
    // This will create an array containing objects with an label composed of the current KPI prefix and an activitytype ending
    pieChartOptionsSite2.slicesData = [];
    for(var i = 0;i<pieChartOptionsSite2.labels.length;i++){
        pieChartOptionsSite2.slicesData[i] = {label: pieChartOptionsSite2.labels[i], KPIName: pieChartOptionsSite2.currentKPIPrefix + viualizationOptionsSite2.activitytypeEndings[i]};
    }

    var tempPopulationAmoutOverSelectedPeriod;
    var tempDataAmoutOverOneYear;

    // Counter needed for average calculation of percent Data
    for(var i = 0;i<viualizationOptionsSite2.activitytypeEndings.length;i++){
        pieChartOptionsSite2.slicesData[i].value = dataGathererSite2(pieChartOptionsSite2.currentKPIPrefix + viualizationOptionsSite2.activitytypeEndings[i]);
    }
    updatePieChartViewSite2();
}

// Based on following source: //http://bl.ocks.org/dbuezas/9306799
function updatePieChartViewSite2(){

    //Draw Title
    pieChartOptionsSite2.titleText.text(pieChartOptionsSite2.currentKPIPrefix);

    data = pieChartOptionsSite2.slicesData;

    if($('#pieChartViewSite2').is(':hidden')){
        // Needed to prevent instant hover on other KPI, before animation is complete
        $('body').append($('<div>').attr('id', 'blockHover').css({'position': 'fixed', 'width' : '100%', 'height': '100%', 'top': '0px', 'left': '0px', 'z-index': '1000'}));
        $('#pieChartViewSite2').show('slow', function(){
            $('#blockHover').remove();
        });
    }

    var key = function(d){ return d.data.label; };    

    // Positioning of all groups and texts
    pieChartOptionsSite2.svg.selectAll("#site2 div#pieChartViewSite2 svg > g, #site2 div#pieChartViewSite2 svg > text")
        .attr("transform", "translate(" + pieChartOptionsSite2.container_dimensions.width / 2 + "," + pieChartOptionsSite2.container_dimensions.height / 2 + ")");


    /* ------- PIE SLICES -------*/
    var slice = pieChartOptionsSite2.svg.select("#site2 .slices").selectAll("#site2 path.slice")
        .data(pieChartOptionsSite2.pie(data), key);

    slice.enter()
        .insert("path")
        .style("fill", function(d) { return pieChartOptionsSite2.color(d.data.label); })
        .attr("class", "slice");

    slice       
        .transition().duration(1000)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return pieChartOptionsSite2.arc(interpolate(t));
            };
        });

    slice.on("mouseenter",function (d){
            stopVisualizationSite2();
            pieChartOptionsSite2.isSliceSelected = true;
            var currentSlice = this;
            d3.selectAll("#site2 .slice").style("opacity", function(){
                return (this === currentSlice) ? 1.0 : 0.25;
            });
            d3.selectAll("#site2 .slice").style("stroke", function(d){
                console.log(pieChartOptionsSite2.color(d.data.label));
                return (this === currentSlice) ? pieChartOptionsSite2.color(d.data.label) : null;
            });
            viualizationOptionsSite2.selectedDataKPI = d.data.KPIName;
            swissMapOptionsSite2.viewStyle = swissMapOptionsSite2.viewStyleEnum.coloredDetailView;
            updateSwissMapDataSite2();
            updateTableDataSite2();
        })

    slice.on("mouseout",function (d){
            pieChartOptionsSite2.isSliceSelected = false;
            d3.selectAll("#site2 .slice").style("opacity", 1);
            d3.selectAll("#site2 .slice").style("stroke", null);
            viualizationOptionsSite2.selectedCanton = '';
            tableViewOptionsSite2.viewStyle = tableViewOptionsSite2.viewStyleEnum.nationalView;
            updateTableDataSite2();
            updateSwissMapDataSite2();
            startVisualizationSite2();
        })


    slice.exit()
        .remove();

    /* ------- TEXT LABELS -------*/

    var text = pieChartOptionsSite2.svg.select("#site2 .labels").selectAll("#site2 text")
        .data(pieChartOptionsSite2.pie(data), key);

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
                var pos = pieChartOptionsSite2.outerArc.centroid(d2);
                pos[0] = pieChartOptionsSite2.radius * (midAngle(d2) < Math.PI ? 1 : -1);
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

    var polyline = pieChartOptionsSite2.svg.select("#site2 .lines").selectAll("#site2 polyline")
        .data(pieChartOptionsSite2.pie(data), key);
    
    polyline.enter()
        .append("polyline");

    polyline.transition().duration(1000)
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = pieChartOptionsSite2.outerArc.centroid(d2);
                pos[0] = pieChartOptionsSite2.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [pieChartOptionsSite2.arc.centroid(d2), pieChartOptionsSite2.outerArc.centroid(d2), pos];
            };          
        });
    
    polyline.exit()
        .remove();
}

// gather all data for specific KPI (canton is optional)
// If canton is set, then only for the set canton data will be gathered
// IF canton is not set (undefined) all data from every canton will be gathered
function dataGathererSite2(KPItoGather, canton){

    var countPercentData = 0;
    var tempPopulationAmoutOverSelectedPeriod = 0;
    var KPIValue = 0;

    // Go trough every slected year
    for(var k = viualizationOptionsSite2.selectedStartYear; k<=viualizationOptionsSite2.selectedEndYear; k++){
        // Reset countPercentData if label starts with small p (indicates a percent data column)
        if(KPItoGather.charAt(0) == 'p')countPercentData=0;
        // temporary yearly variable
        // used to add every value form every medical environment
        tempDataAmoutOverOneYear = 0;
        // Go trough every canton
        for(var m = 0;m<viualizationOptionsSite2.loadedHospitalData[k].length;m++){
            // Only for selected canton or for all cantons if selectedCanton == '' (means national view)
            if((canton == undefined) || (viualizationOptionsSite2.loadedHospitalData[k][m].key == canton)){
                // Go trough every medical environment
                for(var o = 0;o<viualizationOptionsSite2.loadedHospitalData[k][m].values.length;o++){
                    // Filter set without data
                    if(typeof viualizationOptionsSite2.loadedHospitalData[k][m].values[o][KPItoGather] !== 'undefined'){
                        // Convert number from point notation to comma notation
                        viualizationOptionsSite2.loadedHospitalData[k][m].values[o][KPItoGather].replace('.',',');
                        // second plus needed to convert string to number
                        tempDataAmoutOverOneYear += +viualizationOptionsSite2.loadedHospitalData[k][m].values[o][KPItoGather];
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
    KPIValue = KPIValue / (viualizationOptionsSite2.selectedEndYear - viualizationOptionsSite2.selectedStartYear + 1);
    // Condition if relative data is selected
    if(viualizationOptionsSite2.selectedDataTypeAbsRel == viualizationOptionsSite2.dataTypeEnum.relative){
        tempPopulationAmoutOverSelectedPeriod = 0
        // Every selected year
        for(var k = viualizationOptionsSite2.selectedStartYear; k<=viualizationOptionsSite2.selectedEndYear; k++){
            // Go search canton
            for(var m = 0; m<viualizationOptionsSite2.loadedPopulationData[k].length; m++){
                // Add summarized year and calcualte average for the national view if selectedCanton == '' (means national view, no cantons selected)
                if((viualizationOptionsSite2.loadedPopulationData[k][m].Kanton == 'CH') && (canton == undefined)){
                    tempPopulationAmoutOverSelectedPeriod += +viualizationOptionsSite2.loadedPopulationData[k][m].total;
                }
                // Add summarized year and calcualte average for the cantonal view if selectedCanton matches (means cantonView, one canton got mouseover)
                if(viualizationOptionsSite2.loadedPopulationData[k][m].Kanton == canton){
                    tempPopulationAmoutOverSelectedPeriod += +viualizationOptionsSite2.loadedPopulationData[k][m].total;
                }
            }
        }
        // Divide by amout of selected years
        tempPopulationAmoutOverSelectedPeriod = tempPopulationAmoutOverSelectedPeriod / (viualizationOptionsSite2.selectedEndYear - viualizationOptionsSite2.selectedStartYear + 1);
        // Multiplay by amout of selected relative data
        KPIValue = KPIValue * viualizationOptionsSite2.selectedRelativeAmount;
        // Divide by population
        KPIValue = KPIValue / tempPopulationAmoutOverSelectedPeriod;
    }
    return KPIValue;
}

function stopVisualizationSite2(){
	window.clearInterval(viualizationOptionsSite2.runningVisualization);
	delete viualizationOptionsSite2.runningVisualization;
}

function startVisualizationSite2(){
	visualizationSite2();
	viualizationOptionsSite2.runningVisualization = setInterval(visualizationSite2, 5000);
}

function visualizationSite2(){
	if(viualizationOptionsSite2.runningVisualization !== undefined){
		swissMapOptionsSite2.viewStyle = swissMapOptionsSite2.viewStyleEnum.coloredDetailView;
	    viualizationOptionsSite2.currentVisualizedKPI++;
	    viualizationOptionsSite2.currentVisualizedKPI = viualizationOptionsSite2.currentVisualizedKPI % viualizationOptionsSite2.visualizationSteps;
	        
	    switch(viualizationOptionsSite2.currentVisualizedKPI) {
	      case 0:
	        viualizationOptionsSite2.selectedDataKPI = 'BettenStatA';
	        break;
	      case 1:
	        viualizationOptionsSite2.selectedDataKPI = 'BettenStatP';
	        break;
	      case 2:
	        viualizationOptionsSite2.selectedDataKPI = 'BettenStatR';
	        break;
	      case 3:
	        viualizationOptionsSite2.selectedDataKPI = 'BettenStatB';
	        break;
	      default:
	          console.log('Error: No valid switchcase');
	        }
	    updateTableDataSite2();
	    updateSwissMapDataSite2();
	    updatePieChartDataSite2();
	}
}

$(document).ready(function(){
    createVisualizationControlsSite2();
    loadDataSite2();
});