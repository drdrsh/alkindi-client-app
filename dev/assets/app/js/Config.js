AlFehrestNS.Config = function(key) {
    var config = {
        'production' : {
            'url' : 'http://api.alfehrest.org/alkindi/',
            'startupNodeId' : 'work_d41bf16e6a9e3',
            'MAX_REL_COUNT': 5,
            'MAX_NAME_LENGTH' : 50
        },
        'development' :{
            'url' : 'http://localhost:6001/alkindi/',
            'startupNodeId' : 'work_d41bf16e6a9e3',
            'MAX_REL_COUNT': 5,
            'MAX_NAME_LENGTH' : 50
        }
    };

    var cfg = config[AlFehrestNS.env];
    if(typeof cfg[key] === 'undefined') {
        throw("Couldn't find configuration key " + key);
    }
    return cfg[key]
    
};