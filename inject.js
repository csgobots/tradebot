var dollar = 0;
var dollarIsRight = false;
var ruble = 0;
var myInterval;
var items=[];
var strNick = $("#navbar .dropdown b").html();
var steamid = $("#my64id .modal-body b").html();
var editingFavouriteItems = false;
var payed = false;
var errorMessage = "";
var shownFavourites = false;
var notyfName = "Trade bot";
var audio = new Audio();
var drawedFilter= false;
var endpurchase;
var pressedWithdraw = false;
var urlgetfavour = "http://akgames.ru/csgodouble_get_favourite.php";
var urladdgavour = "http://akgames.ru/csgodouble_add_favourite.php";
var urldofilter = "http://akgames.ru/csgodouble_filter.php";
var filterCoinsStart = 0;
var filterCoinsEnd = 0;


var settings = null;
chrome.storage.local.get("settings",function(data){
	if(data)
	{
		settings = data.settings;
		console.log(settings);
	}
	else{
		default_options();
		console.log("Troubles karl");
	}
});

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = a.getMonth()+1;//months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + '.' + month + '.' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}
function canOffer()
{
	return $("#right>.reals").children().is(".placeholder");
}
function requestItems()
{
	if(pressedWithdraw) return;
	pressedWithdraw = true;

	if(canOffer())
	{
		$("#offerButton").click();
		myInterval = setInterval(function(){
			if($("#inlineAlert").hasClass("alert-danger")||$("#inlineAlert").html().indexOf("Loaded")!=-1)
			{
				if($("#inlineAlert").html().indexOf("Items no longer available")==-1)
				{
					$("#offerButton").click();
				}
				else{

					if($("#right .reals").children(".placeholder").length>0 && payed && settings.tryingFailWithdraw)
					{
						var regex = /the page and try again\. \(([0-9]{1,2})\/([0-9]{1,2})\)/g;
						var itemsCount = regex.exec($("#inlineAlert").html());
						
						var botItemsCount = parseInt(itemsCount[1]);
						var myItemsCount = parseInt(itemsCount[2]);
						console.log(itemsCount);

						if(botItemsCount==0)
						{
							audio.src = chrome.extension.getURL('fu.mp3');
							audio.play();

							pressedWithdraw = false;
							clearInterval(myInterval);
							return;
						}
						else
						{
							for(var i=0;i<myItemsCount-botItemsCount;i++)
							$("#right .reals").children(".placeholder:last-child").children(".slot").click();
							pressedWithdraw = false;
							clearInterval(myInterval);
							requestItems();
						}
					}
					else
					{
						pressedWithdraw = false;
						audio.src = chrome.extension.getURL('fu.mp3');
						audio.play();
						clearInterval(myInterval);
					}

				}
			}
			else if($("#inlineAlert").hasClass("alert-success")){
				clearInterval(myInterval);
				checkStatus();
			}
		},1000);
	}
	else{
		alert(chrome.i18n.getMessage("errorSelectItems"));
	}
}
function stopRequestItems(){
	clearInterval(myInterval);
	pressedWithdraw=false;
}

function checkStatus(){
	myInterval = setInterval(function(){
		var strForGet = $("#inlineAlert").html();
		if(!$("#inlineAlert").hasClass("alert-warning")||$("#inlineAlert").hasClass("#alert-success"))
		{
			if(strForGet.indexOf("success")!=-1)
			{
				
				$("#right").find(".slot").attr("data-name",function(indexItem,itemName){
						items.push(itemName);
				});
				pressedWithdraw = false;
				clearInterval(myInterval);
				
				
				var tradelink = $("#offerContent a").attr("href");
				window.open(tradelink,"_blank");

				audio.src = chrome.extension.getURL('pow.mp3');
				audio.play();
			}
			else{
				$("#confirmButton").click();
			}
		}
	},1000);
}

function showFavouritesItems()
{
	if(shownFavourites)
	{
		$("#left .reals .placeholder").css({"display":"inline-block"});
		shownFavourites=false;
	}
	else{
		$("#left .reals .slot").attr("data-name",function(indexItem,itemName){

			if($.inArray(itemName,items)==-1){
				// $(this).click();
				$(this).parent().css({"display":"none"});
			}
			else{
			}
		});
		$("#left .bricks .placeholder").remove();
		shownFavourites=true;
	}
	
	$("#pluginRequestItems").removeClass("disabled");
}
function drawPriceDollar(){
	$("#left").find(".slot").attr("data-price",function(indexItem,itemPrice){
		$(this).children(".ball-0").remove();
		var price = (itemPrice/(2529/dollar)).toFixed(2);
		var priceDiv = '<div class="price ball-0" style="margin-top: 20px;">$'+price+'</div>';
		$(this).append(priceDiv);
		
	});
	
}
function drawPriceRubles(){
	$("#left").find(".slot").attr("data-price",function(indexItem,itemPrice){
		$(this).children(".ball-0").remove();
		var price = (itemPrice/(2529/ruble)).toFixed(0);
		var priceDiv = '<div class="price ball-0" style="margin-top: 20px;">'+price+'р.</div>';
		$(this).append(priceDiv);
	});
}
function drawEditFavourite(){
	$("#left .reals .placeholder").prepend('<div class="btnEditFavourite" style="transition: background 0.5s;cursor:pointer; position: absolute;color:#fff;width:26px;height:18px; background:#3FA53F;margin-top:20px;font-size:10pt;border-radius:0 3px 3px 0;z-index:1">add</div>');
	$(".btnEditFavourite").on("click", DoFavourite);
	markFavouritedItems();
}

function getPrices(){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) 
		{
		  if (xhr.responseText) 
		  {
		    var xmlDoc = xhr.responseText;
		    var regex = /<div class='item-amount'>\$([0-9\.]*)<\/div>/g;

		    dollar = regex.exec(xmlDoc);
		    if(dollar!=null)
		    {
		    	dollar = dollar[1];
			   	dollarIsRight = true;
		    }
		    else{
		    	dollarIsRight = false;
		    }
		  } 
		}
	}
	xhr.open("GET", "https://opskins.com/?loc=shop_search&app=730_2&search_item=%22Chroma+2+Case+Key%22&min=&max=&sort=lh&stat=&grade=&exterior=&type=", true);
	xhr.send(null);

	xhr1 = new XMLHttpRequest();
	xhr1.onreadystatechange = function() {
		if (xhr1.readyState == 4) 
		{
		  if (xhr1.responseText) 
		  {
		    var xmlDoc1 = xhr1.responseText;
		    var regex1 = /<p class="ip-text">Лучшее ([0-9\.]*)<small>/g;
		    ruble = regex1.exec(xmlDoc1)[1];
		  } 
		}
	}
	xhr1.open("GET", "https://csgo.tm/item/927007517-143865972-Chroma+2+Case+Key/", true);
	xhr1.send(null);
}
function getFavourite(){
	action = "getFavouriteList";
	$.ajax({
		url: urlgetfavour,
		method: "POST",
		dataType: "JSON",
		data:{
			action: action,
			steamid: steamid
		}}).done(function(data){
			// console.log(data);
			if(data.success)
			{
				console.log(data);
				items=data.items;
				markFavouritedItems();
				payed = true;
				endpurchase = timeConverter(data.endpurchase);
				drawFilter();
				filterCoinsStart = data.filterCoinsStart;
				filterCoinsEnd = data.filterCoinsEnd;
				$("#tbpurchase").html("TradeBot purchased<br>"+endpurchase);

			}
			else{
				payed = false;
				errorMessage = data.items;
			}
			// console.log(items);

		})
		.fail(function(data){
		})
		.always(function(){
		});
	
}
function markFavouritedItems(){
	$("#left .reals .placeholder").attr("data-name",function(itemNum,itemName){
		if($.inArray(itemName,items)!=-1){
			$(this).children(".btnEditFavourite").addClass("added");
			$(this).children(".btnEditFavourite").html("rem");
		}
		else{
			if($(this).children(".btnEditFavourite").hasClass("added")){
				$(this).children(".btnEditFavourite").removeClass("added");
				$(this).children(".btnEditFavourite").html("add");
			}
		}
	});

}
function DoFavourite(){
	var action = "add";
	
	if($(this).hasClass("added")){
		action = "remove";
	}
	
	$.ajax({
		url: urladdgavour,
		method: "POST",
		dataType: "JSON",
		data:{
			action: action,
			nickname: strNick,
			itemname: $(this).parent().attr("data-name"),
			steamid: steamid
		}})
		.done(function(data){
			if(data.success)
			{
				getFavourite();
				if($(this).hasClass("added")){
					action = "remove";
					$(this).removeClass("added");
					$(this).html("add")
				}
				else{
					$(this).addClass("added");
					$(this).html("rem");
				}
			}
			else{
				alert(data.item);
			}
			

			// markFavouritedItems();
		})
		.fail(function(data){
					})
		.always(function(){
					});
	
}
function acceptSteamTrade(){
	
	if($("div").is("#you_notready"))
	{
		if(!$("#their_slot_0").hasClass("has_item")||$("#your_slot_0").hasClass("has_item"))
		{
			console.log("Не выводит");
			return;
		}

		var steamInterval = setInterval(function(){
			if(!settings.autoaccepttrade)
			{
				clearInterval(steamInterval);
				return;
			}
			if($("#you_notready").attr("style")!="display: none;")
			{
				$("#you_notready").click();
				$(".newmodal_buttons > .btn_green_white_innerfade").click();
			}
			else{
				$("#trade_confirmbtn").click();
			}			
		},2000);

	}
	else if($("div").is(".received_items_header"))
	{
		
		if($(".received_items_header").html().indexOf("Обмен завершен")!=-1){
		
			window.close();
		}
	}
	
}



function pressOP(){
	var itemName = $(this).parent().attr("data-name");
	if(settings.opskinsBtnTypeGet=="window")
	{
		window.open("https://opskins.com/?loc=shop_search&app=730_2&search_item="+itemName+"&min=&max=&sort=lh&stat=&grade=&exterior=&type=");
	}
	else{
		$(this).html("");
		getItemPriceByOp($(this),itemName);
	}
}
function getItemPriceByOp(div, itemName)
{
	$.ajax({
		url: "https://opskins.com/?loc=shop_search&sort=lh&app=730_2&search_item="+itemName,
		method: "get",
		dataType: "html",
		success: function(data){
			var regex = /<div class='item-amount'>\$([0-9\.]*)<\/div>/g;
		    var itemPrice = regex.exec(data);
		    if(itemPrice!="")
		    {
		    	itemPrice = itemPrice[1];
			    div.html("$"+itemPrice);
			    div.on("click",function(){
			    	window.open("https://opskins.com/?loc=shop_search&app=730_2&search_item="+itemName+"&min=&max=&sort=lh&stat=&grade=&exterior=&type=");
			    });
		    }
		    else{
		    	window.open("https://opskins.com/?loc=shop_search&app=730_2&search_item="+itemName+"&min=&max=&sort=lh&stat=&grade=&exterior=&type=");
		    }
		    
		}
	})
}
function resetFilter(){
	$("#filterCoinsFrom").val("");
	$("#filterCoinsTo").val("");
	$("#left>.reals>.placeholder").css({"display":"inline-block"});

	$.ajax({
		url: urldofilter,
		method: "POST",
		dataType: "JSON",
		data:{
			action: "resetFilter",
			steamid: steamid
		}
	})
	.done(function(data){
		
	})
	
}
function filterByCoins(){
	console.log("Filter");
	filterCoinsStart = parseInt($("#filterCoinsFrom").val());
	filterCoinsEnd = parseInt($("#filterCoinsTo").val());
	$("#left>.bricks").remove();
	$("#left>.reals>.placeholder").attr("data-price",function(itemIndex,itemPrice){
		if(itemPrice<filterCoinsStart||itemPrice>filterCoinsEnd)
		{
			$(this).css({"display":"none"});
		}
		else{
			$(this).css({"display":"inline-block"});
		}
	});

	$.ajax({
		url: urldofilter,
		method: "POST",
		dataType: "JSON",
		data:{
			action: "setCoinsRange",
			steamid: steamid,
			coinsStart: filterCoinsStart, 
			coinsEnd: filterCoinsEnd
		}
	})
	.done(function(data){
		
	})
}
function drawFilter(){
	if(drawedFilter) return;
	drawedFilter = true;
	$("#botFilter").before("<div class='input-group col-md-5' id='pluginFilter'></div>");
	$("#pluginFilter").append('<input type="number" class="form-control" min=0 step=1 id="filterCoinsFrom" placeholder="from (coins)">');
	$("#pluginFilter").append('<input type="number" class="form-control" min=0 step=1 id="filterCoinsTo" placeholder="to (coins)">');
	$("#pluginFilter").append('<span class="input-group-btn"><button class="btn btn-default" id="filterBtn" type="button" style="height:68px;">Go!</button></span>');
	$("#pluginFilter").append('<span class="input-group-btn"><button class="btn btn-default" id="filterReset" type="button" style="height:68px;">Reset</button></span>');
	// $("#pluginFilterKey").append('<span class="input-group-btn"><button class="btn btn-default" id="filterReset" type="button" style="height:68px;">Не показывать ключи</button></span>');
	$("#filterBtn").on("click",filterByCoins);
	$("#filterReset").on("click",resetFilter);
}


acceptSteamTrade();
getFavourite();
getPrices();

$("#botFilter").before("<div class='btn_group' id='pluginButtons'></div>");
$("#pluginButtons").prepend('<label class="btn btn-warning" id="pluginDrawEditFavourite" >'+chrome.i18n.getMessage("btnEditFavouritesTxt")+'</label><br><br>');
$("#pluginButtons").prepend('<label class="btn btn-success" id="pluginSelectFavourite" >'+chrome.i18n.getMessage("btnShowFavouritesTxt")+'</label>');
$("#pluginButtons").prepend('<label class="btn btn-success" id="pluginDrawPriceDollar" >'+chrome.i18n.getMessage("btnCountDollarTxt")+' $</label>');
$("#pluginButtons").prepend('<label class="btn btn-success" id="pluginDrawPriceRubles" >'+chrome.i18n.getMessage("btnCountRubTxt")+'</label>');

$("#pluginDrawPriceDollar").click(function(){

	if(dollarIsRight==0)
	{
		alert(chrome.i18n.getMessage("errorOpskinsAntiBot"));
		window.open("https://opskins.com/?loc=shop_search&app=730_2&search_item=%22Chroma+2+Case+Key%22&min=&max=&sort=lh&stat=&grade=&exterior=&type=");
	}
	drawPriceDollar();
});



//Вставка кнопок на сайт
$(".fw-4 > .panel-body").prepend('<button class="btn btn-warning btn-lg" style="width:50%" id="pluginStopRequestItems">'+chrome.i18n.getMessage("btnEndBotTxt")+'</button>');
$(".fw-4 > .panel-body").prepend('<button class="btn btn-success btn-lg" style="width:50%" id="pluginRequestItems">'+chrome.i18n.getMessage("btnStartBotTxt")+'</button>');



$("#pluginSelectFavourite").on("click",showFavouritesItems);
$("#pluginRequestItems").on("click",requestItems);
$("#pluginStopRequestItems").on("click",stopRequestItems);
$("#pluginDrawPriceRubles").on("click",drawPriceRubles);
$("#pluginDrawEditFavourite").on("click",function(){
	if(!editingFavouriteItems)
	{
		if(payed)
		{
			drawEditFavourite();
			editingFavouriteItems=true;
		}
		else{
			alert(errorMessage);
		}
		
	}
	else{
		$(".btnEditFavourite").remove();
		editingFavouriteItems=false;
	}
	
});
	
$("body").prepend("<style>.added{background:#E64141!important;}#pluginFilter{margin-bottom:10px;}.btnOpskins{transition: width 0.5s;cursor:pointer; position: absolute;box-shadow: 0 0 4px #0e0;color:#fff;height:18px; background:#3FA53F;margin-top:92px;font-size:10pt;border-radius:0 3px 3px 0;z-index:1}</style>");
$("body").prepend("<div id='tbpurchase'style='position:fixed;top:100%;margin-top:-50px;height:50px;left:0;border-radius:0px 4px 0px 0px;padding:5px;color:#000;z-index:99999;background:RGBA(255,255,255,0.9)'>TradeBot:<br>Free Version<div>");


var opTimer = setInterval(function(){
	if($("#left .reals div").is(".placeholder")){
		if(settings.opskinsBtn && payed)
		{
			$("#left .reals .placeholder").prepend('<div class="btnOpskins">OP</div>')
			$(".btnOpskins").on("click",pressOP);
		}
		if(filterCoinsStart!=null&&filterCoinsEnd!=null&&payed)
		{
			$("#filterCoinsFrom").val(filterCoinsStart);
			$("#filterCoinsTo").val(filterCoinsEnd);
			filterByCoins();
		}
		clearInterval(opTimer);
	}
},2000)
