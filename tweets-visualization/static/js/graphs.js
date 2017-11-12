var streamGraph = null;
var bubbleChart = null;
$(document).ready(function(){
	streamGraph = new StreamGraph();
	bubbleChart = new BubbleChart();
});

queue()
.defer(d3.json, "/data")
.defer(d3.json, "/countries")
.defer(d3.json, "/cities")
.await(makeGraphs);

var ecolor ="green";
var search_word = "";
var isRunning1 = true;


function makeGraphs(error, recordsJson, recordJsonCnt, recordJsonCt) {
	
	if(error) console.log(error);
	var records = recordsJson;
	var countries = recordJsonCnt;
	var cities = recordJsonCt;
	//var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
	records.forEach(function(d) {
		d["sentiment"]= +d["sentiment"];
		d["longitude"] = +d["longitude"];
		d["latitude"] = +d["latitude"];
	});
	
	

	var ndx = crossfilter(records);

	var locationChart = dc.rowChart("#location-row-chart");
	var allDim = ndx.dimension(function(d) {return d;});

	var emotionsChart = dc.rowChart("#emotions-row-chart");

	//Trop complexe à utiliser
	//var bubbleChart = dc.bubbleChart("#words-bubble-chart");

	var emotionsDim = ndx.dimension(function(d) { return d["sentiment"]; });
	var emotionsGroup = emotionsDim.group();
	//var numberRecordsND = dc.numberDisplay("#number-records-nd");

	var all = ndx.groupAll();
//Plot charts
/*
numberRecordsND
.width(100)
.height(140)
.formatNumber(d3.format("d"))
.valueAccessor(function(d){return d; })
.group(all);
*/

emotionsChart
.width(300)
.height(310)
.dimension(emotionsDim)
.group(emotionsGroup)
.ordering(function(d) { return -d.value })
.elasticX(true)
.labelOffsetX("Number of tweets")
.xAxis().ticks(4);


locationChart
.width(800)
.height(510)
.dimension(emotionsDim)
.group(emotionsGroup)
.ordering(function(d) { return -d.value })
.colors(['red', 'yellow','blue']) 
.elasticX(true)
.labelOffsetY(10)
.xAxis().ticks(4);


	var map	= L.map('map');
	var socket = io.connect('http://0.0.0.0:5000');
	var maps = [];
		

	//For TypeError: cyclic object value, use JSON.stringify(object,replacer)
	var seen = []; 
	var replacer = function(key, value) {
		if (value != null && typeof value == "object") {
			if (seen.indexOf(value) >= 0) {
				return;
			}
			seen.push(value);
		}
		return value;
	};

	var drawMaps = function(nbMaps,sCountries, sCities){
		var div =[];

		var selectMapsDiv = document.getElementById("map");
		selectMapsDiv.style="height:0px;width:0px;";


		for (var i = 1; i <= nbMaps; i++) {
			div[i] = document.createElement("div");
			div[i].id = "map_"+i;
			div[i].style = "height:300px; width:500px; display: inline-flex;position: relative; margin: 5px 8px 34px; left:3%;";
			document.getElementById("maps").appendChild(div[i]);

			maps[i] = L.map("map_"+i);
		//maps[i].setView([30.981702, -5.608481 ], 2);
		//console.log(sCities[i-1]+" in "+sCountries[i-1]);

		maps[i].setView([30.981702, -5.608481 ], 2);
		if(sCountries[i-1]!="" && sCities[i-1]==""){
			console.log(sCities[i-1]+" in "+sCountries[i-1]);

			for (c in countries) {
				if(countries[c].country == sCountries[i-1]){
					console.log(i+" "+sCountries[i-1] +" " +countries[c].country+" "+countries[c].longitude+" "+countries[c].latitude);
					maps[i].setView([countries[c].latitude, countries[c].longitude], 5);
				} 
			}
		}
		
			//maps[i].setView([30.981702, -5.608481 ], 2);
		mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
		L.tileLayer(
			'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
				attribution: '&copy; ' + mapLink + ' Contributors',
				maxZoom: 10				
			}).addTo(maps[i]);

	}

	}

	var drawMap = function(country, city){
		console.log("in draw map");
		var selectMapsDiv = document.getElementById("map");
		selectMapsDiv.style="width: 1200px; height: 600px;";
		
		
		if(country!="" && city==""){
			for (i in countries) {
				if(countries[i].country == country){
					console.log(country +" " +countries[i].country+" "+countries[i].longitude+" "+countries[i].latitude);
					map.setView([countries[i].latitude, countries[i].longitude], 5);
				} else {
					map.setView([30.981702, -5.608481 ], 2);
				}
			}
		} else if(city!=""){
			for (i in cities) {
				if(cities[i].city == city){
					console.log(city +" " +cities[i].city+" "+cities[i].lng+" "+cities[i].lat);
					map.setView([cities[i].lat, cities[i].lng], 9);
				}
				else {
					map.setView([30.981702, -5.608481 ], 2);
				}
			}
		}else{
			map.setView([30.981702, -5.608481 ], 2);
		}
		mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
		L.tileLayer(
			'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
				attribution: '&copy; ' + mapLink + ' Contributors',
				maxZoom: 10				
			}).addTo(map);

	}


			
	var drawPieCharts = function(){
		var rmax = 30;
		var coverages = new L.LayerGroup();
		map.on("zoomstart", function() {
			coverages.clearLayers();	
		
		});

		
			// Regroupe markers in pie-charts
			var markers = L.markerClusterGroup({
				showCoverageOnHover:false,

				maxClusterRadius: 2*rmax,

				iconCreateFunction: function(cluster){
					function drawPie(options) {
						if (!options.data || !options.valueFunc) {
							return '';
						}
						var data = options.data,
						valueFunc = options.valueFunc,
						r = options.outerRadius ? options.outerRadius : 28, 
						rInner = options.innerRadius ? options.innerRadius : r - 10, 
						strokeWidth = options.strokeWidth ? options.strokeWidth : 1, 
						pathClassFunc = options.pathClassFunc ? options.pathClassFunc : function () {
							return '';
						}, 
						pathTitleFunc = options.pathTitleFunc ? options.pathTitleFunc : function () {
							return '';
						}, 
						pieClass = options.pieClass ? options.pieClass : 'marker-cluster-pie', 
						pieLabel = options.pieLabel ? options.pieLabel : d3.sum(data, valueFunc),
						pieLabelClass = options.pieLabelClass ? options.pieLabelClass : 'marker-cluster-pie-label',

						origo = (r + strokeWidth), 
						w = origo * 2,
						h = w,
						donut = d3.layout.pie(),
						arc = d3.svg.arc().innerRadius(rInner).outerRadius(r);

														//Svg element
														var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
														//Pie chart
														var vis = d3.select(svg)
														.data([data])
														.attr('class', pieClass)
														.attr('width', w)
														.attr('height', h);

														var arcs = vis.selectAll('g.arc')
														.data(donut.value(valueFunc))
														.enter().append('svg:g')
														.attr('class', 'arc')
														.attr('transform', 'translate(' + origo + ',' + origo + ')');

														arcs.append('svg:path')
														.attr('class', pathClassFunc)
														.attr('stroke-width', strokeWidth)
														.attr('d', arc)
														.append('svg:title')
														.text(pathTitleFunc);

														vis.append('text')
														.attr('x', origo)
														.attr('y', origo)
														.attr('class', pieLabelClass)
														.attr('text-anchor', 'middle')
														.attr('dy', '.3em')
														.text(pieLabel);
														return serializeXmlNode(svg);
													}

													function serializeXmlNode(xmlNode) {
														if (typeof window.XMLSerializer != "undefined") {
															return (new window.XMLSerializer()).serializeToString(xmlNode);
														} else if (typeof xmlNode.xml != "undefined") {
															return xmlNode.xml;
														}
														return "";
													}

													var children = cluster.getAllChildMarkers();

													var n = children.length;
													var strokeWidth = 1;
													var r = 30 - 2 * strokeWidth - (n < 10 ? 12 : n < 100 ? 8 : n < 1000 ? 4 : 0); 
													var iconDim = (r + strokeWidth) * 2; 
													var data = d3.nest() 
													.key(function (d) {
														return d.options.alt;
													})
													.entries(children, d3.map);
													
													var clusters ={"nb":n, "max":[]};
													var html = drawPie({
														data : data,
														valueFunc : function (d) {
															return d.values.length;
														},
														strokeWidth : 1,
														outerRadius : r,
														innerRadius : r - 10,
														pieClass : 'cluster-pie',
														pieLabel : n,
														pieLabelClass : 'marker-cluster-pie-label',
														pathClassFunc : function (d) {
															return "category-" + d.data.key;
														},
														pathTitleFunc : function (d) {
															//console.log(n+" pathTitleFunc: "+d.data.values.length);
															var max = {
																"key": d.data.key,
																"length": d.data.values.length
															}
															clusters["max"].push(max);

															return d.data.key + ' (' + d.data.values.length + ' emotion' + (d.data.values.length != 1 ? 's' : '') + ')';
														}
													});		
													

													var res = Math.max.apply(Math,clusters.max.map(function(o){return o.length;}))
													var obj = clusters.max.find(function(o){ return o.length == res; })

													//console.log(JSON.stringify(clusters)+ " Max: length "+obj.length+" key "+obj.key );
													//var coverages = new L.LayerGroup();
																							
													
														if (cluster.getChildCount() > 2) {																															
															var color =  $(".category-"+obj.key).css("fill");
															coverages.eachLayer(function (layer) {
																//console.log("layer.options.className "+layer.options.className);
																if(cluster._leaflet_id==layer.options.className){
																	coverages.removeLayer(layer);

																}
															});
															coverages.addLayer(L.polygon(cluster.getConvexHull(), { weight: 1, color: color, opacity: 0.5, className:""+cluster._leaflet_id}));

														}
														coverages.addTo(map);

													
													/*
													markers.on("unspiderfied", function() {
													coverages.clearLayers();	
													});

													markers.fire("animationend");	
													*/
													//map.fire("zoomstart");	
												

													var myIcon = new L.DivIcon({
														html : html,
														className : 'marker-cluster',
														iconSize : new L.Point(iconDim, iconDim)
													});

													return myIcon;

												}
											});





	return markers;
	}


		var drawIcons = function(markers){

			var geoData = [];

			_.each(allDim.top(Infinity), function (d) {

				geoData.push([d["latitude"], d["longitude"]]);

				var myClass = 'marker category-'+d['sentiment']+' icon-'+d['sentiment'];
				var myClass2 = 'marker category-'+d['sentiment'];

				var myIcon;
				if( document.getElementById("emoticon-mode").checked){
					myIcon = L.divIcon({
						className: myClass,
						iconSize:null
					});	
				}else{
					myIcon = L.divIcon({
						className: myClass2,
						iconSize:null
					});	
				};

						
				if(search==""){
					var marker = L.marker(
						L.latLng(d["latitude"], d["longitude"]),
						{ icon:myIcon, 
							alt:d['sentiment'] }).bindPopup(d['text'],
							{ maxWidth: 500,
								fillColor: '#f03',
						maxHeight: 200});//.addTo(map);
							markers.addLayer(marker);

							var color =  $(".category-"+d['sentiment']).css("fill");							
							var ul = document.getElementById("ul-text-tweets");
							if(ul!=null){
							var li = document.createElement("li");
							li.innerHTML = d['text'];
							li.id = marker._leaflet_id;
							li.style ="background:"+color+"; opacity:.45; padding:10px; ";
							ul.appendChild(li);
							}
							
							//getLayer();
							

							$(".marker").delay("fast").fadeIn();
						} else if(d['text'].toLowerCase().indexOf(search_word) > -1 ){

							var marker = L.marker(
								L.latLng(d["latitude"], d["longitude"]),
								{ icon:myIcon, 
									alt:d['sentiment'] }).bindPopup(d['text'],
									{ maxWidth: 500,
										fillColor: '#f03',
						maxHeight: 200});//.addTo(map);
									markers.addLayer(marker);

									var color =  $(".category-"+d['sentiment']).css("fill");
									var ul = document.getElementById("ul-text-tweets");
									if(ul!=null){
									var li = document.createElement("li");
									li.innerHTML = d['text'];
									li.id = marker._leaflet_id;
									li.style ="background:"+color+"; opacity:.45; padding:10px; ";
									ul.appendChild(li);
									}

								}

					});
	/*
			 var list = document.getElementById("ul-text-tweets").getElementsByTagName('li');
	      						for(var i =0; i <list.length; i++){
	      							  list[i].addEventListener('click', clickLi, false);
	      							  console.log("test");

	      						}
	      						
	      						function clickLi() {
	      						        alert( this.id+ " "+ this.getLayer(this.id));

	      						 }*/
			//return markers;
		};

	//async function twitterApi(markers){
	var twitterApi = function(markers){
		//(function() {
		var geoData = [];
		var button = document.getElementById('toggle');
		var isRunning = true;
		button.addEventListener('click', function(e){
			if(isRunning) {
				button.src = '../static/imgs/play.png';
				button.alt = "Play";
				isRunning = false;
				socket.removeAllListeners("reponse");
			} else {
				button.src = '../static/imgs/pause.png';
				button.alt = "Pause";
				isRunning = true;
				socket.removeAllListeners("reponse");
				twitterApi(markers);
			}

		}, false);
		//socket = io.connect('http://0.0.0.0:5000');
		var idLi = 0;
		socket.emit('connect temps reel');
		socket.on('reponse', function(msg){
				
			var data = {"motsCles": [], "tweets":[]};
			console.log("Longueur tweets :"+msg.tweets.length);
			for(var i = 0; i<msg["tweets"].length; i++){

				var tweet = {
					"text":msg["tweets"][i][0],
					"latitude":msg["tweets"][i][1],
					"longitude":msg["tweets"][i][2],
					"temps":msg["tweets"][i][3].slice(0,-6)+"00"//,
					//"valeurEmotion":msg["tweets"][i][4],
					//"uri" : msg["tweets"][i][5]					

				};
				
				var randEmotion = Math.floor((Math.random() * 5) + 1);
				var myClass = 'marker category-'+randEmotion+' icon-'+randEmotion;
				var myClass2 = 'marker category-'+randEmotion;
				var myIcon;
				if( document.getElementById("emoticon-mode").checked){
					myIcon = L.divIcon({
						className: myClass,
						iconSize:null
					});	
				} 
				else {
					myIcon = L.divIcon({
						className: myClass2,
						iconSize:null
					});	
				}

				if(search_word ==""){
					
					var marker = L.marker(L.latLng(msg["tweets"][i][2], 
						msg["tweets"][i][1]),
						{ 
							icon:myIcon, 
					  		alt:randEmotion 
						})
						.bindPopup(tweet.text,
						{ 
							maxWidth: 500,
						  	fillColor: '#f03',
						  	maxHeight: 200
						}
					);
					markers.addLayer(marker);

					$(".marker").delay("fast").fadeIn();
					tweet['emotion'] = randEmotion;
					tweet['temps'] = tweet['temps'].slice(0,-5);	


					var ul = document.getElementById("ul-text-tweets");
					var color =  $(".category-"+randEmotion)
						.css("fill");
					$('.text-tweets').scrollTop($('.text-tweets')[0]
						.scrollHeight);
													
					if(ul!=null){
						var li = document.createElement("li");
						li.id = idLi;
						li.innerHTML = tweet.text;
						li.style ="background:"+color+
							"; opacity:.45; padding:10px; ";
						ul.appendChild(li);
						
						idLi++;
					}


				} 
				else  if(tweet.text.toLowerCase()
					.indexOf(search_word) > -1 ){
							

					var marker = L.marker(L.latLng(msg["tweets"][i][2], 
						msg["tweets"][i][1]),
						{ 
							icon:myIcon, 
							alt:randEmotion 
						})
						.bindPopup(tweet.text,
							{ 
								maxWidth: 500,
								fillColor: '#f03',
								maxHeight: 200
							}
						);
					markers.addLayer(marker);
					var color =  $(".category-"+randEmotion).css("fill");
					var ul = document.getElementById("ul-text-tweets");
					if(ul!=null){
						var li = document.createElement("li");
						li.innerHTML = tweet.text;
						li.style ="background:"+color+"; opacity:.45; padding:10px; ";
						ul.appendChild(li);
					}

				}
					
					
				data["tweets"].push(tweet);
			}


			for(var i = 0; i<msg["motsCles"].length; i++){
				var motCle = {
					"mot":msg["motsCles"][i][0],
					"nbTweet":msg["motsCles"][i][1]
				};
				data["motsCles"].push(motCle);
			}
			

			data4all.keywords = data["motsCles"];
			data4all.tweets = data4all.tweets.concat(data["tweets"]);
			
			bubbleChart.update();

			console.log(data);
		});		
	}		
									
	//plot static mode

	document.getElementById("pie-chart").onclick = function() {
		removeLayers();
		if(!pieChart){
			pieChart = true;
			//drawMap();

			removeChilds(document.getElementById("ul-text-tweets"));
			var markers = drawPieCharts();
			if(isRunning1){

				if(maps.length <= 1){
					drawMap();
					drawIcons(markers);
					map.addLayer(markers);
					map.fitBounds(markers.getBounds());

				}
				else{
					drawMaps();
					for(var i =1; i<maps.length; i++){
						//drawIcons(maps[i]);
						drawIcons(markers);
						maps[i].addLayer(markers);
						maps[i].fitBounds(markers.getBounds());

					}
				}

			}
			else{
				//document.getElementById('toggle').click();
				console.log('disconnect temps reel:');
				socket.emit("disconnect temps reel");
				socket.removeAllListeners("reponse");
				twitterApi(markers);
				
				map.addLayer(markers);
				map.fitBounds(markers.getBounds());
				
						
				/*
				if(maps.length <= 1){	
				twitterApi(markers);
				map.addLayer(markers);
				map.fitBounds(markers.getBounds());
				}else{
					for(var i =1; i<maps.length; i++){
						maps[i].addLayer(markers);
					}
				}
				*/
				
			}
		} 
		else{
			pieChart = false;
			//console.log("no pie-chart mode");
			//drawMap();
			removeChilds(document.getElementById("ul-text-tweets"));
			if(isRunning1){
				//drawIcons(map);
				if(maps.length <= 1){
					drawMap();
					drawIcons(map);
				}
				else{
					drawMaps();
					for(var i =1; i<maps.length; i++){
						drawIcons(maps[i]);
					}
				}
			} 
			else{
				//document.getElementById('toggle').click();
				//twitterApi(map);
				
				if(maps.length <= 1){
					drawMap();
					twitterApi(map);
				}else{
					drawMaps();
					for(var i =1; i<maps.length; i++){
						twitterApi(maps[i]);
					}
				}
					

			}
		}
	};


	var modeStream = function(){
		pieChart = false;
		removeChilds(document.getElementById("ul-text-tweets"));
		console.log("on mode stream"+maps.length);
		//drawMap();
		//twitterApi(map);

		if(maps.length <= 1){
			drawMap();
			twitterApi(map);
		}
		else{
			drawMaps();
			for(var i =1; i<maps.length; i++){
				twitterApi(maps[i]);
			}
		}

		/*
		if(maps.length <= 1){
		drawMap();
		twitterApi(map);
	}else{
		drawMaps();
		for(var i =1; i<=maps.length; i++){
		twitterApi(maps[i]);
	}} */

	};

	function removeLayers(){
		if(maps.length <= 1){
			map.eachLayer(function (layer) {
				map.removeLayer(layer)
			}); 
		}
		else{
			for(var i =1; i<maps.length; i++){
				maps[i].eachLayer(function (layer) {
					maps[i].removeLayer(layer)
				}); 
			
			}
		}
		
	}

	window.onhashchange = function() {
		removeLayers();
		if(isRunning1){
			modeStatic();
		}else{
			modeStream();
		}
	}

	document.getElementById("emoticon-mode").onchange = function() {
		removeLayers();
		if(isRunning1){
			modeStatic();
		}else{
			modeStream();
		}
	};

	document.getElementById("histogramme").onclick = function() {
		$("#dialog-histogramme").dialog(
			{ position: { my: "right top", at: "right center", of: window },
			title: "Histogramme"
		}).dialog("open");
	};




	document.getElementById("list-tweets").onclick = function() {
		$("#dialog-tweets").dialog(
			{ position: { my: "right top+100px", at: "right top", of: window },
			title: "List of tweets",
			width: "405"
		}).dialog("open");
		//var vCar = new VerticalCarousel($('.text-tweets ul'), 3000);

	};


	document.getElementById("bubble-chart").onclick = function() {
		$("#dialog-bubble-chart").dialog(
			{ width: "auto", position: { my: "left+40% bottom", at: "left bottom", of: window },
			title: "Bubble-chart"
		}).dialog("open");
	};


				//getData();

			//	})();
		//return markers;

	//plot static mode
	var pieChart = false;

	var modeStatic = function(){
		socket.on("streamgraph", function(msg){
			var msg2 = JSON.parse(msg["tweets"]);
			var tempsPrecedent = null;
			for (elt of msg2){
				tweet = {};
				tweet["temps"] = elt[0].slice(0,-4);
				tweet["emotion"] = elt[1];
				tweet["count"] = elt[2];
			
				if (tempsPrecedent!=null && 
					tempsPrecedent!=tweet["temps"]){
					var tp = d3.time.format("%a, %d %B %Y %H:%M:%S")
						.parse(tempsPrecedent);
					var tNew = d3.time.format("%a, %d %B %Y %H:%M:%S")
						.parse(tweet["temps"]);
/*
					var inter = d3.time.minute.range(tp,tNew,1);

					if(inter.length > 1){
						for (tempsInter of inter.slice(1,inter.length)){
							for (elt of ['0','1','2','3','4']){
								newTweet = {};
								newTweet["temps"] = d3.time
									.format("%a, %d %B %Y %H:%M:%S")
									(tempsInter);
								newTweet["emotion"] = elt;
								newTweet["count"] = '0';
								data4all.streamgraph.push(newTweet);
							}
						}
					}
*/
				}

				tempsPrecedent = tweet["temps"];
				data4all.streamgraph.push(tweet);
			}


			console.timeEnd("chargement data streamgraph");
			console.time("Update streamgraph");
			streamGraph.update();
			console.timeEnd("Update streamgraph");
		});
		console.time("chargement data streamgraph");
		socket.emit("streamgraph");

		pieChart = false;
		removeChilds(document.getElementById("ul-text-tweets"));
		
		//console.log(pieChart);
		if(maps.length <= 1){
			drawMap();
			drawIcons(map);
		}
		else{
			drawMaps();
			for(var i =1; i<maps.length; i++){
				drawIcons(maps[i]);			}
		}
	};

				/*
				var divTweets = [];
				var i = 0;
				//for (var i = 0; i<10; i++){
					divTweets[i] = document.createElement("div");
					divTweets[i].class = "tweet-text";

					document.getElementById("dialog-tweets").appendChild(divTweets[i]);
			
						divTweets[i].innerHTML += tweet.text +"\n";
						*/
			

	document.getElementById("stream-graph").onclick = function() {
		$("#dialog-stream-graph").dialog(
			{ width: "auto", position: 
			{ my: "left+40% bottom", at: "left bottom", 
			of: window },
			title: "Stream-graph"
		}).dialog("open");
	};


	document.getElementById('search').addEventListener('submit', function(e) {
		search_word =  document.getElementById('searchText').value;	
		e.preventDefault();
		console.log(search_word);
		removeLayers();
		if(isRunning1){
			modeStatic();		
		}else{
			modeStream();
		}
	}, false);


	var upload = false;
	function uploadFile(){
		$(':file').on('change', function () {
			upload= true;
		});
		upload= false;
	}
	uploadFile();

	document.getElementById("add-file").onclick = function() {
		$("#dialog-add-file").dialog(
		{ 
			resizable: false,
			height: "auto",
			modal: true,
			title: "Upload file",
			buttons: {
				Submit: function() {
					if(upload==true){
						$(this).dialog('close');
						$("#form-add-file").submit();
					}else{
						alert("Please select a file to upload!")
					}
				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			}

		}).dialog("open");

	};


	var nbMaps, iCity=[],iCountry =[], sCountry=[], sCity=[], hr=[];
	var btnNbMaps =  document.getElementById('updateNbMaps');
	btnNbMaps.onclick=function(event){
		//btnNbMaps.disabled = true;
		nbMaps =  document.getElementById('nb-maps').value;
		console.log("nbMaps" + nbMaps);
		var div = document.createElement("div");
		div.id = "selectMaps";
		document.getElementById("dialog-choose-map").appendChild(div);
		//div.innerHTML= "* optional field";
		for(var i=1; i<=nbMaps; i++){
			iCity[i] = document.createElement("select");
			iCountry[i] = document.createElement("select");
			sCountry[i] = document.createElement("p");
			sCity[i] = document.createElement("p");
			hr[i] = document.createElement("hr");
			sCountry[i].innerHTML = "<center><b>Map №"+i+"</b></center><br/>"+"Select Country:";
			sCity[i].innerHTML = "Select City:";
			iCountry[i].id = "country_"+i;
			iCity[i].id = "city_"+i;		    
			document.getElementById("selectMaps").appendChild(hr[i]);
			document.getElementById("selectMaps").appendChild(sCountry[i]);
			document.getElementById("selectMaps").appendChild(iCountry[i]);
			document.getElementById("selectMaps").appendChild(sCity[i]);
			document.getElementById("selectMaps").appendChild(iCity[i]);
			populateCountries("country_"+i, "city_"+i);

			event.preventDefault();


		}
	}

	function removeChilds(childOf){
		if(childOf!=null){
			while (childOf.firstChild) {
				childOf.removeChild(childOf.firstChild);
			}

		}
	}

	var chooseMap = document.getElementById("choose-map");
	chooseMap.onclick = function() {

		var selectMapsDiv = document.getElementById("selectMaps");
		removeChilds(selectMapsDiv);

		$("#dialog-choose-map").dialog(
		{ 
			resizable: false,
			height: "auto",
			modal: true,
			width: 400,
			title: "Choose location",	
			buttons: {
				Submit: function() {
					var country = [];
					var city = [];
					var sCountries =[], sCities =[]; 

					var nbMaps = document.getElementById('nb-maps').value;
					console.log(nbMaps + " nbMaps");
					var maps =  document.getElementById("maps");


					if(nbMaps==1){
						sCountries[0]=  document.getElementById('country_'+1).value;
						sCities[0] = document.getElementById('city_'+1).value;
						removeChilds(maps);

						drawMap(sCountries, sCities);

					}else if(nbMaps>1){ 
						for (var i = 1; i <= nbMaps; i++) {
							country[i]=  document.getElementById('country_'+i).value;
							city[i] = document.getElementById('city_'+i).value;
							console.log(nbMaps + " nbMaps" + country[i]+ " "+ city[i]);	
							sCities.push(city[i]);
							sCountries.push(country[i]);					
						}

						removeChilds(maps);

						drawMaps(nbMaps, sCountries, sCities);

						if(isRunning1){
							modeStatic();		
						}else{
							modeStream();
						}
					}
					$(this).dialog('close');

					$("#form-choose-map").submit();


				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			}

		}).dialog("open");

	};


		//Draw Map on static mode
	modeStatic();

	// modeStatic + BUTTON UPLOAD

	var button1 = document.getElementById('toggle1');

	button1.addEventListener('click', function(e){
		removeLayers();
		if(isRunning1) {
			isRunning1 = false;
			//document.getElementById('toggle').click();
			button1.text="Static mode";
			modeStream();

		} 
		else {
			isRunning1 = true;
			button1.text="Stream mode";
			socket.removeAllListeners("reponse");
			modeStatic();
			//document.getElementById('toggle').click();
			
		}
		
	}, false);


	//Update the map if any dc chart get filtered
	dcCharts = [emotionsChart, locationChart];

	_.each(dcCharts, function (dcChart) {
		dcChart.on("filtered", function (chart, filter) {
			removeLayers();
			modeStatic();
		});
	});

	dc.renderAll();

};

// Emotions and colors
var divs=[]; var ps=[]; var btns =[];
for(var i=0; i<6; i++){
	divs[i] = document.createElement("div");
	ps[i]= document.createElement("p");
	btns[i]= document.createElement("button");
	btns[i].className = "btn-ecolor";
	btns[i].id=i+"-ecolor"
	ps[i].id=i+"_e";
	divs[i].id = i;
	divs[i].className = "emotions";

	document.getElementById("filter").appendChild(divs[i]);
	document.getElementById(i).appendChild(btns[i]);
	document.getElementById(i).appendChild(ps[i]);
	document.getElementById(i+"-ecolor").style=" height: 16px;border-radius: 10px;"

}

document.getElementById(0+"_e").innerHTML="Happiness";
document.getElementById(1+"_e").innerHTML="Sadness";
document.getElementById(2+"_e").innerHTML="Surprise";
document.getElementById(3+"_e").innerHTML="Anger";
document.getElementById(4+"_e").innerHTML="Fear";
document.getElementById(5+"_e").innerHTML="Unknown";
//document.getElementById(5+"_e").innerHTML="Emoticons"

document.getElementById(0+"-ecolor").className="jscolor {valueElement:null,value:'4ECC29'}";
document.getElementById(1+"-ecolor").className="jscolor {valueElement:null,value:'66ccff'}";
document.getElementById(2+"-ecolor").className="jscolor {valueElement:null,value:'E7E81C'}";
document.getElementById(3+"-ecolor").className="jscolor {valueElement:null,value:'E81919',onFineChange:'update(this)'}";
document.getElementById(4+"-ecolor").className="jscolor {valueElement:null,value:'8A5ECC'}";
document.getElementById(5+"-ecolor").className="jscolor {valueElement:null,value:'CFC7DB'}";
//document.getElementById(5+"-ecolor").id="emoticons";

//Update color    
function update(jscolor) {
	var twColor = '#' + jscolor;
	ecolor = twColor;
	window.location.hash = ecolor;
};

