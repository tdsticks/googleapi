function GoogleClass () 
{
	console.log("\n::GoogleClass::");

	console.log(google);

	google.load(
			'visualization',
			'1',
      		{
      			'packages': 
      						[
	      						'table',
	      						'map',
	      						'corechart'
      						]
      		}
	);

	google.setOnLoadCallback( this.initialize );

	console.log('Google Class loaded');
}


GoogleClass.prototype.initialize = function ()
{	
	console.log("\n::initialize::");

	gCls._geocoder 						= new google.maps.Geocoder();
	//console.log(this._geocoder);

	gCls._data 							= new Array();

	gCls._data['NumOfRow']				= 0;

	gCls._geocodeCount					= 0;

    // Google Doc
    // https://docs.google.com/spreadsheet/ccc?key=0AtCDgg051uxedENuUVJZdVZlX2V6dFVlY1poREthb3c#gid=0

	// Google Spread Sheet JSON
	// http://spreadsheets.google.com/tq?key=0AtCDgg051uxedENuUVJZdVZlX2V6dFVlY1poREthb3c

	var query 							= new google.visualization.Query(
		'http://spreadsheets.google.com/tq?key=0AtCDgg051uxedENuUVJZdVZlX2V6dFVlY1poREthb3c'
	);
	//console.log(query);

	query.send( gCls.querySheetData );
}


GoogleClass.prototype.codeAddress = function (address, rowNum)
{	
	console.log("\n::codeAddress::");
	
	gCls._geocoder.geocode( { 'address': address }, gCls.geocoderResults );	
}


GoogleClass.prototype.geocoderResults = function (results, status)
{
	console.log("\n::geocoderResults::");

	var loc 							= new Array();

	if ( status == google.maps.GeocoderStatus.OK ) 
	{
		console.log( "google.maps.GeocoderStatus.OK" );
		//console.log(results);

		lng 							= results[0].geometry.location.lng();
		lat 							= results[0].geometry.location.lat();
		
		gCls._data['rows']['Lat'][gCls._geocodeCount] = lat;
		gCls._data['rows']['Lng'][gCls._geocodeCount] = lng;
		
		//console.log( gCls._geocodeCount );
		gCls._geocodeCount++;

	} else {
		alert("Geocode was not successful for the following reason: " + status);
	}

	//console.log(results, status);

	if (gCls._geocodeCount == gCls._data['NumOfRow'])
	{
		console.log(gCls._data);

		gCls.createTable();

		gCls.createMap();
	}
}


GoogleClass.prototype.querySheetData = function (response)
{
    console.log("\n::querySheetData::");

    if ( response.isError() ) 
    {
    	alert('Error in query');
    }

	// Gather data from Sheet cells and rows
   	var sheetData 						= response.getDataTable();
   	gCls._data['sheet'] 				= response.getDataTable();
    //console.log(sheetData);

    gCls._data['NumOfCol'] 				= gCls._data['sheet'].getNumberOfColumns();

    gCls._data['NumOfRow'] 				= gCls._data['sheet'].getNumberOfRows();

    var getColumnAry					= new Array();
    var getRowAry						= new Array();

    for (c=0; c < gCls._data['NumOfCol']; c++)
    {
    	columnName 						= sheetData.getColumnLabel(c);
    	//console.log("columnName: " + columnName);

    	getColumnAry[columnName] 		= sheetData.getColumnType(c);

    	var collectRowsAry 				= new Array();
    	for (r=0; r <  gCls._data['NumOfRow']; r++)
    	{
    		rowName 					= sheetData.getValue(r, c);
    		//console.log("rowName: " + rowName);
    		
    		collectRowsAry[r] 			= rowName;

    		// Get the Longitude and Latitude coordinates
    		if (columnName == "Location")
    		{
    			console.log(rowName);
    			gCls.codeAddress( rowName, r );
    		}
    	}
    	//console.log(collectRowsAry);
    
    	getRowAry[columnName]			= collectRowsAry;
    }
    //console.log(getRowAry);

    gCls._data['columns'] 				= getColumnAry;
    //console.log(getColumnAry);
    
    gCls._data['rows'] 					= getRowAry;

   	//console.log(gCls._data);
}


GoogleClass.prototype.createTable = function () 
{
	console.log("\n::createTable::");

 	// Create Table from Sheet Data
    gCls._data['tableData']  			= new google.visualization.DataTable();

    var columns 						= gCls._data['columns'];
    //console.log(columns);

    var rows 							= gCls._data['rows'];

	var numOfCols						= gCls._data['NumOfCol'];

    var numOfRows 						= gCls._data['NumOfRow'];

    for (colID in columns ) 
    {
   		//console.log( colID, columns[colID] );

   		gCls._data['tableData'].addColumn( columns[colID], colID );
    }

    gCls._data['tableData'].addRows( numOfRows );

    var c 								= 0;

    for (colID in rows)
    {
   		rowData 						= rows[colID]; 

   		//console.log(c, colID, rowData);
   	
   		for (rowID in rowData) 
   		{
   			rowNum 						= parseInt(rowID);

   			rowName 					= rowData[rowID];
   			
   			//console.log(rowNum, c, rowName, columns[colID]);

   			gCls._data['tableData'].setCell( rowNum, c, rowName );
   		}
   		c++;
    }

    gCls._data['table'] 				= new google.visualization.Table(document.getElementById('table_div'));
    
    gCls._data['table'].draw( 
    							gCls._data['tableData'], 
    							{showRowNumber: false} 
    						);

}


GoogleClass.prototype.createMap = function ()
{
    console.log("\n::createMap::");

	gCls._data['mapData'] 				= gCls._data['tableData'];

	var columns 						= gCls._data['columns'];
	console.log(columns);

	var removeID 						= columns.indexOf( "Spiritual" );
	console.log(removeID);
    //gCls._data['mapData'].removeColumn( removeID );

	/* 
	var removeID 						= gCls._data['columns'].indexOf( "SpiritualRating" );
    gCls._data['mapData'].removeColumn( removeID );

	var removeID 						= gCls._data['columns'].indexOf( "Mood" );
    gCls._data['mapData'].removeColumn( removeID );

	var removeID 						= gCls._data['columns'].indexOf( "MoodRating" );
    gCls._data['mapData'].removeColumn( removeID );
	*/

    /*console.log( gCls._data['mapData'] );

    gCls._data['map'] 					= new google.visualization.Map(document.getElementById('map_div'));
    
    gCls._data['map'].draw( 
			    			gCls._data['mapData'],
			    		 	{showTip: true}
			    		);
*/

    // Set a 'select' event listener for the table.
    // When the table is selected,
    // we set the selection on the map.
    /*google.visualization.events.addListener(table, 'select',
        function() {
        	gCls._data['map'].setSelection( gCls._data['table'].getSelection() );
        }
    );*/

    // Set a 'select' event listener for the map.
    // When the map is selected,
    // we set the selection on the table.
    /*google.visualization.events.addListener(map, 'select',
        function() {
          table.setSelection(map.getSelection());
        }
    );*/

    //var ticketsData = response.getDataTable();
    //console.log(ticketsData);

    /*var chart = new google.visualization.ColumnChart(
        document.getElementById('chart_div')
    );

    chart.draw(
    	ticketsData, {
        	'isStacked': true,
        	'legend': 'bottom',
            'vAxis': {'title': 'Number of tickets'}
    	}
    );*/
}


/*
function mapsLoaded() {
  var map = new google.maps.Map2(document.getElementById("map"));
  map.setCenter(new google.maps.LatLng(37.4419, -122.1419), 13);
}

function loadMaps() {
  google.load("maps", "2", {"callback" : mapsLoaded});
}
*/


gCls 									= new GoogleClass();
//console.log(gCls);
