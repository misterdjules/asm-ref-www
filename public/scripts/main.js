require.config({
    baseurl: "/",
    paths: {
        "jquery": "/vendor/bower_components/jquery/jquery.min",
        "bloodhound": "/vendor/bower_components/typeahead.js/dist/bloodhound.min",
        "typeahead.jquery": "/vendor/bower_components/typeahead.js/dist/typeahead.jquery.min"
    },
    shim: {
        bloodhound: {
            exports: 'Bloodhound'
        },
        'typeahead.jquery': {
            deps: ['jquery']
        }
    }
});

require(['/scripts/autocomplete.js'], function (autocomplete) {
    autocomplete.initTypeAhead();
})