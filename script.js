$(document).ready(function(){
	refresh();
});


function refresh(){
	bg = chrome.extension.getBackgroundPage(); 
	bg.BadgeIt();
	bg = bg.localStorage;
	$(".tabcount.NowOpened").html(bg.NowOpenedTabs);

	$(".tabcount.BeforeOpened").html(parseInt(bg.BeforeOpenedTabs));	
	$(".tabcount.ResetSOpened").html(parseInt(bg.ResetSOpenedTabs));
	$(".tabcount.HeaderOpened").html(parseInt(eval("bg."+bg.ShowInBadgeValue)));
	$(".tabcount.HeaderOpened").html(parseInt(eval("bg."+bg.ShowInBadgeValue)));
	$(".tabcount.MaxOpened").html(parseInt(bg.MaxOpenedTabs));
	$("#MaxOpenedDate").html(bg.MaxOpenedDate);


	switch (bg.ShowInBadgeValue) {
		case "NowOpenedTabs": 		$("#header_tabcount_type").html("today"); $("#header_tab_info").html(" Tabs opened!");						break;
		case "ResetSOpenedTabs": 	$("#header_tabcount_type").html("since reset"); $("#header_tab_info").html(" Tabs opened!");			break;
		case "BeforeOpenedTabs": 	$("#header_tabcount_type").html("since install");$("#header_tab_info").html(" Tabs opened!"); 		break;
		case "TabsTillGoal": 			$("#header_tabcount_type").html(bg.PercTillGoal+"% Goal compleation");$("#header_tab_info").html(" Tabs left"); 		break;
		case "PercTillGoal": 			$("#header_tabcount_type").html(bg.TabsTillGoal+" tabs left to open");$("#header_tab_info").html("% Completed"); 		break;
		default: $("#header_tabcount_type").html(""); break;
	}

	$('#ShowInBadgeValueInput > option[value="'+bg.ShowInBadgeValue+'"]').attr("selected","selected");

	$('#GoalValueInput').val(bg.GoalValue);
	$('#GoalValueTypeInput > option[value="'+bg.GoalValueType+'"]').attr("selected","selected");
	//gain totaltabs: just info not required for further procces
	var totaltabs=0;
	chrome.windows.getAll(
	{"populate":true},
		function(wins){
			$.each(wins,function(index,value){
				totaltabs=parseInt(totaltabs)+(value.tabs.length);
					$(".tabcount.StillOpened").html(totaltabs);
					$(".tabcount.StillOpenedWindows").html(index+1);
			})
		}
	)


}

function reset(){
	bg = chrome.extension.getBackgroundPage();
	$("#reset_notice").html("Resetted! <a href='javascript:set(\"ResetSOpenedTabs\","+bg.localStorage.ResetSOpenedTabs+")' class=\"c3\" >Undo</a>").fadeIn().delay(5000).fadeOut('slow'); 
	bg.localStorage.ResetSOpenedTabs=0;
	bg.BadgeIt();
	refresh();
}


function set(name,value){
	bg = chrome.extension.getBackgroundPage();
	eval("bg.localStorage."+name+"='"+value+"';");
	bg.CalcInfo();
	bg.BadgeIt();
	refresh();
}

function ToggleVieuw(){
	if($('#shower').is(":visible")) {
		$("#toggle_btn").html("Back");
		$('#shower').slideUp('slow',function a(){$('#settings').slideDown();});
	}else{
		$("#toggle_btn").html("Settings");
		$('#settings').slideUp('slow',function a(){$('#shower').slideDown("slow");});
	}
}
