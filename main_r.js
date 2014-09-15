/**
 * grunt 打包使用,修改了VIEWS_PATH,使其指向dist目录
 */
window.BASEURL = '/webapp/';
window.LIBS_URL = 'res/libs/';
window.APP_PATH = 'flight/';
window.COMMON_PATH = 'app/common/';
window.MODELS_PATH = 'flight/models/';
window.VIEWS_PATH = 'flight/dest/views/';
window.MODULES_PATH = 'flight/dest/modules/';
window.DEFAULTINDEX = 'index';
function getViewsPath() {
    return window.VIEWS_PATH;
}

function buildViewPath(htmlpath) {
    return getViewsPath() + htmlpath;
}
function buildViewTemplatesPath(htmlpath) {
    return 'text!' + getViewsPath() + htmlpath;
}
require.config({
    baseUrl: BASEURL,
    paths: {
        // 公共页面
        'CPageStore': 'fpage/dest/models/cpagestore',
        'CPageModel': 'fpage/dest/models/cpagemodel',
        'InvoiceStore': 'invoice/dest/models/invoicestore',
        'vFlightInfo': window.MODULES_PATH + 'bookingInfo/views/vFlightInfo',
        'vPassenger': window.MODULES_PATH + 'bookingInfo/views/vPassenger',
        'vVouchers': window.MODULES_PATH + 'bookingInfo/views/vVouchers',
        'vInsurance': window.MODULES_PATH + 'bookingInfo/views/vInsurance',
        'vTravelPackages': window.MODULES_PATH + 'bookingInfo/views/vTravelPackages',
        'vParentCorporate': window.MODULES_PATH + 'bookingInfo/views/vParentCorporate',
        'vPayment': window.MODULES_PATH + 'bookingInfo/views/vPayment',
        'vOrder': window.MODULES_PATH + 'bookingInfo/views/vOrder',
        'mPassenger': window.MODULES_PATH + 'bookingInfo/models/c.mPassenger',
        'vCorporater1': window.MODULES_PATH + 'bookingInfo/views/vPassengerCorporater1',
        'mFlight': window.MODULES_PATH + 'bookingInfo/models/mFlight',
        'sFlight': window.MODULES_PATH + 'bookingInfo/models/sFlight',
        'mVouchers': window.MODULES_PATH + 'bookingInfo/models/c.mVouchers',
        'vVouchersCorporater': window.MODULES_PATH + 'bookingInfo/views/vVouchersCorporater',
        'vDataControl': window.MODULES_PATH + 'bookingInfo/views/bottom',
        'widgetHidden': 'flight/dest/widgets/c.widget.Hidden',
        'widgetForm': 'flight/dest/widgets/c.widget.form',
        'MultipleScrollList': 'flight/dest/common/MultipleScrollList',
        'adLoad': 'flight/dest/utility/adLoad',
        'Utility': 'flight/dest/utility/utility'
    },
    urlArgs: '2.4.8-201409011100'
});

require(['libs', 'App'], function (libs, App) {
    new App({
        'defaultView': DEFAULTINDEX,
        'viewRootPath': VIEWS_PATH,
        'animatSwitch': true
    });
});
