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
var config = {
	isAndroid :Ti.Platform.osname === 'android',
	isSetup : false, 
	dbName : "bGeoCache",
	iOSService : null,
	timerServiceUrl : "bGeo/Ti.Geo.Timer.js",
	lastTriggeredTime : null,
	minAgeDefault : 3,
	maxAgeDefault : 30,
	distanceFilterDefault : 100,
	isActive : false,
	eventList : [];
};


var helpers = {
	setupCheck : function(){
		if(!config.isSetup){
			exports.setup();
		}
	},
	recordError : function(e){
		var msg = (((e.message !=undefined) && (e.message!=null))? e.message : 'General Error');
		var sql = 'INSERT INTO RECORD_ERROR_TBL (MESSAGE, RECORD_DATE) VALUES(?,?)';		
		var db = Ti.Database.open(config.dbName);
		db.execute(sql,msg,(new Date().getTime()));
		db.close();
		db = null;	
		exports.fireEvent('error',e);		
	},
	recordLocation : function(e){
		var isValid = (((e.latitude!=undefined) && (e.latitude!=null)) && 
		((e.longitude!=undefined) && (e.longitude!=null)));
		if(!isValid){
			helpers.recordError({message:'Invalid Lat/Lng provided'});
			return;
		}
		var sql = 'INSERT INTO RECORD_CACHE_TBL (LATITUDE, LONGITUDE, RECORD_DATE) VALUES(?,?,?)';		
		var db = Ti.Database.open(config.dbName);
		db.execute(sql,e.latitude,e.longitude,(new Date().getTime()));
		db.close();
		db = null;	
		exports.fireEvent('change',e);
	},
	iOSRemoveService : function(){
		if(config.iOSService==null){
			return;
		}
		if(Ti.App.currentService == undefined){
			config.iOSService = null;
			return;
		}
		
		Ti.App.currentService.stop();
		Ti.App.currentService.unregister();
		config.iOSService = null;
	},
	androidRemoveService : function(){
		if(!config.isAndroid){
			return;
		}
		var intent = Ti.Android.createServiceIntent({url: config.timerServiceUrl});
		if (Ti.Android.isServiceRunning(intent)) {			
			Ti.Android.stopService(intent);		
		}	
		intent = null;
	},
	authorized : function(){
		var authorization = Ti.Geolocation.locationServicesAuthorization;
		if ((authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) ||
			(authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED)){
			return false;				
		}else{
			return true;			
		}		
	},	
	elapsedTime : function(date1,date2){
		var diff = new Date();
		diff.setTime(Math.abs(date1.getTime()-date2.getTime()));
		var mins = Math.floor(diff.getTime() / (1000 * 60));
		return mins;	
	},
	isNumber : function(n) {
  		return !isNaN(parseFloat(n)) && isFinite(n);
	},	
	safePropertyTouch : function(value,defaultValue){
		if((value==undefined)||(value==null)){
			return defaultValue;
		}
		if(!helpers.isNumber(value)){
			return defaultValue;
		}
		if(value < 1){
		   return defaultValue;
		}
		return value;
	},	
	locationCallback : function(e){
		if(config.lastTriggeredTime !=null){
			if(helpers.elapsedTime(new Date(),config.lastTriggeredTime) < exports.minAge){
				return;
			}
		}
		if (!e.success || e.error){
			helpers.recordError({message:JSON.stringify(e.error)});
			return;
		}

		helpers.recordLocation({latitude:e.coords.latitude,longitude:e.coords.longitude});		
		config.lastTriggeredTime = new Date();
	}
};

exports.fireEvent = function(eventName,paramOptions){
	var iLength = config.eventList.length;
	for (var iLoop=0;iLoop<iLength;iLoop++){
		if(config.eventList[iLoop].eventName===eventName){
			config.eventList[iLoop].callback(paramOptions);
		}
	}
};

exports.removeEventListener=function(eventName,callback){
	var iLength = config.eventList.length;
	for (var iLoop=0;iLoop<iLength;iLoop++){
		if((config.eventList[iLoop].eventName===eventName) && 
		  (config.eventList[iLoop].callback == callback)){
			  config.eventList.splice(i, 1);
		      iLoop--; //decrement	  	
		  }
	}
};

exports.addEventListener=function(eventName,callback){
	_eventList.push({eventName:eventName,callback:callback});
};
exports.active = function(){
	reurn config.isActive;
};
exports.setup = function(){
	config.isSetup = true;
	
	var db = Ti.Database.open(_dbName);
	
	db.execute('CREATE TABLE IF NOT EXISTS RECORD_CACHE_TBL (RECORD_ID INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL, LATITUDE DOUBLE, LONGITUDE DOUBLE, RECORD_DATE DOUBLE)');
	db.execute('CREATE TABLE IF NOT EXISTS RECORD_ERROR_TBL (RECORD_ID INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL, MESSAGE TEXT, RECORD_DATE DOUBLE)');
	
	db.close();
	db = null;
};	

exports.accuracy = Ti.Geolocation.ACCURACY_BEST;
exports.distanceFilter = config.distanceFilterDefault;
exports.purpose = null;
exports.trackSignificantLocationChange = true;
exports.minAge = config.minAgeDefault;
exports.maxAge = config.maxAgeDefault;
exports.provider = Ti.Geolocation.PROVIDER_GPS;

exports.startLocationManager = function(){

	if(config.isAndroid){
		var geoRule = Ti.Geolocation.Android.createLocationRule({
		    provider: exports.provider,
		    // Updates should be accurate to 100m
		    accuracy: helpers.safePropertyTouch(exports.distanceFilter, config.distanceFilterDefault),
		    // Updates should be no older than 5m
		    maxAge: (helpers.safePropertyTouch(exports.maxAge,config.maxAgeDefault) * 60000),
		    // But  no more frequent than once per 10 seconds
		    minAge: (helpers.safePropertyTouch(exports.minAge,config.minAgeDefault) * 60000)
		});
		Ti.Geolocation.Android.addLocationRule(geoRule);		
	}else{
		if(!helpers.authorized()){
			helpers.recordError({message:'not authorized'});
			return;
		}	
		if(exports.purpose !=null){
			Ti.Geolocation.purpose = exports.purpose;
		}

		Ti.Geolocation.accuracy = exports.accuracy;
		Ti.Geolocation.distanceFilter = helpers.safePropertyTouch(exports.distanceFilter, config.distanceFilterDefault);
		Ti.Geolocation.trackSignificantLocationChange = exports.trackSignificantLocationChange;			
	}	
	
	Ti.Geolocation.showCalibration = false;
	Ti.Geolocation.addEventListener('location', helpers.locationCallback);

};
exports.stopLocationManager = function(){
	Ti.Geolocation.removeEventListener('location', helpers.locationCallback);
};
exports.recordCurrentCoordinates = function(){

	if (!config.isAndroid) {
		if(!helpers.authorized()){
			helpers.recordError({message:'not authorized'});
			return;
		}
	}
	
	if((!config.isAndroid) && (exports.purpose !=null)){
		Ti.Geolocation.purpose = exports.purpose;	
	}
	
	Ti.Geolocation.showCalibration = false;
	Ti.Geolocation.getCurrentPosition(function(e){
		if (!e.success || e.error){
			helpers.recordError({message:JSON.stringify(e.error)});
			return;
		}
		helpers.recordLocation({latitude:e.coords.latitude,longitude:e.coords.longitude});
	});
			
};

exports.start  = function(){
	//Check that the cache tables are setup
	helpers.setupCheck();
	//Add the App Level Listeners
	Ti.App.addEventListener('bGeo:Now',exports.recordCurrentCoordinates);
	Ti.App.addEventListener('bGeo:Location',helpers.recordLocation);
	Ti.App.addEventListener('bGeo:Error',helpers.recordError);	
	exports.startLocationManager();
	
	if(config.isAndroid){
		
		helpers.androidRemoveService();
		
		var intent = Ti.Android.createServiceIntent({
			url: config.timerServiceUrl,
			startMode: Ti.Android.START_REDELIVER_INTENT
		});
		
		intent.putExtra('interval', (helpers.safePropertyTouch(exports.maxAge,config.maxAgeDefault) * 60) * 1000);
		Ti.Android.startService(intent);
				
	}else{
		
		if(config.iOSService!=null){
			helpers.iOSRemoveService();
		}
		Ti.App.Properties.setDouble('__bGeo_frequency',helpers.safePropertyTouch(exports.maxAge,config.maxAgeDefault));		
		config.iOSService = Ti.App.iOS.registerBackgroundService({
			url:config.timerServiceUrl
		});
	}
	config.isActive = true;
	exports.fireEvent('start');
};

exports.stop = function(){
	exports.stopLocationManager();
	
	//Remove the App Level Listeners
	Ti.App.removeEventListener('bGeo:Now',exports.recordCurrentCoordinates);
	Ti.App.removeEventListener('bGeo:Location',helpers.recordLocation);
	Ti.App.removeEventListener('bGeo:Error',helpers.recordError);
		
	if(config.isAndroid){		
		helpers.androidRemoveService();			
	}else{
		helpers.iOSRemoveService();
	}	

	config.isActive = false;
	exports.fireEvent('stop');
};

exports.pause = function(){
	if(!config.isAndroid){		
		helpers.iOSRemoveService();
	}	
};

exports.restart = function(){
	//Just call start again
	exports.start();
};

exports.readCache = function(){
	var rows = [];
	helpers.setupCheck();
	var selectSQL = 'SELECT RECORD_ID, LATITUDE, LONGITUDE, RECORD_DATE FROM RECORD_CACHE_TBL ORDER BY RECORD_DATE';
	var db = Ti.Database.open(config.dbName);
	var getRows = db.execute(selectSQL);

	if(getRows.getRowCount()>0){
		while (getRows.isValidRow()){
			rows.push({
				recordId : parseFloat(getRows.field(0)),
				latitude : parseFloat(getRows.field(1)), 
				longitude : parseFloat(getRows.field(2)),
				recordDate : new Date(parseFloat(getRows.field(3)))
			});
		}
	}				
	
	getRows.close();	
	db.close();
	db = null;	
	
	return rows;
};

exports.readErrors = function(){
	helpers.setupCheck();
	var rows = [];
	helpers.setupCheck();
	var selectSQL = 'SELECT RECORD_ID, MESSAGE, RECORD_DATE FROM RECORD_ERROR_TBL ORDER BY RECORD_DATE';
	var db = Ti.Database.open(config.dbName);
	var getRows = db.execute(selectSQL);

	if(getRows.getRowCount()>0){
		while (getRows.isValidRow()){
			rows.push({
				recordId : parseFloat(getRows.field(0)),
				message : getRows.field(1),
				recordDate : new Date(parseFloat(getRows.field(2)))
			});
		}
	}				
	
	getRows.close();	
	db.close();
	db = null;	
	
	return rows;	
};

exports.clearCache = function(){
	helpers.setupCheck();
	var db = Ti.Database.open(config.dbName);
	//REMOVE ALL RECORDS
	db.execute('DELETE FROM RECORD_CACHE_TBL');
	db.execute('DELETE FROM RECORD_ERROR_TBL');
	db.close();
	db = null;	
};
