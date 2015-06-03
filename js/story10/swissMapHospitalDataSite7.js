// Globally used options / variables in relaiton to the swissmap
var swissMapOptionsSite7 = {
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
    viewStyle: '',
    container_dimensions: {width: 720, height: 430},
    colorgradient: {}
}

// Globally used options / variables in relaiton to the pieChart
var pieChartOptionsSite7 = {
    container_dimensions: {width: 535, height: 179},
    svg: {},
    color: {},
    arc: {},
    pie: {},
    outerArc: {},
    radius: {},
    slicesData: [],
    currentKPIPrefix: '',
    labels: ['(A) Akutbehandlung', '(B) Geburtshäuser', '(P) Psychiatrie', '(R) Rehabilitation / Geriatrie'],
    titleText: {}
}

// Globally used options / variables in relaiton to the displayed data table
var tableViewOptionsSite7 = {
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
    panelHeadingTitle: {}
}

// Globally used options / variables in relaiton to overall visualization
var viualizationOptionsSite7 = {
    hospitalDataFiles: ['tsv/Kennzahlen_Spital/kzp09.tsv',
            'tsv/Kennzahlen_Spital/kzp10.tsv',
            'tsv/Kennzahlen_Spital/kzp11.tsv',
            'tsv/Kennzahlen_Spital/kzp12.tsv'],
    hospitalLabelsTotalDataFile: 'tsv/Kennzahlen_Spital/labelsTotaleDaten.tsv',
    hospitalLabelsActivityDataFile: 'tsv/Kennzahlen_Spital/labelsAktivitaetsDaten.tsv',
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
    selectedDataTypeTotActiv: 2,
    selectedDataKPI: '',
    selectedStartYear: 2009,
    selectedEndYear: 2012,
    selectedRelativeAmount: 10000,
    dataTypeEnum: {
        absolute: 0,
        relative: 1,
        total: 2,
        activitytype: 3
    },
    activitytypeEndings: ['A', 'B', 'P', 'R'],
    selectableSlideValuesAbsRel: [],
    amountOfAbsRelSliderValues: 7
}

function initialDrawSwissMapSite7(){
    // Projection settings of the swissmap
    var projection = d3.geo.albers()
        .rotate([0, 0])
        .center([8.5, 46.8])
        .scale(12000)
        .translate([swissMapOptionsSite7.container_dimensions.width / 2, swissMapOptionsSite7.container_dimensions.height / 2])
        .precision(.1);

    var path = d3.geo.path()
        .projection(projection);

    swissMapOptionsSite7.svg = d3.select("#site7 #swissMapVisualizationSite7").append("svg")
        .attr("width", swissMapOptionsSite7.container_dimensions.width)
        .attr("height", swissMapOptionsSite7.container_dimensions.height)
        .attr("id", "svg");

    var tooltip = d3.select("#site7 #swissMapVisualizationSite7")
        .append("div")
        .attr("id", "tooltip");

    // Load canton data from topojson
    swissMapOptionsSite7.cantons = topojson.feature(swissMapOptionsSite7.loadedSwissMapJSONFile, swissMapOptionsSite7.loadedSwissMapJSONFile.objects.cantons);

    // Draws each Canton as a seperate Object, needed for specific selection
    swissMapOptionsSite7.svg.selectAll("#site7 .canton")
        .data(topojson.feature(swissMapOptionsSite7.loadedSwissMapJSONFile, swissMapOptionsSite7.loadedSwissMapJSONFile.objects.cantons).features)
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
            viualizationOptionsSite7.selectedDataKPI = '';
            viualizationOptionsSite7.selectedCanton = d.id;
            tableViewOptionsSite7.viewStyle = tableViewOptionsSite7.viewStyleEnum.cantonView;
            updateTableDataSite7();
            swissMapOptionsSite7.viewStyle = swissMapOptionsSite7.viewStyleEnum.singleSelectionView;
            updateSwissMapDataSite7();
        })
        .on("mouseout",function (d){
            viualizationOptionsSite7.selectedCanton = '';
            tableViewOptionsSite7.viewStyle = tableViewOptionsSite7.viewStyleEnum.nationalView;
            updateTableDataSite7();
            swissMapOptionsSite7.viewStyle = swissMapOptionsSite7.viewStyleEnum.colorlessNationalView;
            updateSwissMapDataSite7();
        });

    //Draws the borders of the cantons
    swissMapOptionsSite7.svg.append("path")
        .datum(topojson.mesh(swissMapOptionsSite7.loadedSwissMapJSONFile, swissMapOptionsSite7.loadedSwissMapJSONFile.objects.cantons, function (a, b) {
            return a !== b;
        }))
        .attr("class", "canton-boundary")
        .attr("d", path)

    //draws the Labels of the cantons
    swissMapOptionsSite7.svg.selectAll("#site7 text")
        .data(swissMapOptionsSite7.cantons.features)
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
    swissMapOptionsSite7.colorgradient = d3.scale.linear()
        .domain([0, 50, 100])
        .range(["#91CF60", "#FFFFBF", "#FC8D59"]);
}

function loadDataSite7(){
    queue()
        .defer(d3.tsv, viualizationOptionsSite7.hospitalDataFiles[0])
        .defer(d3.tsv, viualizationOptionsSite7.hospitalDataFiles[1])
        .defer(d3.tsv, viualizationOptionsSite7.hospitalDataFiles[2])
        .defer(d3.tsv, viualizationOptionsSite7.hospitalDataFiles[3])
        .defer(d3.tsv, viualizationOptionsSite7.hospitalLabelsTotalDataFile)
        .defer(d3.tsv, viualizationOptionsSite7.hospitalLabelsActivityDataFile)
        .defer(d3.tsv, viualizationOptionsSite7.populationDataFiles[0])
        .defer(d3.tsv, viualizationOptionsSite7.populationDataFiles[1])
        .defer(d3.tsv, viualizationOptionsSite7.populationDataFiles[2])
        .defer(d3.tsv, viualizationOptionsSite7.populationDataFiles[3])
        .defer(d3.json, swissMapOptionsSite7.swissMapJSONFile)
        .await(function(error, d1, d2, d3, d4, l1, l2, p1, p2, p3, p4, swissMapJSONData) {
            viualizationOptionsSite7.loadedHospitalData['2009'] = d1;
            viualizationOptionsSite7.loadedHospitalData['2010'] = d2;
            viualizationOptionsSite7.loadedHospitalData['2011'] = d3;
            viualizationOptionsSite7.loadedHospitalData['2012'] = d4;
            viualizationOptionsSite7.loadedHospitalLabelsTotalData = l1;
            viualizationOptionsSite7.loadedHospitalLabelsActivityData = l2;
            viualizationOptionsSite7.loadedPopulationData['2009'] = p1;
            viualizationOptionsSite7.loadedPopulationData['2010'] = p2;
            viualizationOptionsSite7.loadedPopulationData['2011'] = p3;
            viualizationOptionsSite7.loadedPopulationData['2012'] = p4;
            swissMapOptionsSite7.loadedSwissMapJSONFile = swissMapJSONData;
            dataProcessingSite7();
            initialDrawSwissMapSite7();
            initialDrawPieChart();
            tableViewOptionsSite7.viewStyle = tableViewOptionsSite7.viewStyleEnum.nationalView;
            swissMapOptionsSite7.viewStyle = swissMapOptionsSite7.viewStyleEnum.colorlessNationalView;
            initialTableDrawSite7();
            updateTableDataSite7();
            updateSwissMapDataSite7();
        });
}

function updateSwissMapDataSite7(){
    if(swissMapOptionsSite7.viewStyle == swissMapOptionsSite7.viewStyleEnum.coloredDetailView){
        var tempDataAmoutOverOneYear;
        var tempPopulationAmoutOverSelectedPeriod;
        // Counter needed for average calculation of percent Data
        var countPercentData;
        // Each SVG canton
        for(var i = 0;i<swissMapOptionsSite7.cantons.features.length;i++){
            swissMapOptionsSite7.cantons.features[i]['dataValueToDisplay'] = dataGathererSite7(viualizationOptionsSite7.selectedDataKPI, swissMapOptionsSite7.cantons.features[i].id);
        }

        // Get extent of canton data (index0=min, index1=max)
        swissMapOptionsSite7.cantons.extent = [];
        for(var i = 0;i<swissMapOptionsSite7.cantons.features.length;i++){
            if(i == 0){
                // Initial borders
                swissMapOptionsSite7.cantons.extent[0] = swissMapOptionsSite7.cantons.features[i]['dataValueToDisplay'];
                swissMapOptionsSite7.cantons.extent[1] = swissMapOptionsSite7.cantons.features[i]['dataValueToDisplay'];
            }else{
                // Move border if greater or lower value
                if(swissMapOptionsSite7.cantons.features[i]['dataValueToDisplay']>swissMapOptionsSite7.cantons.extent[1]){
                    swissMapOptionsSite7.cantons.extent[1] = Math.ceil(swissMapOptionsSite7.cantons.features[i]['dataValueToDisplay']);
                }else if(swissMapOptionsSite7.cantons.features[i]['dataValueToDisplay']<swissMapOptionsSite7.cantons.extent[0]){
                    swissMapOptionsSite7.cantons.extent[0] = Math.floor(swissMapOptionsSite7.cantons.features[i]['dataValueToDisplay']);
                }
            }
        }

        // Calculate range for every step from tier to tier level
        var calculatedValueRange = (swissMapOptionsSite7.cantons.extent[1]-swissMapOptionsSite7.cantons.extent[0])/3;

        // Build tier object suited for the swissMpaView part
        // Every tier get an start vlaue and an end Value
        swissMapOptionsSite7.tierViewData = [];
        // Only 3 tiers supported
        for(var i = 0;i<3;i++){
            // Every tier is stored in an object
            swissMapOptionsSite7.tierViewData[i] = {}
            // Set tier name with specific index
            swissMapOptionsSite7.tierViewData[i].tier = "tier"+(i+1);
            // First tier (i==0), tier1, will get the minimum Value of all (extent[0])
            if(i==0)swissMapOptionsSite7.tierViewData[i].value = Math.floor(swissMapOptionsSite7.cantons.extent[0]);
            if(i==1)swissMapOptionsSite7.tierViewData[i].value = Math.round(Math.floor(swissMapOptionsSite7.cantons.extent[0]) + (Math.ceil(swissMapOptionsSite7.cantons.extent[1]) - Math.floor(swissMapOptionsSite7.cantons.extent[0]))/2);
            if(i==2)swissMapOptionsSite7.tierViewData[i].value = Math.ceil(swissMapOptionsSite7.cantons.extent[1]);
        }
    }
    updateSwissMapViewSite7();
}

function updateSwissMapViewSite7(){
    //Reset settings from previous views
    // Every CSS class from previous view will be resettet to default class "canton"
    d3.selectAll('#site7 .canton').style('fill', '#cccccc');
    // Remove old legend from an previous view
    $('#site7 .legend').remove();
    if(swissMapOptionsSite7.viewStyle == swissMapOptionsSite7.viewStyleEnum.singleSelectionView){
        // Specific view settings for the "singleSelectionView" (mouseover on a svg canton)
        // The canton with the mouseover will get selected by the id and gets the additional class selectedCanton
        if(viualizationOptionsSite7.selectedCanton !== ''){
            d3.select('#site7 #SVGcanton'+viualizationOptionsSite7.selectedCanton)
                .style('fill', '#2E90BD');
        }
    }else if(swissMapOptionsSite7.viewStyle == swissMapOptionsSite7.viewStyleEnum.colorlessNationalView){
        // Specific view settings for the "colorlessNationalView" (mouseout from an svg canton)

    }else if(swissMapOptionsSite7.viewStyle == swissMapOptionsSite7.viewStyleEnum.coloredDetailView){
        // Specific view settings for the "coloredDetailView" (mouseover on the displayed data table)
        // Get the generated tiewViewData object from the updateSwissMapDataSite7 function and create enterselection

        var legend = swissMapOptionsSite7.svg.selectAll("#site7 .legend")
            .data(swissMapOptionsSite7.tierViewData)
                .enter()
                .append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) {
                    // Normal swissMap legend position in top right corner
                    return "translate(-20," + i * 20 + ")";
                });

        // Create colored gradient
        var legendSVG = swissMapOptionsSite7.svg.append("g")
            .attr("class", "legend")
            .attr("width", 18)
            .attr("height", 54);

        var gradient = legendSVG.append("defs")
          .append("linearGradient")
            .attr("id", "gradientSite7")
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
            .attr("x", swissMapOptionsSite7.container_dimensions.width - 36)
            .attr("width", 18)
            .attr("height", 54)
            .style("fill", "url(#gradientSite7)");
        
        // Add text to the legend
        legend.append("text")
            .attr("x", swissMapOptionsSite7.container_dimensions.width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { 
                // Arguments[1] is the specific index for the specific legend part
                // this way is needed because the symbols "< > =" are diffrent for every tier
                if(arguments[1] == 0) return "Erster Wert bei " + Math.floor(swissMapOptionsSite7.cantons.extent[0]);
                if(arguments[1] == 1) return "Mittlerer Wert bei " + swissMapOptionsSite7.tierViewData[1].value;
                if(arguments[1] == 2) return "Letzter Wert bei " + Math.ceil(swissMapOptionsSite7.cantons.extent[1]);
               
            });

        // Add tier class to the specific svg canton
        swissMapOptionsSite7.svg.selectAll("#site7 .canton")
            .transition()
            .style('fill', function(d){
                // Go trough each data canton
                for(var i = 0;i<swissMapOptionsSite7.cantons.features.length;i++){
                    // SVG canton and data canton match
                    if(swissMapOptionsSite7.cantons.features[i].id == d.id){
                        calculatedPercentage = (swissMapOptionsSite7.cantons.features[i]['dataValueToDisplay'] == 0 ? 0 : 100*(swissMapOptionsSite7.cantons.features[i]['dataValueToDisplay']-Math.floor(swissMapOptionsSite7.cantons.extent[0]))/(Math.ceil(swissMapOptionsSite7.cantons.extent[1])-Math.floor(swissMapOptionsSite7.cantons.extent[0])));
                        return swissMapOptionsSite7.colorgradient(calculatedPercentage);
                    }
                }
            });
    }
}

function updateTableDataSite7(){
    // Viewstyle settings
    if(tableViewOptionsSite7.viewStyle == tableViewOptionsSite7.viewStyleEnum.nationalView){
        // Custom tableheading for acitve "nationalView" (no canton got an mouseover)
        tableViewOptionsSite7.panelHeading = 'Nationaler Überblick (Jahresdurchschnitt über selektierte Jahre)';
    }else if(tableViewOptionsSite7.viewStyle == tableViewOptionsSite7.viewStyleEnum.cantonView){
        // Custom tableheading for acitve "cantonView" (a canton got an mouseover)
        tableViewOptionsSite7.panelHeading = 'Kanton ' + viualizationOptionsSite7.selectedCanton + ' Überblick (Jahresdurchschnitt über selektierte Jahre)';
    }
    tableViewOptionsSite7.tableHeading = ['Bezeichnung', 'Wert', 'Einheit'];


    // Gather data for the displayed table
    // temporary variable used to summarize every medical environment from an single canton
    var tempDataAmoutOverOneYear;
    // temporary variable t
    var tempPopulationAmoutOverSelectedPeriod;
    // Counter needed for average calculation of percent Data
    var countPercentData;
    // tableContent will contain the data which will be displayed in the table, depending on the selected dataType total or splitted by activitytype
    if(viualizationOptionsSite7.selectedDataTypeTotActiv == viualizationOptionsSite7.dataTypeEnum.total){
        tableViewOptionsSite7.tableContent = $.extend(true, [], viualizationOptionsSite7.loadedHospitalLabelsTotalData);
    }else if(viualizationOptionsSite7.selectedDataTypeTotActiv == viualizationOptionsSite7.dataTypeEnum.activitytype){
        tableViewOptionsSite7.tableContent = $.extend(true, [], viualizationOptionsSite7.loadedHospitalLabelsActivityData);
    }
    // For better performance only process the selected Label Header
    // For each label
    for(var g = 0; g<tableViewOptionsSite7.tableContent[tableViewOptionsSite7.currentProcessedLabelHeader].values.length; g++){
        // Gather Data depending on the current KPI name and if an canton is selected or not
        if(viualizationOptionsSite7.selectedCanton == ''){
            tableViewOptionsSite7.tableContent[tableViewOptionsSite7.currentProcessedLabelHeader].values[g].value = Math.round(dataGathererSite7(tableViewOptionsSite7.tableContent[tableViewOptionsSite7.currentProcessedLabelHeader].values[g].Name));
        }else{
            tableViewOptionsSite7.tableContent[tableViewOptionsSite7.currentProcessedLabelHeader].values[g].value = Math.round(dataGathererSite7(tableViewOptionsSite7.tableContent[tableViewOptionsSite7.currentProcessedLabelHeader].values[g].Name, viualizationOptionsSite7.selectedCanton));
        }
    }
    updateTableViewSite7();
}

function initialTableDrawSite7(){
    // Remove displayed table with possible old values from previous viewstyles
    if (!$('#tableViewSite7').is(':empty')){
        $('#tableViewSite7').empty();
    }

    // Build new result panel
    var htmlPanel = $( '<div>' ).attr('class', 'panel panel-default');

    // Build new result panel-heading
    var htmlPanelHeading = $( '<div>' ).attr('class', 'panel-heading').css('table-layout', 'fixed'); 
    tableViewOptionsSite7.panelHeadingTitle = $( '<strong>' ).text(tableViewOptionsSite7.panelHeading)
    htmlPanelHeading.append( tableViewOptionsSite7.panelHeadingTitle );
    htmlPanel.append(htmlPanelHeading);

    var accordion = $( '<div>' ).attr('id', 'accordionSite7');

    // Build the accordion
    if(viualizationOptionsSite7.selectedDataTypeTotActiv == viualizationOptionsSite7.dataTypeEnum.total){
        for(var i = 0;i<viualizationOptionsSite7.loadedHospitalLabelsTotalData.length;i++){
            accordion.append($( '<h3>' ).text(viualizationOptionsSite7.loadedHospitalLabelsTotalData[i].key));
            tableViewOptionsSite7.htmlDataTables[i] = $( '<div>' );
            accordion.append(tableViewOptionsSite7.htmlDataTables[i]);
        }    
    }else if(viualizationOptionsSite7.selectedDataTypeTotActiv == viualizationOptionsSite7.dataTypeEnum.activitytype){
        for(var i = 0;i<viualizationOptionsSite7.loadedHospitalLabelsActivityData.length;i++){
            accordion.append($( '<h3>' ).text(viualizationOptionsSite7.loadedHospitalLabelsActivityData[i].key));
            tableViewOptionsSite7.htmlDataTables[i] = $( '<div>' );
            accordion.append(tableViewOptionsSite7.htmlDataTables[i]);
        }
    }

    $( '#tableViewSite7' ).append(htmlPanel);
    $( '#tableViewSite7' ).append(accordion);

    // Create JQuery UI Accordion on the displayed table
    $( "#accordionSite7" ).accordion({
        heightStyle: "content",
        event: "click hoverintent",
        active: tableViewOptionsSite7.currentProcessedLabelHeader,
        activate: function( event, ui ) {
            $('.blockHover').remove();
        },
        beforeActivate: function( event, ui ){
            tableViewOptionsSite7.currentProcessedLabelHeader = ui.newHeader.index()/2;
            updateTableDataSite7();
            // Needed to prevent instant hover on new table, before animation is complete
            $('body').append($('<div>').attr('class', 'blockHover').css({'position': 'fixed', 'width' : '100%', 'height': '100%', 'top': '0px', 'left': '0px', 'z-index': '1000'}));
        }
    });
}

function updateTableViewSite7(){

    // Set panelHeadingTitleText
    tableViewOptionsSite7.panelHeadingTitle.text(tableViewOptionsSite7.panelHeading);

    var htmlTable;
    var htmlTableHeading;
    var htmlTrTableHeading;

    // Build the accordion
    for(var i = 0;i<tableViewOptionsSite7.tableContent.length;i++){
            tableViewOptionsSite7.htmlDataTables[i].empty();
        // For better performance only process the selected Label Header
        if(i == tableViewOptionsSite7.currentProcessedLabelHeader){
            // Build new result table
            htmlTable = $( '<table>' ).attr('class', 'table table-hover');

            // Build new result table-heading
            htmlTrTableHeading = $( '<tr>' );
            for(var k = 0;k<tableViewOptionsSite7.tableHeading.length;k++){
                htmlTrTableHeading.append( $( '<th>' ).text( tableViewOptionsSite7.tableHeading[k] ) );
            }
            htmlTableHeading = $( '<thead>' ).append( htmlTrTableHeading );
            htmlTable.append(htmlTableHeading);

            // Iterate trough all found url's each found package
            for(var m = 0;m<tableViewOptionsSite7.tableContent[i].values.length;m++){
                if(viualizationOptionsSite7.selectedDataKPI == tableViewOptionsSite7.tableContent[i].values[m].Name){
                    htmlTable.append( $( '<tr>' ).attr('title', tableViewOptionsSite7.tableContent[i].values[m].Description).addClass('cursorHelp')
                                                    .append( $( '<td>' ).text( tableViewOptionsSite7.tableContent[i].values[m].Name ).css('width', '20px').addClass('success') )
                                                    .append( $( '<td>' ).text( numberWithCommasSite7(tableViewOptionsSite7.tableContent[i].values[m].value) ) )
                                                    .append( $( '<td>' ).text( tableViewOptionsSite7.tableContent[i].values[m].Description.substring(0,8) + "..." ) )
                                                );
                }else{
                    htmlTable.append( $( '<tr>' ).attr('title', tableViewOptionsSite7.tableContent[i].values[m].Description).addClass('cursorHelp')
                                                    .append( $( '<td>' ).text( tableViewOptionsSite7.tableContent[i].values[m].Name ).css('width', '20px') )
                                                    .append( $( '<td>' ).text( numberWithCommasSite7(tableViewOptionsSite7.tableContent[i].values[m].value) ) )
                                                    .append( $( '<td>' ).text( tableViewOptionsSite7.tableContent[i].values[m].Description.substring(0,8) + "..." ) )
                                                );
                }
            }

            tableViewOptionsSite7.htmlDataTables[i].append(htmlTable);
        }
    }

    resetAccordion();

    // Create onclick event to all tablerows from the displayed table
    $('#tableViewSite7 tbody tr').mouseover(mouseoverTableRowSite7);

    // Activate jQuery UI tooltip function
    // Adds tooltip to every element with an title attribute
    // Track option to follow the cursor
    $( document ).tooltip({
        track: true
    });
}

function resetAccordion(){
    $( "#accordionSite7" ).accordion( "destroy" );
    // Create JQuery UI Accordion on the displayed table
    $( "#accordionSite7" ).accordion({
        heightStyle: "content",
        event: "click hoverintent",
        active: tableViewOptionsSite7.currentProcessedLabelHeader,
        activate: function( event, ui ) {
            $('.blockHover').remove();
        },
        beforeActivate: function( event, ui ){
            tableViewOptionsSite7.currentProcessedLabelHeader = ui.newHeader.index()/2;
            updateTableDataSite7();
            // Needed to prevent instant hover on new table, before animation is complete
            $('body').append($('<div>').attr('class', 'blockHover').css({'position': 'fixed', 'width' : '100%', 'height': '100%', 'top': '0px', 'left': '0px', 'z-index': '1000'}));
        }
    });
}

function mouseoverTableRowSite7(){
    // Remove the css class from the displayed table rows which indicates an mouseover
    $('td').removeClass('success');
    // This is the actual row
    // the first child is the left cell on the current row
    $(this).children().first().addClass('success');
    // Save the selected KPI for further visualisation processes
    viualizationOptionsSite7.selectedDataKPI = $(this).children().first().text();
    // Set viewstyle coloredDetailView (Colors on the swissmap associated to the KPI)
    swissMapOptionsSite7.viewStyle = swissMapOptionsSite7.viewStyleEnum.coloredDetailView;
    updateSwissMapDataSite7();
    // Update pieChart only in case if the datatype splitted by activitytype is selected
    if(viualizationOptionsSite7.selectedDataTypeTotActiv == viualizationOptionsSite7.dataTypeEnum.activitytype) {updatePieChartDataSite7();}
}

function dataProcessingSite7(){
    // Remove Empty, 'NA', oder not existing data rows from the Hospital Data
    for(var i = 2009; i<=2012; i++){
        viualizationOptionsSite7.loadedHospitalData[i].forEach(function(d){
            $.each(d, function(i, v){if(v=="NA" || v=="" || typeof v === "undefined")delete d[i];})
        });
        // Group every medical environment by canton
        viualizationOptionsSite7.loadedHospitalData[i] = d3.nest()
            .key(function(d) { return d.KT; })
            .entries(viualizationOptionsSite7.loadedHospitalData[i]);
        // Remove possible 'CH' canton or rows without canton groupkey
        viualizationOptionsSite7.loadedHospitalData[i].splice(26,2);
    }
    // Remove unused data from loaded populationData (only total and Kanton are used)
    for(var i = 2009; i<=2012; i++){
        viualizationOptionsSite7.loadedPopulationData[i].forEach(function(d){
            $.each(d, function(i, v){if(i!=="total" && i!=="Kanton")delete d[i];})
        });
    }
    // Group totalData labes by Header
    var data = viualizationOptionsSite7.loadedHospitalLabelsTotalData;
    var nest = d3.nest()
        .key(function(d) { return d.Header; });
    viualizationOptionsSite7.loadedHospitalLabelsTotalData = nest.entries(data);

    // Group activityData labes by Header
    data = viualizationOptionsSite7.loadedHospitalLabelsActivityData;
    nest = d3.nest()
        .key(function(d) { return d.Header; });
    viualizationOptionsSite7.loadedHospitalLabelsActivityData = nest.entries(data);
}

function createVisualizationControlsSite7(){
    // Create year range two ended slider control
    // first <p> to display current selected year range
    $('#visualizationControlsSite7').append( $('<p>').attr('id', 'displayDateRangeSite7') );
    // Container for the visual slider
    $('#visualizationControlsSite7').append( $('<div>').attr('id', 'displayDateRangeSite7Silder').css('margin-left', '5px') );
    // addClass (col-md-3) to limit the width of the slider
    $('#displayDateRangeSite7Silder').slider({
            range: true,
            min: 2009,
            max: 2012,
            values: [ 2009, 2012 ],
            slide: function( event, ui ) {
                    viualizationOptionsSite7.selectedStartYear = ui.values[ 0 ];
                    viualizationOptionsSite7.selectedEndYear = ui.values[ 1 ];
                    $('#displayDateRangeSite7').text('Zeitraum: ' + ui.values[ 0 ] + '-' + ui.values[ 1 ]);
                    updateTableDataSite7();
                    updateSwissMapDataSite7();
                }
        }).addClass('col-md-3');
    // Set initial selected year range
    $('#displayDateRangeSite7').text('Zeitraum: ' + $('#displayDateRangeSite7Silder').slider('values', 0 ) + '-' + $('#displayDateRangeSite7Silder').slider('values', 1 ));
    $('#visualizationControlsSite7').append( $('<br>') );

    // Create total / activitytype control buttons 
    $('#visualizationControlsSite7').append( $('<div>').attr('id', 'displayButtonsTotalActivitySite7') );
    var input = $('<input>').attr({'type': "radio", 'id': "totalButtonSite7", 'name': "radioTotActivSite7", 'checked': 'checked'});
    var label = $('<label>').attr('for', 'totalButtonSite7').text('Totale Daten');
    $('#displayButtonsTotalActivitySite7').prepend( input );
    label.insertAfter(input);
    input = $('<input>').attr({'type': "radio", 'id': "activityButtonSite7", 'name': "radioTotActivSite7"});
    label = $('<label>').attr('for', 'activityButtonSite7').text('Aufgeteillt auf Aktivitäten');
    $('#displayButtonsTotalActivitySite7').append( input );
    label.insertAfter(input);
    $( "#displayButtonsTotalActivitySite7" ).buttonset();

    // Add click event on the total / activitytype control buttons
    $('#displayButtonsTotalActivitySite7 :radio').click(function(){
        if($(this).attr('id')=="activityButtonSite7"){
            viualizationOptionsSite7.selectedDataTypeTotActiv = viualizationOptionsSite7.dataTypeEnum.activitytype;
            viualizationOptionsSite7.selectedDataKPI = 'PtageStatA';
            updatePieChartDataSite7();
            $('#pieChartViewSite7').show();
            initialTableDrawSite7();
        }else{
            viualizationOptionsSite7.selectedDataTypeTotActiv = viualizationOptionsSite7.dataTypeEnum.total;
            $('#pieChartViewSite7').hide();
            initialTableDrawSite7();
        }
        updateTableDataSite7();
        updateSwissMapDataSite7();
    });

    // Create absolute / relative control buttons 
    $('#visualizationControlsSite7').append( $('<div>').attr('id', 'displayButtonsAbsoluteRelativeSite7') );
    input = $('<input>').attr({'type': "radio", 'id': "relativeButtonSite7", 'name': "radioAbsRelSite7", 'checked': 'checked'});
    label = $('<label>').attr('for', 'relativeButtonSite7').text('Relative Daten');
    $('#displayButtonsAbsoluteRelativeSite7').prepend( input );
    label.insertAfter(input);
    input = $('<input>').attr({'type': "radio", 'id': "absoluteButtonSite7", 'name': "radioAbsRelSite7"});
    label = $('<label>').attr('for', 'absoluteButtonSite7').text('Absolute Daten');
    $('#displayButtonsAbsoluteRelativeSite7').append( input );
    label.insertAfter(input);
    $( "#displayButtonsAbsoluteRelativeSite7" ).buttonset();

    // Add click event on the absolute / realitve control buttons
    $('#displayButtonsAbsoluteRelativeSite7 :radio').click(function(){
        if($(this).attr('id')=="relativeButtonSite7"){
            viualizationOptionsSite7.selectedDataTypeAbsRel = viualizationOptionsSite7.dataTypeEnum.relative;
            $('#displayRelativeDataControlSite7').show('slow');
        }else{
            viualizationOptionsSite7.selectedDataTypeAbsRel = viualizationOptionsSite7.dataTypeEnum.absolute;
            $('#displayRelativeDataControlSite7').hide('slow');
        }
        updateTableDataSite7();
        updateSwissMapDataSite7();
    });

    // Relative / Absolut Data Slider: Possible Slide Values
    for(var i = 0; i<viualizationOptionsSite7.amountOfAbsRelSliderValues; i++){
        viualizationOptionsSite7.selectableSlideValuesAbsRel[i] = Math.pow(10, i); 
    }

    // Create single ended slider for selecting the amount of relative data
    $('#visualizationControlsSite7').append( $('<div>').attr('id', 'displayRelativeDataControlSite7') );
    $('#displayRelativeDataControlSite7').append( $('<p>').attr('id', 'displayRelativeRangeSite7') );
    $('#displayRelativeDataControlSite7').append( $('<div>').attr('id', 'displayRelativeRangeSite7Slider').css('margin-left', '5px') );
    // addClass (col-md-3) to limit the width of the slider
    $('#displayRelativeRangeSite7Slider').slider({
        range: "min",
        value: 0,
        min: 0,
        step: 1,
        max: (viualizationOptionsSite7.selectableSlideValuesAbsRel.length-1),
        slide: function( event, ui ) {
            $('#displayRelativeRangeSite7').text('Darstellung der Relativen Daten: pro ' + numberWithCommasSite7(viualizationOptionsSite7.selectableSlideValuesAbsRel[ui.value]) + ' Person(en)');
            viualizationOptionsSite7.selectedRelativeAmount = viualizationOptionsSite7.selectableSlideValuesAbsRel[ui.value];
            updateTableDataSite7();
            updateSwissMapDataSite7();
        }
    }).addClass('col-md-3');
    // Set initial selected amout of realtive data
    $('#displayRelativeRangeSite7').text('Darstellung der Relativen Daten: pro '+ numberWithCommasSite7(viualizationOptionsSite7.selectableSlideValuesAbsRel[$('#displayRelativeRangeSite7Slider').slider( "option", "value" )]) + ' Person(en)');

    // Some special CSS settings
    $('#pieChartViewSite7').hide();

    $('#pieChartViewSite7').css({
        'margin-top': '-10px',
        'position': 'absolute'
    })
    $('#visualizationControlsSite7').css({
        'z-index': '10',
        'position': 'absolute'
    })

}

function betweenPlusLowerBoundSite7(x, min, max) {
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
function numberWithCommasSite7(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

// Based on following source: //http://bl.ocks.org/dbuezas/9306799
function initialDrawPieChart() {
    // Setup pieChart and legends SVG Size
    pieChartOptionsSite7.svg = d3.select("#site7 #pieChartViewSite7")
        .append("svg")
        .attr("width", pieChartOptionsSite7.container_dimensions.width)
        .attr("height", pieChartOptionsSite7.container_dimensions.height)
        .style('margin-left', '360px');
    pieChartOptionsSite7.radius = Math.min(pieChartOptionsSite7.container_dimensions.width, pieChartOptionsSite7.container_dimensions.height) / 2;

    // Create groups fo further elements
    pieChartOptionsSite7.svg.append("g")
        .attr("class", "slices");
    pieChartOptionsSite7.svg.append("g")
        .attr("class", "labels");
    pieChartOptionsSite7.svg.append("g")
        .attr("class", "lines");
    
    // Select Layout pie with disabled sorting function (sort(null)) and with associated accessor function (getting the values)
    pieChartOptionsSite7.pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

    // Define the arc for the actual pieChart (inner and outer curve of the circle)
    pieChartOptionsSite7.arc = d3.svg.arc()
        .outerRadius(pieChartOptionsSite7.radius * 0.8)
        .innerRadius(pieChartOptionsSite7.radius * 0.4);

    // Define the arc for the legend lines
    pieChartOptionsSite7.outerArc = d3.svg.arc()
        .innerRadius(pieChartOptionsSite7.radius * 0.9)
        .outerRadius(pieChartOptionsSite7.radius * 0.9);

    // Placement of the pieChart
    pieChartOptionsSite7.svg.attr("transform", "translate(" + pieChartOptionsSite7.container_dimensions.width / 2 + "," + pieChartOptionsSite7.container_dimensions.height / 2 + ")");

    pieChartOptionsSite7.color = d3.scale.ordinal()
        .domain(pieChartOptionsSite7.labels)
        .range(["#80b1d3", "#f6c9d2", "#bc80bd", "#bf812d"]);

    pieChartOptionsSite7.titleText = pieChartOptionsSite7.svg.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .style("text-anchor", "middle")

}

function updatePieChartDataSite7(data) {

    // Get the current selected KPI Prefix (very char except the last char)
    pieChartOptionsSite7.currentKPIPrefix = viualizationOptionsSite7.selectedDataKPI.substring(0, viualizationOptionsSite7.selectedDataKPI.length - 1);

    // Create data array with all activitytype-labels to select based on the current selection
    // This will create an array containing objects with an label composed of the current KPI prefix and an activitytype ending
    pieChartOptionsSite7.slicesData = [];
    for(var i = 0;i<pieChartOptionsSite7.labels.length;i++){
        pieChartOptionsSite7.slicesData[i] = {label: pieChartOptionsSite7.labels[i], KPIName: pieChartOptionsSite7.currentKPIPrefix + viualizationOptionsSite7.activitytypeEndings[i]};
    }

    var tempPopulationAmoutOverSelectedPeriod;
    var tempDataAmoutOverOneYear;

    // Counter needed for average calculation of percent Data
    for(var i = 0;i<viualizationOptionsSite7.activitytypeEndings.length;i++){
        pieChartOptionsSite7.slicesData[i].value = dataGathererSite7(pieChartOptionsSite7.currentKPIPrefix + viualizationOptionsSite7.activitytypeEndings[i]);
    }
    updatePieChartViewSite7();
}

// Based on following source: //http://bl.ocks.org/dbuezas/9306799
function updatePieChartViewSite7(){

    //Draw Title
    pieChartOptionsSite7.titleText.text(pieChartOptionsSite7.currentKPIPrefix);

    data = pieChartOptionsSite7.slicesData;

    if($('#pieChartViewSite7').is(':hidden')){
        // Needed to prevent instant hover on other KPI, before animation is complete
        $('body').append($('<div>').attr('id', 'blockHover').css({'position': 'fixed', 'width' : '100%', 'height': '100%', 'top': '0px', 'left': '0px', 'z-index': '20'}));
        $('#pieChartViewSite7').show('slow', function(){
            $('#blockHover').remove();
        });
    }

    var key = function(d){ return d.data.label; };    

    // Positioning of all groups and texts
    if(!(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)){
        pieChartOptionsSite7.svg.selectAll("#site7 div#pieChartViewSite7 svg > g, #site7 div#pieChartViewSite7 svg > text")
            .attr("transform", "translate(" + pieChartOptionsSite7.container_dimensions.width / 2 + "," + pieChartOptionsSite7.container_dimensions.height / 2 + ")");
    }

    /* ------- PIE SLICES -------*/
    var slice = pieChartOptionsSite7.svg.select("#site7 .slices").selectAll("#site7 path.slice")
        .data(pieChartOptionsSite7.pie(data), key);

    slice.enter()
        .insert("path")
        .style("fill", function(d) { return pieChartOptionsSite7.color(d.data.label); })
        .attr("class", "slice");

    slice       
        .transition().duration(1000)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return pieChartOptionsSite7.arc(interpolate(t));
            };
        });

    slice.on("mouseenter",function (d){
            var currentSlice = this;
            d3.selectAll("#site7 .slice").style("opacity", function(){
                return (this === currentSlice) ? 1.0 : 0.25;
            });
            d3.selectAll("#site7 .slice").style("stroke", function(d){
                console.log(pieChartOptionsSite7.color(d.data.label));
                return (this === currentSlice) ? pieChartOptionsSite7.color(d.data.label) : null;
            });
            viualizationOptionsSite7.selectedDataKPI = d.data.KPIName;
            swissMapOptionsSite7.viewStyle = swissMapOptionsSite7.viewStyleEnum.coloredDetailView;
            updateSwissMapDataSite7();
            updateTableDataSite7();
        })

    slice.on("mouseout",function (d){
            d3.selectAll("#site7 .slice").style("opacity", 1);
            d3.selectAll("#site7 .slice").style("stroke", null);
            viualizationOptionsSite7.selectedDataKPI = '';
            swissMapOptionsSite7.viewStyle = swissMapOptionsSite7.viewStyleEnum.colorlessNationalView;
            updateSwissMapDataSite7();
            updateTableDataSite7();
        })


    slice.exit()
        .remove();

    /* ------- TEXT LABELS -------*/

    var text = pieChartOptionsSite7.svg.select("#site7 .labels").selectAll("#site7 text")
        .data(pieChartOptionsSite7.pie(data), key);

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
                var pos = pieChartOptionsSite7.outerArc.centroid(d2);
                pos[0] = pieChartOptionsSite7.radius * (midAngle(d2) < Math.PI ? 1 : -1);
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

    var polyline = pieChartOptionsSite7.svg.select("#site7 .lines").selectAll("#site7 polyline")
        .data(pieChartOptionsSite7.pie(data), key);
    
    polyline.enter()
        .append("polyline");

    polyline.transition().duration(1000)
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = pieChartOptionsSite7.outerArc.centroid(d2);
                pos[0] = pieChartOptionsSite7.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [pieChartOptionsSite7.arc.centroid(d2), pieChartOptionsSite7.outerArc.centroid(d2), pos];
            };          
        });
    
    polyline.exit()
        .remove();
}

// gather all data for specific KPI (canton is optional)
// If canton is set, then only for the set canton data will be gathered
// IF canton is not set (undefined) all data from every canton will be gathered
function dataGathererSite7(KPItoGather, canton){

    var countPercentData = 0;
    var tempPopulationAmoutOverSelectedPeriod = 0;
    var KPIValue = 0;

    // Go trough every slected year
    for(var k = viualizationOptionsSite7.selectedStartYear; k<=viualizationOptionsSite7.selectedEndYear; k++){
        // Reset countPercentData if label starts with small p (indicates a percent data column)
        if(KPItoGather.charAt(0) == 'p')countPercentData=0;
        // temporary yearly variable
        // used to add every value form every medical environment
        tempDataAmoutOverOneYear = 0;
        // Go trough every canton
        for(var m = 0;m<viualizationOptionsSite7.loadedHospitalData[k].length;m++){
            // Only for selected canton or for all cantons if selectedCanton == '' (means national view)
            if((canton == undefined) || (viualizationOptionsSite7.loadedHospitalData[k][m].key == canton)){
                // Go trough every medical environment
                for(var o = 0;o<viualizationOptionsSite7.loadedHospitalData[k][m].values.length;o++){
                    // Filter set without data
                    if(typeof viualizationOptionsSite7.loadedHospitalData[k][m].values[o][KPItoGather] !== 'undefined'){
                        // Convert number from point notation to comma notation
                        viualizationOptionsSite7.loadedHospitalData[k][m].values[o][KPItoGather].replace('.',',');
                        // second plus needed to convert string to number
                        tempDataAmoutOverOneYear += +viualizationOptionsSite7.loadedHospitalData[k][m].values[o][KPItoGather];
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
    KPIValue = KPIValue / (viualizationOptionsSite7.selectedEndYear - viualizationOptionsSite7.selectedStartYear + 1);
    // Condition if relative data is selected
    if(viualizationOptionsSite7.selectedDataTypeAbsRel == viualizationOptionsSite7.dataTypeEnum.relative){
        tempPopulationAmoutOverSelectedPeriod = 0
        // Every selected year
        for(var k = viualizationOptionsSite7.selectedStartYear; k<=viualizationOptionsSite7.selectedEndYear; k++){
            // Go search canton
            for(var m = 0; m<viualizationOptionsSite7.loadedPopulationData[k].length; m++){
                // Add summarized year and calcualte average for the national view if selectedCanton == '' (means national view, no cantons selected)
                if((viualizationOptionsSite7.loadedPopulationData[k][m].Kanton == 'CH') && (canton == undefined)){
                    tempPopulationAmoutOverSelectedPeriod += +viualizationOptionsSite7.loadedPopulationData[k][m].total;
                }
                // Add summarized year and calcualte average for the cantonal view if selectedCanton matches (means cantonView, one canton got mouseover)
                if(viualizationOptionsSite7.loadedPopulationData[k][m].Kanton == canton){
                    tempPopulationAmoutOverSelectedPeriod += +viualizationOptionsSite7.loadedPopulationData[k][m].total;
                }
            }
        }
        // Divide by amout of selected years
        tempPopulationAmoutOverSelectedPeriod = tempPopulationAmoutOverSelectedPeriod / (viualizationOptionsSite7.selectedEndYear - viualizationOptionsSite7.selectedStartYear + 1);
        if(KPItoGather.charAt(0) == 'p' || KPItoGather.substring(0,3) == 'DAD'){
        }else{
        	// Multiplay by amout of selected relative data
	        KPIValue = KPIValue * viualizationOptionsSite7.selectedRelativeAmount;
	        // Divide by population
	        KPIValue = KPIValue / tempPopulationAmoutOverSelectedPeriod;
	    }
    }
    return KPIValue;
}

$(document).ready(function(){
    createVisualizationControlsSite7();
    loadDataSite7();
});