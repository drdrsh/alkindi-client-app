AlFehrestNS.loadLanguage = function(lang) {
    if(!AlFehrestNS.activeLanguage) {
        $.getScript( "assets/app/language/"+lang+".js" );
    }
    window._ = function(str, def) {
        if(str in AlFehrestNS.activeLanguage) {
            return AlFehrestNS.activeLanguage[str];
        } else {
            console.warn("Missing string " + str);
            return def || str;
        }
    };

};