AlFehrestNS.Config = function(key) {
    var config = {
        'production' : {
            'url' : 'http://api.alfehrest.org/alkindi/',
            'startupNodeId' : 'authority_N1Ypy-H_dBL0l',
            'MAX_REL_COUNT' : 10,
            'MAX_NAME_LENGTH' : 50
        },
        'development' :{
            'url' : 'http://api.alfehrest.org/alkindi/',
            'startupNodeId' : 'authority_N1Ypy-H_dBL0l',
            'MAX_REL_COUNT': 10,
            'MAX_NAME_LENGTH' : 50
        }
    };

    var cfg = config[AlFehrestNS.env];
    if(typeof cfg[key] === 'undefined') {
        throw("Couldn't find configuration key " + key);
    }
    return cfg[key]
    
};