function StreamGraph() {
	console.time("Creation streamgraph");
	this.svg = d3.select("#stream-graph-chart")
		.append("svg")
		.attr("transform", "translate(0,0)");

	this.width = 1000;

	this.gMain = this.svg
		.append("g")
		.attr("transform", "translate(0,0)");

	this.hauteurAxe = 20;

	this.heightMain = 150;
	this.heightMini = 50;

	this.gMini = this.svg
		.append("g")
		.attr("transform", "translate(0,"+
			parseInt(this.heightMain+this.hauteurAxe)+")");


	$("#stream-graph-chart").width(this.width);
	$("#stream-graph-chart").height(this.heightMain+
		this.heightMini+this.hauteurAxe*2);
	this.svg.attr("width", this.width)
		.attr("height", this.heightMini+this.heightMain+this.hauteurAxe*2);
	this.gMain.attr("width",this.width)
		.attr("height", this.heightMain+this.hauteurAxe);
	this.gMini.attr("width",this.width)
		.attr("height", this.heightMini+this.heightMain+2*this.hauteurAxe);

	this.stack = d3.layout.stack()
    	.offset("wiggle")
    	.values(function(d) { return d.values; })
    	.x(function(d) { return d3.time.format("%a, %d %B %Y %H:%M:%S").parse(d.temps); })
    	.y(function(d) { return parseInt(d.count); });

	this.nest = d3.nest()
    	.key(function(d) { return d.emotion; });
    	//.key(function(d) { return d.temps; })
    	//.rollup(function(v) { return v.length; });

    var colorrange = ["#8A5ECC", "#E81919", "#E7E81C", "#66ccff", "#4ECC29"];

	var z = d3.scale.ordinal()
    	.range(colorrange);

    this.axeRight = this.gMain.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate("+(this.width-39)+", 0)");

	this.axeLeft = this.gMain.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(39, 0)");

	this.axeBottomMain = this.gMain.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(40,"+(this.heightMain+1)+")");

	this.axeBottomMini = this.gMini.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(40,"+(this.heightMini+1)+")");

	this.func = function(callback){ 
		return function(d){
			return callback(d.values);
		};
	}


	this.resizeMain = function(){

		var x = d3.time.scale().range([0,this.width-80])
			.domain(d3.extent(this.data, function(d){
				return d3.time.format("%a, %d %B %Y %H:%M:%S").parse(d.temps);
			}));

		var dateDeb = x.invert(this.rect0.attr("x")-40).getTime();

		var dateFin = x.invert(this.rect1.attr("x")-40).getTime();

		this.subData = this.data.filter(function(obj){
			var dt = d3.time.format("%a, %d %B %Y %H:%M:%S").parse(obj.temps).getTime();

			return dateDeb <= dt && dt <= dateFin;
		});

		this.nestDataSub = this.nest.entries(this.subData);

		if(this.nestDataSub.length>0){
    		this.stackDataSub = this.stack(this.nestDataSub);
    	}
    	else {
    		this.stackDataSub = [];
    	}

    	if(this.stackDataSub.length>0 && this.stackDataSub[0].values.length > 1){
    		var xSub = d3.time.scale().range([0,this.width-80])
			.domain(d3.extent(this.subData, function(d){
				return d3.time.format("%a, %d %B %Y %H:%M:%S").parse(d.temps);
			}));
    	}
    	else {
    		var dd = new Date(Date.now());
    		dd.setSeconds(0);
    		var df = d3.time.minute.offset(dd,1);
    		var xSub = d3.time.scale().range([0,this.width-80])
			.domain([dd,df]);
		}

		var min = 100000;
		var max = 0;

		for (v in this.stackDataSub){
			//console.log(this.stackData[v]);
			var min2 = d3.min(this.stackDataSub[v]['values'], function(d){return d.y0;});
			var max2 = d3.max(this.stackDataSub[v]['values'], function(d){return d.y0+d.y;});
			min = Math.min(min, min2);
			max = Math.max(max,max2);
		}

		var yMain = d3.scale.linear().range([this.heightMain,0])
		.domain([min,max]);

		this.areaMain = d3.svg.area()
    		.interpolate("cardinal")
    		.x(function(d) { return 40+xSub(d3.time.format(
    			"%a, %d %B %Y %H:%M:%S").parse(d.temps)); })
    		.y0(function(d) { return yMain(d.y0); })
    		.y1(function(d) { return yMain(d.y0 + d.y); });

    	this.xAxis = d3.svg.axis()
			.scale(xSub)
			.orient("bottom");
			//.ticks(d3.time.minute);

		this.yAxis = d3.svg.axis()
			.scale(yMain);

		this.yAxisr = d3.svg.axis()
			.scale(yMain);

		this.axeLeft.call(this.yAxisr.orient("left"));
		this.axeRight.call(this.yAxisr.orient("right"));
		this.axeBottomMain.call(this.xAxis);

		var layersMain = this.gMain.selectAll(".layer").data(this.stackDataSub);

		if (this.stackDataSub.length > 0){

			layersMain.exit().remove();

			layersMain.enter().append("path")
    			.attr("class", "layer")
      			.attr("d", this.func(this.areaMain) )
      			.style("fill", function(d, i) { return z(i); });


			layersMain.transition()
				.attr("d", this.func(this.areaMain))
      			.style("fill", function(d, i) { return z(i); });

		}
		else {
			layersMain.exit().remove();

			layersMain.transition()
				.attr("d", "");
		}
	};

	this.update = function(){
		this.data = data4all.streamgraph;
		this.nestData = this.nest.entries(this.data);

		if(this.nestData.length>0){
    		this.stackData = this.stack(this.nestData);
    	}
    	else {
    		this.stackData = [];
    	}
    	if(this.stackData.length>0 && this.stackData[0].values.length > 1){
    		var x = d3.time.scale().range([0,this.width-80])
			.domain(d3.extent(this.data, function(d){
				return d3.time.format("%a, %d %B %Y %H:%M:%S").parse(d.temps);
			}));
			var iso = d3.time.format("%Y-%m-%d %H:%M");
    	}
    	else {
    		var dd = new Date(Date.now());
    		dd.setSeconds(0);
    		var df = d3.time.minute.offset(dd,1);
    		var x = d3.time.scale().range([0,this.width-80])
			.domain([dd,df]);
		}

		var min = 100000;
		var max = 0;

		for (v in this.stackData){
			//console.log(this.stackData[v]);
			var min2 = d3.min(this.stackData[v]['values'], function(d){return d.y0;});
			var max2 = d3.max(this.stackData[v]['values'], function(d){return d.y0+d.y;});
			min = Math.min(min, min2);
			max = Math.max(max,max2);
		}

		var yMain = d3.scale.linear().range([this.heightMain,0])
		.domain([min,max]);
		var yMini = d3.scale.linear().range([this.heightMini,0])
		.domain([min,max]);

		this.areaMain = d3.svg.area()
    		.interpolate("cardinal")
    		.x(function(d) { return 40+x(d3.time.format(
    			"%a, %d %B %Y %H:%M:%S").parse(d.temps)); })
    		.y0(function(d) { return yMain(d.y0); })
    		.y1(function(d) { return yMain(d.y0 + d.y); });


		this.areaMini = d3.svg.area()
    		.interpolate("cardinal")
    		.x(function(d) { return 40+x(d3.time.format(
    			"%a, %d %B %Y %H:%M:%S").parse(d.temps)); })
    		.y0(function(d) { return yMini(d.y0); })
    		.y1(function(d) { return yMini(d.y0 + d.y); });

    	this.xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");
			//.ticks(d3.time.minute);

		this.yAxis = d3.svg.axis()
			.scale(yMain);

		this.yAxisr = d3.svg.axis()
			.scale(yMain);

		this.axeLeft.call(this.yAxisr.orient("left"));
		this.axeRight.call(this.yAxisr.orient("right"));
		this.axeBottomMain.call(this.xAxis);
		this.axeBottomMini.call(this.xAxis);

		var layersMain = this.gMain.selectAll(".layer").data(this.stackData);

		if (this.stackData.length > 0){

			layersMain.exit().remove();

			layersMain.enter().append("path")
    			.attr("class", "layer")
      			.attr("d", this.func(this.areaMain) )
      			.style("fill", function(d, i) { return z(i); });


			layersMain.transition()
				.attr("d", this.func(this.areaMain))
      			.style("fill", function(d, i) { return z(i); });

		}
		else {
			layersMain.exit().remove();

			layersMain.transition()
				.attr("d", "");
		}

		var layersMini = this.gMini.selectAll(".layer").data(this.stackData);

		if (this.stackData.length > 0){

			layersMini.exit().remove();

			layersMini.enter().append("path")
    			.attr("class", "layer")
      			.attr("d", this.func(this.areaMini) )
      			.style("fill", function(d, i) { return z(i); });


			layersMini.transition()
				.attr("d", this.func(this.areaMini))
      			.style("fill", function(d, i) { return z(i); });

		}
		else {
			layersMini.exit().remove();

			layersMini.transition()
				.attr("d", "");
		}
		this.rect0 = this.gMini.append("rect")
			.attr("x",40)
			.attr("y",0)
			.attr("width",4)
			.attr("height",this.heightMini)
			.style({
				"fill": "grey"
			});

		this.dragMove1 = function(){
			var dateMax = d3.time.minute.offset(
				x.invert(this.rect1.attr("x")-40),-1);
			var target = x.invert(Math.max(0,
				d3.event.x -40));
			var formerPos = this.rect0.attr("x");
			if(dateMax.getTime() < target.getTime()){
				target = dateMax;
			}
			else {
				target.setSeconds(0);
				target.setMilliseconds(0);
			}
			this.rect0.attr("x",40 + x(target));
			if (formerPos != (x(target)+40)){
				this.resizeMain();
			}
		};

		this.func2 = function(callback,target){
			return function(){
				return callback.call(target);
			};
		}

		this.rect0.call(d3.behavior.drag()
			.on("drag", this.func2(this.dragMove1,this))
			.on("dragend", function(){})
		);

		this.rect1 = this.gMini.append("rect")
			.attr("x",40+x.range()[1])
			.attr("y",0)
			.attr("width",4)
			.attr("height",this.heightMini)
			.style({
				"fill": "grey"
			});
		this.dragMove2 = function(){
			var dateMin = d3.time.minute.offset(
				x.invert(this.rect0.attr("x")-40),1);
			var target = x.invert(Math.min(d3.event.x -40,
				x.range()[1]));
			var formerPos = this.rect1.attr("x");
			if(dateMin.getTime() > target.getTime()){
				target = dateMin;
			}
			else {
				target.setSeconds(0);
				target.setMilliseconds(0);
			}
			this.rect1.attr("x",40 + x(target));
			if (formerPos != (x(target)+40)){
				this.resizeMain();
			}
		};
		this.rect1.call(d3.behavior.drag()
			.on("drag", this.func2(this.dragMove2,this))
			.on("dragend", function(){})
		);
	};
	console.timeEnd("Creation streamgraph");
}