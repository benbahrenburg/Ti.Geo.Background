/*jslint maxerr:1000 */

var my = {
	bGeo : require('bGeo/Ti.Geo.Background'),
	isAndroid : Ti.Platform.osname === 'android',
	session:{started:false}
};

my.bGeo.purpose = "Demo Background Rocks";
my.bGeo.distanceFilter = 100; //100 meters
my.bGeo.trackSignificantLocationChange = true;
my.bGeo.minAge = 3;
my.bGeo.maxAge = 30;

(function () {
    
    var win = Ti.UI.createWindow({
        backgroundColor: '#fff', title: 'Background Geo Rocks', 
        barColor:'#000',fullscreen:false
    });
      
	var mapView = Ti.Map.createView({
		top:80, bottom:0, left:5, right:5, userLocation:false
	});
	win.add(mapView);

	var startStopButton = Ti.UI.createButton({
		title:((my.session.started) ? 'stop' :'start'),
		top:10, height:40,left:5, width:75
	});
	win.add(startStopButton);
	
	var clearButton = Ti.UI.createButton({
		title:'Clear', top:10, height:40,left:85, width:75
	});
	win.add(clearButton);
		
	var refreshButton = Ti.UI.createButton({
		title:'Refresh', top:10, height:40,left:165, width:75
	});
	win.add(refreshButton);		

	clearButton.addEventListener('click',function(e){
		my.bGeo.clearCache();
		mapView.removeAllAnnotations();
	});
	
	startStopButton.addEventListener('click',function(e){
		if(my.session.started){
			my.bGeo.stop();
			my.session.started = false;
		}else{
			my.bGeo.start();
			my.session.started = true;			
		}
		startStopButton.title=((my.session.started) ? 'stop' :'start');
	});

	refreshButton.addEventListener('click',function(e){
		mapView.removeAllAnnotations();
		var results = my.bGeo.readCache();
		for (iLoop=0;iLoop < results.length;iLoop++){
			assistant.addToMap(results[iLoop]);
		}		
	});
					

	var assistant = {
		addToMap : function(e){
			var pin = Ti.Map.createAnnotation({
				latitude:e.latitude,longitude:e.longitude		
			});
			mapView.addAnnotation(pin);
			
			var region = {latitude:e.latitude,longitude:e.longitude,
				          latitudeDelta:0.04, longitudeDelta:0.04};
			mapView.setLocation(region);			
		},
		locationChangeCallback : function(e){
			Ti.API.info('Location changed');
			assistant.addToMap(e);
		},
		locationError : function(e){
			alert('Error due to ' + e.message);
		}
	};

	my.bGeo.addEventListener('change',assistant.locationChangeCallback);
	my.bGeo.addEventListener('error',assistant.locationError);
   
    win.open({modal:true});
        
})();    

if(!my.isAndroid){
	Ti.App.addEventListener('resumed',function(e){
		if(my.session.started){
			my.bGeo.stop();
		}
	});
	
	Ti.App.addEventListener('close',function(e){
		my.bGeo.stop();
	});
	
	Ti.App.addEventListener('pause',function(e){
		if(my.session.started){
			my.bGeo.start();
		}
	});	
}

