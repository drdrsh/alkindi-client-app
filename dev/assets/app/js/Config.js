AlFehrestNS.Config = function(key) {
    var config = {
        'production' : {
            'url' : 'http://api.alfehrest.org/alkindi/',
            'startupNodeId' : 'authority_167c8856985f5',
            'MAX_REL_COUNT' : 10,
            'MAX_NAME_LENGTH' : 50
        },
        'development' :{
            'url' : 'http://localhost:6001/alkindi/',
            'startupNodeId' : 'authority_167c8856985f5',
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