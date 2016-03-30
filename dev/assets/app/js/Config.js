AlFehrestNS.Config = function(key) {
    var config = {
        'production' : {
            'url' : 'http://api.alfehrest.org/alkindi/',
            'startupNodeId' : 'authority_VkZJXeujYfRl',
            'MAX_REL_COUNT' : 25,
            'MAX_NAME_LENGTH' : 50
        },
        'development' :{
            'url' : 'http://api.alfehrest.org/alkindi/',
            'startupNodeId' : 'authority_VkZJXeujYfRl',
            'MAX_REL_COUNT': 25,
            'MAX_NAME_LENGTH' : 50
        }
    };

    var cfg = config[AlFehrestNS.env];
    if(typeof cfg[key] === 'undefined') {
        throw("Couldn't find configuration key " + key);
    }
    return cfg[key]
    
};