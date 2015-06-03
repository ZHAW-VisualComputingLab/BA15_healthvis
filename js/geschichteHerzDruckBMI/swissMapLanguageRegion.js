
    /* Source: https://github.com/interactivethings/swiss-maps
    */



    //Global Variables
    var filePathSaved;          //saves the filePath for reRender
    var savedName = "Blutdruck";              //saves the name of the Data
    var savedNameAge;
    var savedNamePop;
    var savedNamePopPercentage;    
    var swissMapChartBar = 0;
    var buttonsGenerated = 0;


    var absoluteOrRelative = "relative"
    var cantonOrRegion = "Sprachgebiet";

    var dataPercentageWithX;

    var selectGenerated = 0;    //If Select is already Generated this Variable will be set to 1
    var titelGenerated = 0;    //If Select is already Generated this Variable will be set to 1

    var selectCount = { "Blutdruck": 2,
                        "BMI": 4,
                        "Herzinfarkt": 2 };
    var cantonsSortValue = {};


    //This function gets the Data and Renders the svg
    function renderD3(name) {
        
        savedName = name;
 
        savedNameAge = savedName + "Alter"

        savedNamePop = savedName + "Pop";

        savedNamePopPercentage = savedNamePop + "Percentage"

        //init
        var width = 756,
            height = 504;

        var projection = d3.geo.albers()
            .rotate([0, 0])
            .center([8.3, 46.8])
            .scale(12500)
            .translate([width / 2, height / 2])
            .precision(.1);

        var path = d3.geo.path()
            .projection(projection);

        var svg = d3.select("#swissMap").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "svg");

        var tooltip = d3.select("#swissMap")
            .append("div")
            .append("div")
            .attr("id", "tooltip")
            .style("display", "inline")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("margin-top", "10px");


        var loadedData = new Array();
        var ageData = new Array();
        var headers = ["Deutsch","Französisch","Italienisch"];

        var propertySort;
     

        //load Data from files
        queue()
        .defer(d3.tsv, 'tsv/Herz_Druck_BMI_Akt/BMI.tsv')
        .defer(d3.tsv, 'tsv/Herz_Druck_BMI_Akt/BMIAlter.tsv')
        .defer(d3.tsv, 'tsv/Herz_Druck_BMI_Akt/Blutdruck.tsv')
        .defer(d3.tsv, 'tsv/Herz_Druck_BMI_Akt/BlutdruckAlter.tsv')
        .defer(d3.tsv, 'tsv/Herz_Druck_BMI_Akt/Herzinfarkt.tsv')
        .defer(d3.tsv, 'tsv/Herz_Druck_BMI_Akt/HerzinfarktAlter.tsv')
        .defer(d3.tsv, 'tsv/Bevoelkerung_Alter_Kanton/population_2012.tsv')
        .defer(d3.json, 'json/switzerland.json')
         .defer(d3.json, 'json/europe.json')
        .await(renderSVG);
            

        function renderSVG(error, BMI, BMIAlter, blutdruck, blutdruckAlter, herzinfarkt, herzinfarktAlter, populationWithAge, swiss, europe) { 

            
            // load Data of the Cantons from the topojson file in the var cantons
            var cantons = topojson.feature(swiss, swiss.objects.cantons);
            
            // Save loaded TSV Data
            loadedData["BMI"] = BMI;
            loadedData["Blutdruck"] = blutdruck;
            loadedData["Herzinfarkt"] = herzinfarkt;
            loadedData["BlutdruckAlter"] = blutdruckAlter;
            loadedData["BMIAlter"] = BMIAlter;     
            loadedData["HerzinfarktAlter"] = herzinfarktAlter;


            generateSelect(loadedData[savedName], savedName);    //generates Selects
            generateTitel(savedName);       //generates Titel

            if ( buttonsGenerated == 0 ) {
                generateDataSet();
                generateAbsoluteAndRelativeButtons();
                generateCantonOrRegionButtons();

                buttonsGenerated = 1;
            }

            

            // Selected Element from the Dropdown Menu "PropertyChoice"
            propertySort = $('select#PropertyChoice').val();

            // Selected Element from the Dropdown Menu "CantonOrRegion"
            //cantonOrRegion = $('select#CantonOrRegion').val();
            
    
            // Sorts Data in loadedData according to the selected property in propertySort
            loadedData[savedName].sort(dynamicSort(propertySort));

            //Add Data to cantons
            addDataToCantons();
            addTierAndRegionDataToCantons();


            addAgeToCantons();
            addPersonsInCantonWithX();



            /* Problem, die ganze Map ist nur ein Pfad 
            svg.append("path")
                .datum(cantons)
                .attr("class", "canton")
                .attr("d", path)           
            */

            //obiger Code ersetzt durch: Quelle: http://bost.ocks.org/mike/map/
            //Draws each Canton as a seperate Object, needed for specific selection
            

            svg.selectAll(".canton")
                .data(topojson.feature(swiss, swiss.objects.cantons).features)
                .enter().append("path")
                .attr("class", function(d) { 
                        
                        //als Klassen wird das Sprachgebiet und das tier des Gebietes festlegt
                        return "canton " + d.properties.Sprachgebiet;
                    
     
                })
                .attr("d", path)
                

                //Behavior of the seperate canton Objects.
                .on("mouseover", function (d) {

                        tooltip.text(d.properties.name + ": " + Math.floor(d.properties[savedNamePop][propertySort]) + " Personen");
                        tooltip.style("visibility", "visible");
                        tooltip.style("border", "black 1px solid");
                 
        
                })

                .on("mousemove", function (d) {
                    //tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", function (d) {
                    tooltip.style("visibility", "hidden");

                })
                .on("click", function (d) {
                    
                    

                });

            //Draws the borders of the cantons
            svg.append("path")
                .datum(topojson.mesh(swiss, swiss.objects.cantons, function (a, b) {
                    return a !== b;
                }))
                .attr("class", "canton-boundary")
                .attr("d", path);
            
            if (cantonOrRegion == "Kanton") {

                addTierToCantons();

                //Colors the different Tiers
                svg.selectAll(".canton")
                        .transition()
                        .style('fill', function(d){
                            // Go trough each data canton
                            for(var i = 0;i<cantons.features.length;i++){
                                // SVG canton and data canton match
                                if(cantons.features[i].id == d.id){
                                    
                                    // For each tier
                                    for(var k = 0;k<cantonsSortValue.tierViewData.length;k++){

                                        // Match if lower tier1 boundary matches with the Value
                                        // Needed for the "tier1 startValue <= Value" condition
                                        if((cantonsSortValue.tierViewData[k].tier == "tier1")&&(cantons.features[i].properties[savedNamePop][propertySort] == cantonsSortValue.tierViewData[k].valueStart)) {
                                            return "#cccc00";
                                        }
                                        // Needed for the "startValue < Value < endValue" condition
                                        if(between(cantons.features[i].properties[savedNamePop][propertySort], cantonsSortValue.tierViewData[k].valueStart, cantonsSortValue.tierViewData[k].valueEnd)) {
                                   

                                            switch(cantonsSortValue.tierViewData[k].tier) {
                                                case 'tier1':
                                                    return "rgb(145,207,96)";
                                                    break;
                                                case 'tier2':
                                                    return 'rgb(255,255,191)';
                                                    break;
                                                case 'tier3':
                                                    return "rgb(252,141,89)";
                                                    break;
                                                default:
                                                    return '#000000';
                                            } 
                                        }
                                        // Needed for the "Value <= tier3 EndValue" condition
                                        if((cantonsSortValue.tierViewData[k].tier == "tier3")&&(cantons.features[i].properties[savedNamePop][propertySort] == cantonsSortValue.tierViewData[k].valueEnd)) {
                                            return "#cc0000";
                                        }
                                    }
                                }
                            }
                        });
            }

            if (cantonOrRegion == "Sprachgebiet") {
               //German Part
                svg.append("path")
                    .datum(topojson.merge(swiss, swiss.objects.cantons.geometries.filter(function(d) {    
                        return d.properties.Sprachgebiet == "Deutsch";
                    })))
                    .attr("class", function () {
                        return getTierOfRegion("Deutsch") + " languageRegion";
                    })
                    .attr("d", path)
                    .on("mouseover", function () {
                        tooltipLanguageRegion("Deutsch");
                    })
                    .on("mouseout", function () {
                        tooltip.style("visibility", "hidden");

                        $("#SwissMapChartPie").html(''); 
                    });
                
                //French Part
                svg.append("path")
                    .datum(topojson.merge(swiss, swiss.objects.cantons.geometries.filter(function(d) { 
                        return d.properties.Sprachgebiet == "Franzoesisch";
                    })))
                    .attr("class", function () {
                        return getTierOfRegion("Franzoesisch") + " languageRegion";
                    })
                    .attr("d", path)
                    .on("mouseover", function () {
                        tooltipLanguageRegion("Franzoesisch");
                    })
                    .on("mouseout", function () {
                        tooltip.style("visibility", "hidden");

                        $("#SwissMapChartPie").html('');  
                    });
                
                //Italian Part
                svg.append("path")
                    .datum(topojson.merge(swiss, swiss.objects.cantons.geometries.filter(function(d) { 
                        return d.properties.Sprachgebiet == "Italienisch";
                    })))
                    .attr("class", function () {
                        return getTierOfRegion("Italienisch") + " languageRegion";
                    })
                    .attr("d", path)
                    .on("mouseover", function () {
                        tooltipLanguageRegion("Italienisch");
                    })
                    .on("mouseout", function () {
                        tooltip.style("visibility", "hidden");

                        $("#SwissMapChartPie").html(''); 
                    });

                //draws the Labels of the cantons
                svg.selectAll("text")
                    .data(cantons.features)
                    .enter().append("text")
                    .attr("transform", function (d) {
                        return "translate(" + path.centroid(d) + ")";
                    })
                    .attr("dy", ".35em")
                    .attr("class", "cantonName noselect")
                    .text(function (d) {
                        return d.properties.name;
                    });
                  
                //adds Legend
                var legend = svg.selectAll(".legend")
                .data(loadedData[savedName])
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate(-20," + i * 20 + ")"; });
                 
                legend.append("rect")
                    .attr("x", width - 18)
                    .attr("width", 18)
                    .attr("height", 18)
                    .attr("class", function(d) {                        
                        //als Klassen wird das Tier des Gebietes festlegt
                        return d.tier;
                    })
              
                legend.append("text")
                    .attr("x", width - 24)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "end")
                    .text(function(d) { 
                        return d.Sprachgebiet + "e Schweiz " + d[propertySort] + "%";  
                    });   
            }


            if (cantonOrRegion == "Kanton") {

                //draws the Labels of the cantons
                svg.selectAll("text")
                    .data(cantons.features)
                    .enter().append("text")
                    .attr("transform", function (d) {
                        return "translate(" + path.centroid(d) + ")";
                    })
                    .attr("dy", ".35em")
                    .attr("class", "cantonName noselect")
                    .text(function (d) {
                        return d.properties.name;
                    });

                //adds Legend
                var legend = svg.selectAll(".legend")
                .data(cantonsSortValue.tierViewData)
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate(-20," + i * 20 + ")"; });
                 
                legend.append("rect")
                    .attr("x", width - 18)
                    .attr("width", 18)
                    .attr("height", 18)
                    .attr("class", function(d) {                        
                            //als Klassen wird das Tier des Gebietes festlegt
                            return d.tier;
                    })
              
                legend.append("text")
                    .attr("x", width - 24)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "end")
                    .text(function(d) {

                        if (d.tier == "tier3") {
                            return d.valueStart + " <= Wert <= " + d.valueEnd + " Personen";    
                        }
                        else {
                            return d.valueStart + " <= Wert < " + d.valueEnd + " Personen";                              
                        }


                    });   
            } 


            function addTierToCantons() {
                
                // Get extent of canton data (index0=min, index1=max)
                cantonsSortValue.extent = [];
                for(var i = 0;i<cantons.features.length;i++){
                    if(i == 0){
                        // Initial borders
                        cantonsSortValue.extent[0] = cantons.features[i].properties[savedNamePop][propertySort];
                        cantonsSortValue.extent[1] = cantons.features[i].properties[savedNamePop][propertySort];
                    }else{
                        // Move border if greater or lower value
                        if(cantons.features[i].properties[savedNamePop][propertySort]>cantonsSortValue.extent[1]){
                            cantonsSortValue.extent[1] = Math.ceil(cantons.features[i].properties[savedNamePop][propertySort]);
                        }else if(cantons.features[i].properties[savedNamePop][propertySort]<cantonsSortValue.extent[0]){
                            cantonsSortValue.extent[0] = Math.floor(cantons.features[i].properties[savedNamePop][propertySort]);
                        }
                    }
                }

                // Calculate range for every step from tier to tier level
                var calculatedValueRange = (cantonsSortValue.extent[1]-cantonsSortValue.extent[0])/3;

                cantonsSortValue.tierViewData = [];
                // Only 3 tiers supported
                for(var i = 0;i<3;i++){
                    // Every tier is stored in an object
                    cantonsSortValue.tierViewData[i] = {}
                    // Set tier name with specific index
                    cantonsSortValue.tierViewData[i].tier = "tier"+(i+1);
                    if(i==0){
                        // First tier (i==0), tier1, will get the minimum Value of all (extent[0])
                        cantonsSortValue.tierViewData[i].valueStart = Math.floor(cantonsSortValue.extent[0]);
                    }else{
                        // Other tiers will get the end Value of the previous tier
                        cantonsSortValue.tierViewData[i].valueStart = cantonsSortValue.tierViewData[i-1].valueEnd;
                    }
                    // All tiers will get the ceiled Value of the own start value added with step from tier to tier
                    cantonsSortValue.tierViewData[i].valueEnd = Math.ceil(cantonsSortValue.tierViewData[i].valueStart + calculatedValueRange);
                }

            }

            function between(x, min, max) {
              return x > min && x < max;
            }

            //Add information about the age distribution in the canton
            function addAgeToCantons() {
                for ( var i = 0; i < populationWithAge.length; i++ ) {
                     //cantons.features[i].properties["populationWithAge"] = populationWithAge[i];
                    for( var i0 = 0;i0<26;i0++) {
                        if(populationWithAge[i].Kanton == cantons.features[i0].id) {
                           
                            //Alle Daten abspeichern
                            cantons.features[i0].properties["populationWithAge"] = populationWithAge[i];
                                
                        }
                    } 
                }
                    
            }


            //Add Data about canton
            function addDataToCantons() {
                for ( var i = 0; i < 26; i++ ) {      
                    //Alle Daten abspeichern
                    cantons.features[i].properties[savedNameAge] = loadedData[savedNameAge];      
                }

            }



            // Adds the Attribute tier to Cantons (which are sorted accordings to a property)
            function addTierAndRegionDataToCantons() {
                for ( var i = 0; i<3; i++) {
                    loadedData[savedName][i]["tier"]="tier"+(i+1);
                    for( var i0 = 0;i0<26;i0++) {
                        if(loadedData[savedName][i].Sprachgebiet == cantons.features[i0].properties.Sprachgebiet) {
                            
                            //Add Tier to Cantons
                            cantons.features[i0].properties["tier"]="tier"+(i+1);
                            
                            //Add Region Data
                            cantons.features[i0].properties[savedName] = loadedData[savedName][i];

                            //Ganze Daten abspeichern
                            //cantons.features[i0].propertiesData = loadedData[i];
                        }
                    }               
                }
            }

    

            
            // Creates Tooltip and PieChart for Region Graphic
            function tooltipLanguageRegion(region) {
        
                for ( var i = 0; i < cantons.features.length; i++ ) {

                    if ( (cantons.features[i].properties.Sprachgebiet == region) ) {
           
                        tooltip.text(cantons.features[i].properties.Sprachgebiet + "e Schweiz "  + cantons.features[i].properties[savedName][propertySort] + "%");
                        tooltip.style("visibility", "visible");
                        tooltip.style("border", "black 1px solid");

 

                        //Pie Chart erstellen
                        $("#SwissMapChartPie").html('<p><strong>Aufteilung Männlich/Weiblich</strong></p>');
                        var propertySortM = propertySort + " (Maennlich)";
                        var propertySortW = propertySort + " (Weiblich)";

                        pieChartMW( [ { property: "Männlich",
                                        value: cantons.features[i].properties[savedName][propertySortM] }, 
                                      { property: "Weiblich",
                                        value: cantons.features[i].properties[savedName][propertySortW] } ] );
                        if ( swissMapChartBar == 0 ) {
                            //Bar Chart erstellen
                            $("#SwissMapChartBar").html('<p><b>Schweizweit: Prozentwert pro Altersgruppe</b></p><form><label><input type="radio" name="mode" value="sort"> Absteigend nach Wert sortieren</label></form>');                                     
                            barChartSwissMapRegion(cantons.features[i].properties[savedNamePopPercentage][propertySort]);
                            swissMapChartBar = 1;

                        }
                        
                    }
                }
            }

            // Returns the Tier of the Region
            function getTierOfRegion(region) {
        
                for ( var i = 0; i < cantons.features.length; i++ ) {

                    if ( cantons.features[i].properties.Sprachgebiet == region ) {

                        return cantons.features[i].properties.tier;

                    }
                }
            }

     

                       
            //Adds the amount of Persons with X to cantons Data
            function addPersonsInCantonWithX() {
                
                var tempOld = 0;
                //var tempOld2 = 0;
                var ageGroup;
                var ageGroupValue;
                var totalValue = 0;
                
                    for( var i0 = 0;i0<cantons.features.length;i0++) {

                        cantons.features[i0].properties[savedNamePop] = new Object();
                        cantons.features[i0].properties[savedNamePopPercentage] = new Object();
                        cantons.features[i0].properties[savedNamePopPercentage][propertySort] = new Array();
                        tempOld = 0;
                        totalValue = 0;

                        
                        for ( var i1 = 1; i1 < cantons.features[i0].properties[savedNameAge].length; i1++) {
                                
                                //Safes the property Name of the current ageGroup
                                ageGroup = cantons.features[i0].properties[savedNameAge][i1]["Altersgruppe"];
                             

                                // Catch Type Error
                                try {
                                  //Safes the Value of the current ageGroup
                                  ageGroupValue = Number(cantons.features[i0].properties["populationWithAge"][ageGroup]);
                                  totalValue = totalValue + Number(cantons.features[i0].properties["populationWithAge"][ageGroup]);
                                  

                                  cantons.features[i0].properties[savedNamePopPercentage][propertySort][i1-1] = new Object();
                                  cantons.features[i0].properties[savedNamePopPercentage][propertySort][i1-1]["age"] = ageGroup;
                                  cantons.features[i0].properties[savedNamePopPercentage][propertySort][i1-1]["value"] = Number(cantons.features[i0].properties[savedNameAge][i1][propertySort]);

                                 

                                } catch (e) {

                                }
                                //Calculates and Saves the Population with X per Canton
                                cantons.features[i0].properties[savedNamePop][propertySort] = tempOld+(Number(cantons.features[i0].properties[savedNameAge][i1][propertySort]*ageGroupValue)/100);                         
                                
                                tempOld = cantons.features[i0].properties[savedNamePop][propertySort];  
                        }

                        if (absoluteOrRelative == "relative") {
                        
                            cantons.features[i0].properties[savedNamePop][propertySort] = (cantons.features[i0].properties[savedNamePop][propertySort]/totalValue)*100000;
                        }                        
                    }               
                
            } 
            



        };    

    };

    //If the Data Source Changes every generated element has to be deleted and rendered again
    function reRenderD3extern(name) {
        $("#svg").remove();
        $("#tooltip").remove();
        $("#diagrammTitelText").remove();
        $("#PropertyChoice").remove();
        $("#SwissMapChartPie").html('');
        $("#SwissMapChartBar").html('');
        swissMapChartBar = 0;
        titelGenerated = 0;
        selectGenerated = 0;
        renderD3(name);
    }

    //Removes old d3 grafic and tooltip and renders it again
    function reRenderD3(name) {
        $("#svg").remove();
        $("#tooltip").remove();
        $("#SwissMapChartPie").html('');
        $("#SwissMapChartBar").html('');
        swissMapChartBar = 0;
        renderD3(name);
    }



    //generate Titel
    function generateTitel(name) {
        if ( titelGenerated == 0 ) {
            var diagrammTitel = $("<h1></h1>").text(name).attr("id","diagrammTitelText");
            $("#diagrammTitel").append(diagrammTitel);
            titelGenerated = 1;
        }
    }


    //generates select dynamically
    function generateSelect(daten, name) {
        if ( selectGenerated == 0 ) {
            var select1 = $("<select></select>").attr({"id": "PropertyChoice", 'name': 'PropertyChoice'}).attr("onchange", "reRenderD3(savedName)");
            $("#selectData").append(select1);
            
            
            var i = 0;
            for (x in daten[0]) {
                //First Property (0) is Sprachgebiet it isn't an option

                //Second Property (1) will be the standard selection 
                if (i == 1) {
                    $("#PropertyChoice").append(new Option(x, x)).attr("selected", "selected");
                }
                if (i > 1 && i <= selectCount[name]) { 
                    $("#PropertyChoice").append(new Option(x, x));
                   
                }
                i++;
            }
            selectGenerated = 1;

            



        }

        if (buttonsGenerated == 0) {
            var label2 = $('<label>').attr({'for': 'PropertyChoice', 'class': 'LabelButton' }).text('Eigenschaft:');
            $('#selectData').prepend(label2);
        }
    }

    function setCantonOrRegion(cantonOrRegionInput) {
        cantonOrRegion = cantonOrRegionInput;
    }

    function setAbsoluteOrRelative(absoluteOrRelativeInput) {
        absoluteOrRelative = absoluteOrRelativeInput;
    }



    function generateCantonOrRegionButtons() {

            // Create total / activitytype control buttons
            var input = $('<input>').attr({'type': "radio", 'id': "regionButton", 'name': "radioCanActiv", 'checked': 'checked'});
            var label = $('<label>').attr('for', 'regionButton').text('sprachregionale Darstellung');
            $('#displayButtonsCantonOrRegion').prepend( input );
            label.insertAfter(input);
            input = $('<input>').attr({'type': "radio", 'id': "cantonButton", 'name': "radioCanActiv"});
            label = $('<label>').attr('for', 'cantonButton').text('kantonale Darstellung');
            $('#displayButtonsCantonOrRegion').append( input );
            label.insertAfter(input);

            $( "#displayButtonsCantonOrRegion" ).buttonset();

            var label2 = $('<label>').attr({'for': 'regionButton', 'class': 'LabelButton' }).text('Darstellungsart:');
            $('#displayButtonsCantonOrRegion').prepend(label2);


            // Add click event on the total / activitytype control buttons
            $('#displayButtonsCantonOrRegion :radio').click(function(){
                if($(this).attr('id')=="cantonButton"){
                    setCantonOrRegion("Kanton");
                    $( '#displayButtonsAbsoluteRelative').show();
                }else{ 
                    setCantonOrRegion("Sprachgebiet");   
                    $( '#displayButtonsAbsoluteRelative').hide();
                }
                reRenderD3(savedName);
            });
    }

    function generateAbsoluteAndRelativeButtons(){

        // Create absolute / relative control buttons 
        var input = $('<input>').attr({'type': "radio", 'id': "absoluteButton", 'name': "radioAbsRel"});
        var label = $('<label>').attr('for', 'absoluteButton').text('absolute Daten');
        $('#displayButtonsAbsoluteRelative').append( input );
        label.insertAfter(input);
        input = $('<input>').attr({'type': "radio", 'id': "relativeButton", 'name': "radioAbsRel", 'checked': 'checked'});
        label = $('<label>').attr('for', 'relativeButton').text('relative Daten');
        $('#displayButtonsAbsoluteRelative').prepend( input );
        label.insertAfter(input);
        $( "#displayButtonsAbsoluteRelative" ).buttonset();

        var label2 = $('<label>').attr({'for': 'relativeButton', 'class': 'LabelButton' }).text('Datenberechnung: ');
        $('#displayButtonsAbsoluteRelative').prepend(label2);

        $("#displayButtonsAbsoluteRelative").hide();




        // Add click event on the absolute / realitve control buttons
        $('#displayButtonsAbsoluteRelative :radio').click(function(){
            if($(this).attr('id')=="relativeButton"){
                setAbsoluteOrRelative("relative");
            }else{
                setAbsoluteOrRelative("absolute");
            }
            reRenderD3(savedName);
        });

    }


    function generateDataSet() {

            // Create total / activitytype control buttons
            var input = $('<input>').attr({'type': "radio", 'id': "BlutdruckButton", 'name': "radioDataSet", 'checked': 'checked'});
            var label = $('<label>').attr('for', 'BlutdruckButton').text('Hoher Blutdruck');
            $('#displayButtonsDataSet').prepend( input );
            label.insertAfter(input);
            input = $('<input>').attr({'type': "radio", 'id': "HerzinfarktButton", 'name': "radioDataSet"});
            label = $('<label>').attr('for', 'HerzinfarktButton').text('Herzinfarkt');
            $('#displayButtonsDataSet').append( input );
            label.insertAfter(input);
            input = $('<input>').attr({'type': "radio", 'id': "BMIButton", 'name': "radioDataSet"});
            label = $('<label>').attr('for', 'BMIButton').text('BMI');
            $('#displayButtonsDataSet').append( input );
            label.insertAfter(input);

            var label2 = $('<label>').attr({'class': 'LabelButton' }).text('Datensatz: ');
            $('#displayButtonsDataSet').prepend(label2);

            $( "#displayButtonsDataSet" ).buttonset();


            // Add click event on the total / activitytype control buttons
            $('#displayButtonsDataSet :radio').click(function(){
                if($(this).attr('id')=="BlutdruckButton"){
                    reRenderD3extern("Blutdruck");
                }
                else if ($(this).attr('id')=="BMIButton") { 
                    reRenderD3extern("BMI");
                }
                else {
                    reRenderD3extern("Herzinfarkt");   
                }         
            });

    }


    //Sorts Elements in an Array accordings to a property
    function dynamicSort(property) {
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }






