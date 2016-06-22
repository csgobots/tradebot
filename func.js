function default_options(){
	var settings = {
		autoaccepttrade: true,
		tryingFailWithdraw: true,
		opskinsBtn: true,
		opskinsBtnTypeGet : "insert"
	};

	chrome.storage.local.set({'settings':settings},function(){});
}
function load_options(){
chrome.storage.local.get("settings",function(data){
	if(data)
	{
		settings = data.settings;
	}
	else{
		default_options();
		console.log("Troubles karl");
	}
	return settings;
});
}

function save_options(){

	var autoaccepttrade = $("#autoaccepttrade").is(":checked");
	var tryingFailWithdraw = $("#tryingFailWithdraw").is(":checked");
	var opskinsBtn = $("#opskinsBtn").is(":checked");
	var opskinsBtnTypeGet = $("#opskinsBtnTypeGet").val();
	var settings = {
		autoaccepttrade: autoaccepttrade,
		tryingFailWithdraw: tryingFailWithdraw,
		opskinsBtn: opskinsBtn,
		opskinsBtnTypeGet : opskinsBtnTypeGet
	};

	chrome.storage.local.set({'settings':settings},function(){});
}

