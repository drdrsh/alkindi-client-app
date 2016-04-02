AlFehrestNS.SearchManager = (function(){
    var mCallback = null;
    function normalizeLetters(input){
        if(typeof input == 'object'){
            return input;
        }
        input = "" + input;
        return input
            .replace(/أ/g,"ا")
            .replace(/إ/g,"ا")
            .replace(/ى/g,"ي")
            .replace(/ة/g,"ه");
    }

    var mDomInput = null;
    var mData = [];
    var mSelf = {};

    function prepareDomElement() {
        if(!mDomInput || mDomInput.length == 0)return;

        mDomInput.autocomplete({
            /*
            position: {
                my : "center",
                at: "right bottom",
                collision: false
            },
            */
            open: function(event, ui){
                $(".ui-autocomplete")
                    .addClass('search-menu')
                    .scrollTop(0);
            },

            response: function(event, ui) {
                // ui.content is the array that's about to be sent to the response callback.
                if (ui.content.length === 0) {
                    $(".ui-autocomplete").addClass('no-results');
                    ui.content.push({
                        cb   : function (){
                            mDomInput.val('');
                            return false;
                        },
                        id   : null,
                        label: _('no_results'),
                        value: _('no_results'),
                        type : "msg"
                    });
                } else {
                    $(".ui-autocomplete").removeClass('no-results');
                }
            },

            source: function(req, res){
                req.term = normalizeLetters(req.term);
                var matcher = new RegExp( $.ui.autocomplete.escapeRegex( req.term ), "i" );
                var maxCount = 10;
                var found = 0;

                res(
                    mData.get({
                        filter: function (item) {
                            if (found >= maxCount) {
                                return false;
                            }
                            var name = item.name || item.title;
                            if (matcher.test(normalizeLetters(name))) {
                                ++found;
                                return true;
                            }
                            return false;
                        }
                    })
                );
            },

            minLength: 2,

            select: function( event, ui ) {
                if(mCallback) {
                    mCallback(ui.item);
                }
                mDomInput.focus();
                return false;
            }

        });

        mDomInput.data( "ui-autocomplete" )._renderItem = function( ul, item ) {
            var shortLabel = item.name || item.title;
            if(shortLabel.length > AlFehrestNS.Config('MAX_NAME_LENGTH')) {
                shortLabel = shortLabel.substr(0, AlFehrestNS.Config('MAX_NAME_LENGTH')) + '...';
            }

            return $( "<li></li>" )
                .addClass(item.entity_type)
                .data( "item.autocomplete", item )
                .append(shortLabel)
                .appendTo( ul );
        };
    }


    mSelf = {
        attach : function(elm){
            mDomInput = elm;
            prepareDomElement();
        },

        clear : function(){
            mData = [];
            prepareDomElement();
        },

        register : function(dataset, cb){
            mData = dataset;
            prepareDomElement();
            mCallback = cb;
        }
    };

    return mSelf;

})();