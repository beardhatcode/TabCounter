/**
 * Create an instance of TabCounter
 * @constructor
 */
function TabCounter(){
	this.store = chrome.storage.local;
	
	that = this;
	this.store.get(['settings','counts'],
	                function(data){that.init(data,that);}
	              );
}

/**
 * Object that makes strings
 * @type {Object}  
 */
TabCounter.$ = function(id){
	return document.getElementById(id);
}

/**
 * Object that makes strings
 * @type {Object}  
 */
TabCounter.prototype.lang = {

	'words'	: {
		'totToday'  	: 'tabs opened today',
		'totReset'  	: 'tabs opened since reset',
		'totInstall'  	: 'tabs opened since install',
	},

	/**
	 * Gets information on what to put in header and/or badge
	 * @param  {Object} data stored information about counts and settings
	 */
	'make' : function(data){
		var	result   = {small:'ERR',full:'Error',sentence:'Error '+data.settings.badge.content+' not found!'},
			lang     = TabCounter.prototype.lang.words;
			settings = data.settings,
			counts   = data.counts;

		switch(settings.badge.content){
			case 'totToday':
			case 'totReset':
			case 'totInstall':
				result.full     = counts[settings.badge.content].toString();
				result.small    = result.full;
				result.sentence = lang[settings.badge.content]
				break;


			case 'tillGoal':
				var num = counts[settings.goal.field],
				    goal= settings.goal.value;

				if(goal>num){
					result.full     = (goal-num).toString();
					result.small    = result.full;
					result.sentence = 'tabs left to have '+goal+' '+lang[settings.goal.field];
				}
				else
				{
					result.full     = num-goal;
					result.small    = '0';
					result.sentence = 'tabs over '+goal+' '+lang[settings.goal.field];
				}

				break;

			case 'percGoal':
				var num = counts[settings.goal.field],
				    goal= settings.goal.value;

				if(goal>0){
					//floor, because we dont want 100 to early
					var perc = Math.floor(100*num/goal);
					result.full     = perc+"%";
					result.small    = perc.toString();
					result.sentence = num+'/'+goal+' '+lang[settings.goal.field];


				}
				break;
		}

		return result;
	}
}

/**
 * Initiates the TabCounter instance
 * @param  {Object} 	data 	stored information about counts and settings
 * @param  {TabCounter} that 	the instance
 */
TabCounter.prototype.init = function(data,that){
	if(typeof data.settings == "undefined"){
		data.settings = {
			'badge':{'color':"#FF0000","content":'totToday'},
			'goal' :{'field':'totToday','value':100000},
			'today':(new Date()).toDateString()
		}

		this.store.set({settings:data.settings},console.log('settings set to default...'));
	}

	if(typeof data.counts == "undefined"){
		data.counts = {
			'totToday':0,
			'totReset':0,
			'totInstall':0,
			'record':{'value':0,'date':'Today'}
		}

		this.store.set({counts:data.counts},console.log('counts set to default...'));
	}

	var settings = data.settings,counts = data.counts;

	//color badge
	chrome.browserAction.setBadgeBackgroundColor({color:settings.badge.color});

	//fill badge 
    this.updateBadge(data);
}

/**
 * Update the badges content
 * @param  {Object} data stored information about counts and settings
 */
TabCounter.prototype.updateBadge = function(data) {

	var contents = this.lang.make(data);

	//check if it fits in the badge
	if(contents.small.length <= 4){
		chrome.browserAction.setBadgeText({text:contents.small});
	}
	else
	{
		//clear badge
		chrome.browserAction.setBadgeText({text:''});
	}

	chrome.browserAction.setTitle({title:'TabCounter: '+ contents.full + ' ' + contents.sentence})

	return contents;
}

/**
 * changes the color of the badge
 * @param  {[type]} that     [description]
 * @param  {[type]} newColor [description]
 * @return {[type]}          [description]
 */
TabCounter.prototype.changeBadgeColor = function(that,newColor) {
	chrome.browserAction.setBadgeBackgroundColor({color:newColor});

	that.store.get(['settings'],function(data){
		data.settings.badge.color  = newColor;
		that.store.set({settings:data.settings},console.log('color changed'));
	});
};

/**
 * Propperly adds one to each count and keeps reccord of highest tabcount
 *
 * Resets the count of today if the daye changed. This is checked by comparing 
 * dateStrings. Stores new reccords with a formated date. Keeps track of goal
 * completion
 * 
 * @param  {TabCounter} that an instance of Tabcounter
 */
TabCounter.prototype.tabOpened = function(that,tab){
	//START:workaround (http://code.google.com/p/chromium/issues/detail?id=173925)
		//chrome.tabs.onCreated.addListener fires twice
		//but tab.id is unique per tab
		if(TabCounter.tmpTab == tab.id){return;}
		TabCounter.tmpTab = tab.id
	//END: workaround
	
	that.store.get(['settings','counts'],
	    function(data){
	    	//check if the day changed
	    	//Compare DateStrings
	    	var now = new Date();
	    	if(now.toDateString() != data.settings.today){
	    		//other day
	    		data.counts.totToday = 0;
	  			data.settings.today = now.toDateString();
	  			that.store.set({settings:data.settings},console.log('date changed'));
	  		}

			data.counts.totToday++;
			data.counts.totReset++;
			data.counts.totInstall++;

	  		//check if new record
	  		if(data.counts.totToday > data.counts.record.value){
	  			data.counts.record.value = data.counts.totToday;
	  			data.counts.record.date = now.getDate()+" "+now.getMonthName()+" "+now.getFullYear();
	  		}

	  		if(data.counts[data.settings.goal.field]==data.settings.goal.value)
	  		{
  				webkitNotifications.createNotification(
				  '/img/completed_goal.png', 
				  'Goal reached!',
				  'You have opened '+data.settings.goal.value+' tabs!'
				).show();
	  		}

			that.store.set({counts:data.counts},function(){console.log('counts++');that.updateBadge(data);});
	    }
	);
}
TabCounter.tmpTab = 0;

/**
 * Reserts the count.totReset, called when reset btn is clicked
 */
TabCounter.prototype.reset = function(){
	that = this;
	that.store.get(['counts'],
	    function(data){
	    	data.counts.totReset = 0;
			that.store.set({counts:data.counts},function(){console.log('reset');that.updateBadge(data);});
	    	that.view();
	    }
	);
}

/**
 * Set data in the popup, must be fired after DOM is ready
 */
TabCounter.prototype.view = function() {
	var that = this;
	//get data
	this.store.get(['settings','counts'],
    function(data){
		TabCounter.$('totToday').innerHTML    = data.counts.totToday
		TabCounter.$('totReset').innerHTML    = data.counts.totReset
		TabCounter.$('totInstall').innerHTML  = data.counts.totInstall
		TabCounter.$('record').innerHTML      = data.counts.record.value
		TabCounter.$('recordDate').innerHTML  = data.counts.record.date
		
		//get header data
		var contents= that.lang.make(data);
		TabCounter.$('HeaderValue').innerHTML = contents.full;
		TabCounter.$('HeaderType').innerHTML  = contents.sentence;
		
		//set settings
		TabCounter.$("goalValue").value       =  data.settings.goal.value;
		TabCounter.$("goalField").value       =  data.settings.goal.field;
		TabCounter.$("badgeContent").value    = data.settings.badge.content;

    });

	//get windows
	chrome.windows.getAll({populate:true},function(windows){
		//get the windows
		nowWind=windows.length;

		//count tabs
		nowTabs=0;
		for(var i in windows){nowTabs += windows[i].tabs.length}


		TabCounter.$('nowTabs').innerHTML = nowTabs;
		TabCounter.$('nowWind').innerHTML = nowWind;
	});
};


//Create new instance of tabcounter (global)
tc = new TabCounter();

//Lisen to opeing tabs
chrome.tabs.onCreated.addListener(function(tab){tc.tabOpened(tc,tab);});



/*******************************************************************************
 * Changes to the Date object in order to display the date in a better way     *
 ******************************************************************************/


/**
 * Collection of month names
 * @type {Array}
 */
Date.prototype.monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun",
    "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec"
];

/**
 * Extend date objects to get the name of the current month
 * @return {[type]} [description]
 */
Date.prototype.getMonthName = function() {
    return this.monthNames[this.getMonth()];
};