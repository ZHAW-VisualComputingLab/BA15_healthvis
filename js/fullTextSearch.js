$("[name='detailedSearch']").bootstrapSwitch();
var fullTextSearchEvent = function() {
	// Clear #queryResults
	$( '#queryResults' ).empty();

	var clientCKAN = new CKAN.Client('http://opendata.admin.ch/api');
	var searchQuery = $( "#fullTextSearchInput" ).val();

	if(searchQuery == ''){
		searchQuery = "Gesundheit";
	}

	// Process the search query
	clientCKAN.action('package_search', {	    
		q: searchQuery
		},
		function(err, out) {
			if (err) console.log("Err: " + err);

			if(out.result.count == 0){
				$( '#queryResults' ).append($('<div>').append($('<p>').text('Keine Resultate')));
			}
			console.log(out.result.results);
			if($("[name='detailedSearch']").bootstrapSwitch('state')){
				var tempResultContainer = $( '<div>' );
				var tempPanelPrimary;
				var oneLevelProperty;
				var threeColumnCounter = 0;
				var threeColumnArrayCounter = 0;		
				var tempDivForThreeTextColumn;
				var tempDivForThreeArrayColumn;
				var tempThreeTextColumnRow;
				var tempThreeArrayColumnRow;
				var tempFullWidthTextRow;
				var tempFullWidthTextRowContent;
				var divThreeTextColumnSection;
				var divFullWidthTextSection;
				var divArrObjThreeColumSection;
				var tempArrPanelBody;
				var tempArrListGroup;
				var tempArrPanelInfo;
				var tempArrPanelHeading;
				var tempArrListGroupItem;
				var tempTextContent;
				var tempTagCloudContent;
				var d3TagCloudCoutner = 0;
				var tagCloudsReadyToDraw = [];

				for(var i = 0;i<out.result.results.length;i++){
					tempPanelPrimary = $("<div>").attr("class", "panel panel-primary");
					tempPanelPrimary.append($("<div>").attr("class", "panel-heading").text(out.result.results[i].title));
					console.log("#############################################################" + out.result.results[i].title);
					threeColumnCounter = 0;
					threeColumnArrayCounter = 0;	
					divThreeTextColumnSection = $('<div>');
					divFullWidthTextSection = $('<div>');
					divArrObjThreeColumSection = $('<div>');
					$.each(out.result.results[i], function(index, value){
						console.log(index + " Array? " + Array.isArray(value));
						if(Array.isArray(value) || $.isPlainObject(value)){

							if(threeColumnArrayCounter == 0){
								tempThreeArrayColumnRow = $('<div>').attr('class', 'row');
								divArrObjThreeColumSection.append(tempThreeArrayColumnRow);
								$(tempThreeArrayColumnRow).empty();
							}
							tempDivForThreeArrayColumn = $('<div>').attr('class', 'col-sm-12 col-md-4');
							tempArrPanelInfo = $('<div>').attr('class', 'panel panel-info');
							tempArrPanelHeading = $('<div>').attr('class', 'panel-heading').html("<span class=\"glyphicon glyphicon-zoom-in\"></span> " + index);
							tempArrPanelHeading.click(function(){
								$(this).next().toggle("slow");
							})
							tempArrPanelInfo.append(tempArrPanelHeading);
							tempArrPanelBody = $('<div>').attr('class', 'panel-body').css('display', 'none');
							tempArrListGroup = $('<div>').attr('class', 'list-group');
							tempArrPanelBody.append(tempArrListGroup);

							if(index == "tags"){
								tempArrListGroupItem = $('<div>').attr({'class': 'list-group-item', 'id': 'd3TagCloud' + d3TagCloudCoutner});
								tempTagCloudContent = [];
								tempArrListGroup.append(tempArrListGroupItem);
								for(var k = 0;k<value.length;k++){
									tempTagCloudContent.push(("" + value[k].display_name).replace("-",""));
								}

								tagCloudsReadyToDraw.push(new d3TagClound('d3TagCloud' + d3TagCloudCoutner, tempTagCloudContent));
								d3TagCloudCoutner++;
							}

							if(Array.isArray(value)){
								
								for(var m = 0;m<value.length;m++){

									tempArrListGroupItem = $('<div>').attr('class', 'list-group-item');
									$.each(value[m], function(ilvl2, vlvl2){
										tempArrListGroupItem.append($('<p>').html("<b>" + ilvl2 + ":</b> " + vlvl2) );
									});
									tempArrListGroup.append(tempArrListGroupItem);
								}
							}else{
								$.each(value, function(ilvl2, vlvl2){
									tempArrListGroupItem = $('<div>').attr('class', 'list-group-item');
									tempArrListGroupItem.append($('<p>').html("<b>" + ilvl2 + ":</b> " + vlvl2) );
									tempArrListGroup.append(tempArrListGroupItem);
								});
							}

							tempArrPanelInfo.append(tempArrPanelBody);
							tempDivForThreeArrayColumn.append(tempArrPanelInfo);
							tempThreeArrayColumnRow.append(tempDivForThreeArrayColumn);
							threeColumnArrayCounter = (threeColumnArrayCounter+1)%3;	
						}else{
							if(typeof value === 'string'){
							    tempTextContent = value;
							}else{
								tempTextContent = JSON.stringify(value);
							}
							if((index + "" + value).length > 50){
								tempFullWidthTextRow = $('<div>').attr('class', 'row');
								tempFullWidthTextRowContent = $('<div>').attr('class', 'col-sm-12');
								tempFullWidthTextRowContent.append($("<p>").text(tempTextContent).prepend($('<b>').text(index + ": ")));
								tempFullWidthTextRow.append(tempFullWidthTextRowContent);
								divFullWidthTextSection.append(tempFullWidthTextRow);
							}else{
								if(threeColumnCounter == 0){
									tempThreeTextColumnRow = $('<div>').attr('class', 'row');
									divThreeTextColumnSection.append(tempThreeTextColumnRow);
								}
								tempDivForThreeTextColumn = $('<div>').attr('class', 'col-sm-12 col-md-4');
								tempDivForThreeTextColumn.append($("<p>").text(tempTextContent).prepend($('<b>').text(index + ": ")));							
								tempThreeTextColumnRow.append(tempDivForThreeTextColumn);
								threeColumnCounter = (threeColumnCounter+1)%3;							
							}				
						}
					});
					tempPanelPrimary.append(divThreeTextColumnSection);
					tempPanelPrimary.append(divFullWidthTextSection);
					tempPanelPrimary.append(divArrObjThreeColumSection);
					tempResultContainer.append(tempPanelPrimary);
				}
				$( '#queryResults' ).append(tempResultContainer);
				for(var p = 0;p<tagCloudsReadyToDraw.length;p++){
					tagCloudsReadyToDraw[p].drawTagCould();
				}
			}else{
				// Iterate trough all results and build result tables for each found package
				var tempResultPanel, tempResultPanelHeading, tempResultTable, tempResultTableHeading;
				for(var i = 0;i<out.result.results.length;i++){
					
					// Build new result panel
					tempResultPanel = $( '<div>' ).attr('class', 'panel panel-default');

					// Build new result panel-heading
					tempResultPanelHeading = $( '<div>' ).attr('class', 'panel-heading'); 
					tempResultPanelHeading.append( $( '<strong>' ).text(out.result.results[i].title));

					// Build new result table
					tempResultTable = $( '<table>' ).attr('class', 'table table-hover table-condensed');
					// Build new result table-heading
					tempResultTableHeading = $( '<thead>' )
											.append( $( '<tr>' )
														.append( $( '<th style="width: 10px;">' ).text( '#' ) )
														.append( $( '<th>' ).text( 'URL' ) )
													);
					tempResultTable.append(tempResultTableHeading);

					// Iterate trough all found url's each found package
					for(var k = 0;k<out.result.results[i].resources.length;k++){
						tempResultTable.append( $( '<tr>' )
															.append( $( '<td>' ).text( k+1 ) )
															.append( $( '<td>' ).append( $( '<a>' ).attr( { title: "Dokuemtenlink zu " + out.result.results[i].title, href: out.result.results[i].resources[k].url} ).text( out.result.results[i].resources[k].url ) ) )
														);
					}

					// Aggregate components of result table / panel
					tempResultPanel.append(tempResultPanelHeading);
					tempResultPanel.append(tempResultTable);

					$( '#queryResults' ).append(tempResultPanel);
				}
			}
	});
	window.scrollTo(0, 0);
}

$(document).ready(function(){
	$( "#fullTextSearchButton" ).click(fullTextSearchEvent);
	$( "#fullTextSearchInput" ).keypress(function(e) {
	    if(e.which == 13) {
	        fullTextSearchEvent();
	    }
	});
})