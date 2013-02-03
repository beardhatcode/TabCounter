function initVieuw() {

	tc.view();

	/**
	 * Bind goal values
	 */
	TabCounter.$("goalValue").addEventListener('keyup',
	function(e)
	{
		var newGoal = e.target.value;
			newParsed = parseInt(newGoal,10);

		if(newGoal != newParsed){
			return; // not valid
		}

		tc.store.get(['settings'],
	    function(data){
	    	data.settings.goal.value = newParsed;
	  		that.store.set({settings:data.settings},function(){});
	    });
	}
	);


	TabCounter.$("goalField").addEventListener('change',
	function(e)
	{

		var newGoalField = e.target.value;

		tc.store.get(['settings','counts'],
	    function(data){
	    	data.settings.goal.field = newGoalField;
	  		that.store.set({settings:data.settings},tc.updateBadge(data));
	    });
	}
	);


	TabCounter.$("badgeContent").addEventListener('change',
	function(e)
	{

		var newContent = e.target.value;

		tc.store.get(['settings','counts'],
	    function(data){
	    	data.settings.badge.content = newContent;
	  		that.store.set({settings:data.settings},tc.updateBadge(data));
	    });
	}
	);


	/**
	 * Color picker
	 */

	var	canvas =TabCounter.$("colorPicker"),
		ctx    =canvas.getContext("2d"),
		grd    =ctx.createLinearGradient(0,0,canvas.width,0);


	for(var i=0;i<=10;i++){
		grd.addColorStop(i/10,"hsl("+i*30+",100%,50%)");
	}



	//fill canvas with radient
	ctx.fillStyle=grd;
	ctx.fillRect(0,0,canvas.width,150);

	//onClick: store color as badge color
	canvas.addEventListener('click',
		function(e)
		{
			//get the pixel the user clicked on
			var imgData=ctx.getImageData(e.offsetX,e.offsetY,1,1);

			//data is an Uint8ClampedArray[4], convet to int[4]
			var badgeColor = [imgData.data[0],imgData.data[1],imgData.data[2],imgData.data[3]];
			tc.changeBadgeColor(tc,badgeColor);
		}
		);

		TabCounter.$("resetBtn").addEventListener('click',function(){
			tc.reset();
		});


}



document.addEventListener('DOMContentLoaded', initVieuw);




