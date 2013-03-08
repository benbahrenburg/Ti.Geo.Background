/*jslint maxerr:1000 */
/**
* 
* Ti.Geo.Background: Titanium background geo location framework
* Copyright: 2013 Benjamin Bahrenburg (http://bencoding.com)
* License: http://www.apache.org/licenses/LICENSE-2.0.html
* 
* Source Available at:https://github.com/benbahrenburg/Ti.Geo.Background
* 
*/
var _isAndroid = Ti.Platform.osname === 'android';
var serviceObject = {
    counter : 0,
    counterInterval : 60000,
    counterId : null,
    lookupFrequency : Ti.App.Properties.getDouble('__bGeo_frequency',55),
    lastLookupDate : null
};

var helpers = {
	doGeoLookup : function(){
    	Ti.App.fireEvent('bGeo:Now');
    	serviceObject.lastLookupDate = new Date();		
	},
	elapsedTime : function(date1,date2){
		var diff = new Date();
		diff.setTime(Math.abs(date1.getTime()-date2.getTime()));
		var mins = Math.floor(diff.getTime() / (1000 * 60));
		return mins;	
	}
};

if(_isAndroid){
	
	helpers.doGeoLookup();
	
}else{
	
	Ti.App.currentService.addEventListener('stop',function(){
		Ti.API.info("background service is stopped");
	});

	serviceObject.counterId = setInterval(function()
	{
	    serviceObject.counter++;     
	    Ti.API.debug('Service Timer Count ' + serviceObject.counter);
	    
	    if(serviceObject.lastLookupDate==null){
	    	helpers.doGeoLookup();
	    }else{
		    if(helpers.elapsedTime(new Date(),serviceObject.lastLookupDate) > serviceObject.lookupFrequency){
		    	helpers.doGeoLookup();	
		    }    	
	    }
	
	},serviceObject.counterInterval);		
}


