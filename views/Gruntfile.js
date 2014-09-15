/*global module:false*/
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        concat : {
            dist : {
                src : ['views/bottom.js', 'views/vFlightInfo.js', 'views/vPassengerCorporater1.js', 'views/vPassenger.js', 'views/vVouchersCorporater.js', 'views/vVouchers.js', 'views/vInsurance.js', 'views/vOrder.js', 'views/vPayment.js', 'views/vTravelPackages.js'],
                dest : 'dist/bookingInfoViews.js'
            }
        },
        uglify : {
            dist : {
                src : 'bookinginfo.js',
                dest : 'bookinginfo.min.js'
            }
        }
    });
    
    //grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    // Default task(s).
    grunt.registerTask('default', ['uglify']);

};
