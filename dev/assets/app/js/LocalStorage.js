AlFehrestNS.LocalStorage = (function(){
	return {
		store	: function(key, value, ttl){
			//ttl is in days
			var now = new Date();
			var death = new Date();
			death.setDate(now.getDate() + ttl);
			
			var deathTime = death.getTime();
			if(ttl == -1){
				deathTime = null;
			}
			
			var obj = {
				ttl 		: ttl,
				createdOn 	: now.getTime(),
				diesOn		: deathTime,
				data		: value
			};
			var storedData = JSON.stringify(obj);
			
			window.localStorage.setItem(key, storedData);

		},
		
		retrieve : function(key){

			var value = window.localStorage.getItem(key);

			//Doesn't exist
			if(value == null){
				return null;
			}
			
			//Invalid JSON
			try {
				value = JSON.parse(value);
			} catch(e){
				return null;
			}
			
			//Invalid storage format
			if(typeof value.diesOn == 'undefined' || !value.createdOn){
				return null;
			}
			
			
			
			if((value.ttl > 0) && value.diesOn <= new Date().getTime()){
				window.localStorage.removeItem(key);
				return null;
			}

			return value.data;
			
		}
	}
})();