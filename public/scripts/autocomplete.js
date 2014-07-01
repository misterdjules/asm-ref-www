var x86Subdir = '/static/x86';

function initTypeAhead() {

    var instructions = new Bloodhound({
        datumTokenizer: function (datum) {
            return Bloodhound.tokenizers.whitespace(datum.mnemonic);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        prefetch: {
            url: x86Subdir + '/instructions.json',
        }
    });

    instructions.initialize()
        .done(function() { console.log('Bloodhound init successful!');})
        .fail(function() { console.log('Bloodhound init failed!');});

    $('#search').typeahead({
            highlight: true
        },
        {
            name: 'instructions',
            displayKey: 'mnemonic',
            source: instructions.ttAdapter()
        }).on('typeahead:selected', function (event, datum) {
            document.location.href = x86Subdir + '/instructions/' +
                                     datum.mnemonic.toLowerCase() + '.html';
        });
}
