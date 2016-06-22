
$("input[type='checkbox']").change(function(){
	save_options();
});
$("select").change(function(){
	save_options();
});
var settings=null;
chrome.storage.local.get("settings",function(data){
	if(data)
	{
		settings = data.settings;
	}
	else{
		default_options();
		console.log("Troubles karl");
	}
});
var settingsInterval = setInterval(function(){
	if(settings==null)
	{
		return;
	}
	clearInterval(settingsInterval);

	console.log(settings);

	$("#autoaccepttrade").prop("checked",settings.autoaccepttrade);
	$("#tryingFailWithdraw").prop("checked",settings.tryingFailWithdraw);
	$("#opskinsBtn").prop("checked",settings.opskinsBtn);
},10)
// console.log(settings.autoaccepttrade);
