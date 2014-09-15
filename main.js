window.BASEURL = '/webapp/';
window.LIBS_URL = 'res/libs/';
window.APP_PATH = 'flight/';
window.COMMON_PATH = 'app/common/';
window.MODELS_PATH = 'flight/models/';
window.VIEWS_PATH = 'flight/views/';
window.DEFAULTINDEX = 'index';
function getViewsPath() {
	return 'flight/views/';
}

function buildViewPath(htmlpath) {
	return getViewsPath() + htmlpath;
}
function buildViewTemplatesPath(htmlpath) {
	return 'text!' + getViewsPath() + htmlpath;
}
require.config({
    baseUrl : BASEURL,
    shim : {
        _ : {
	        exports : '_'
        },
        B : {
            deps : [ '_', '$' ],
            exports : 'Backbone'
        },
        App : {
	        deps : [ 'B' ]
        }
    },
    paths : {

        'BusinessModel':'flight/models/BusinessModel',
        // 机票model
        'FlightModel' : 'flight/models/flightmodel',
        // 机票store
        'FlightStore' : 'flight/models/flightstore',
        // 公共页面
        'CPageStore' : '../webapp/fpage/models/cpagestore',
        'CPageModel' : '../webapp/fpage/models/cpagemodel',
        'InvoiceStore' : 'invoice/models/invoicestore',
        'mapping': 'flight/mapping/mapping',
        'relationship': 'flight/mapping/relationship',
        'lowpricecalendar': 'flight/views/lowpricecalendar',
        'adLoad': '../webapp/flight/utility/adLoad',
        'adLayer': '../webapp/flight/utility/adLayer',
        'Utility': 'flight/utility/utility',
        'vSupperChild': 'flight/modules/bookingInfo/views/vSupperChild',
        'mPassenger': 'flight/modules/bookingInfo/models/c.mPassenger',
        'mFlight': 'flight/modules/bookingInfo/models/mFlight',
        'sFlight': 'flight/modules/bookingInfo/models/sFlight',
        'mVouchers': 'flight/modules/bookingInfo/models/c.mVouchers',
        
        'vDataControl': 'flight/modules/bookingInfo/views/DataControl'
        
        ,'vFlightInfo':'flight/modules/bookingInfo/views/vFlightInfo'

        ,'vPassengerRender':'flight/modules/bookingInfo/views/vPassengerRender'
        ,'vPassengerTask':'flight/modules/bookingInfo/views/vPassengerTask'
        
        ,'vVoucherRender':'flight/modules/bookingInfo/views/vVoucherRender'
        ,'vVoucherTask': 'flight/modules/bookingInfo/views/vVoucherTask'
        
        ,'vInsurance': 'flight/modules/bookingInfo/views/vInsurance'
        ,'vTravelPackages': 'flight/modules/bookingInfo/views/vTravelPackages'
        
        ,'vPayment' : 'flight/modules/bookingInfo/views/vPayment'
        ,'vOrder' : 'flight/modules/bookingInfo/views/vOrder'
       
        
        ,'widgetHidden': 'flight/widgets/c.widget.Hidden',
        'widgetMask': 'flight/widgets/c.widget.Mask',               //p1
        'widgetForm': 'flight/widgets/c.widget.form',
        'MultipleScrollList': 'flight/common/MultipleScrollList',
    
    },
    urlArgs: '2.4.8-201409011100'

});

require([ 'libs', 'App' ], function(libs, App) {
	var app = new App({
	    'defaultView' : DEFAULTINDEX,
	    'viewRootPath' : VIEWS_PATH,
	    'animatSwitch' : true,
	    'channel' : 'flight'
	});
});

window.onunload = function() {
};
