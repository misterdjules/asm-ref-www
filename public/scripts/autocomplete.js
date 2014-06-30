function initTypeAhead() {

    var instructions = new Bloodhound({
        datumTokenizer: function (datum) {
            return Bloodhound.tokenizers.whitespace(datum.mnemonic);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        prefetch: {
            url: '/static/x86/instructions.json',
        }
    });

    instructions.clearPrefetchCache();
    instructions.initialize()
        .done(function() { console.log('Bloodhound init successful!');})
        .fail(function() { console.log('Bloodhound init failed!');});

    // passing in `null` for the `options` arguments will result in the default
    // options being used
    $('#search').typeahead({
            highlight: true
        },
        {
            name: 'instructions',
            displayKey: 'mnemonic',
            source: instructions.ttAdapter()
        }).on('typeahead:selected', function (event, datum) {
            document.location.href = './' + datum.mnemonic.toLowerCase() + '.html';
        });
}