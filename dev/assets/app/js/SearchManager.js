AlFehrestNS.SearchManager = (function(){

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
                res( $.grep( mData, function( value ) {
                    if(found >= maxCount){
                        return false;
                    }
                    value = value.label || value.value || value;
                    result = matcher.test( value ) || matcher.test( normalizeLetters( value ) );
                    if(result){
                        found++;
                    }
                    return result;
                }));
            },

            minLength: 2,

            select: function( event, ui ) {
                if(ui.item.cb(ui.item)) {
                    AlFehrestNS.UI.hideSearchBox();
                }
                mDomInput.focus();
                return false;
            }

        });

        mDomInput.data( "ui-autocomplete" )._renderItem = function( ul, item ) {
            return $( "<li></li>" )
                .addClass(item.type)
                .data( "item.autocomplete", item )
                .append( "<a><span></span>" + item.label + "</a>" )
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

        register : function(elements){
            $.each(elements, function(idx, obj){ mData.push(obj);});
            prepareDomElement();
        }
    };

    return mSelf;

})();