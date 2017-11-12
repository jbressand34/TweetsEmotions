function BubbleChart() {
	console.time("creation bubblechart");

	/*
		Premiere partie on s'occupe d'afficher les keywords 
		dans des bulles 
		*/

	//variable permettant de choisir une couleur aléatoirement
	this.color = d3.scale.category20b();

	//fonction permettant de recupérer le nbTweet associé a un keyword
	this.nbTweet = function(d){ return d.nbTweet; };

	//les keywords qui sont affichés dans les bulles
	this.data = []; 

	// Largeur et hauteur minimale du bubble cloud
	this.minLongueur = 200;

	//Largeur et hauteur maximale du bubble cloud
	this.maxLongueur = 400;

	//ratio rayon plus grande bulle / plus petite bulle
	this.ratioRayon = 1/3;

	//Correspondance entre le rayon des bulles et nbKeywords
	this.r = d3.scale.linear()
		.domain([0,0])
		.range([(1/3)*100,100]);

	//correspondance entre la longueur du bubble cloud et 
	//le nombre de keywords

	this.longueur =  d3.scale.linear()
	.domain([0,10])
	.range([this.minLongueur,this.maxLongueur]);

	this.func = function(callback){ 
		return function(d){
			return callback(d.nbTweet);
		};
	}

	//https://github.com/d3/d3-3.x-api-reference/blob/master/
	//Pack-Layout.md
	this.bubble = d3.layout.pack()
	.sort(d3.ascending)
	.value(this.func(this.r));
		//.radius(function(d){ return r(d.nbTweet);});

	//creation des bubbles
	this.svg = d3.select("#words-bubble-chart")
	.append("svg")
	.classed("bubble", true);
		//.classed("svg-container", true)
		
	this.g = this.svg.append("g")
		.attr("transform", "translate(0,0)");
	

	//http://pothibo.com/2013/09/d3-js-how-to-handle-dynamic-
	//json-data/
	this.update = function(){

		//nouveau nombre de keywords
		var nbKW = Math.floor(this.nbTweetSlider.invert(
			this.circleBubbles.attr("cx")));

		if(nbKW==0){
			this.data = [];
		}
		else {
			this.data = data4all['keywords'].slice(0,nbKW);
		}

		this.r.domain(d3.extent(this.data, this.nbTweet));

		this.bubble.size([this.longueur(this.data.length),
			this.longueur(this.data.length)]);

		$("#words-bubble-chart").width(this.longueur(
			this.data.length));

		this.svg.attr("width", this.longueur(this.data.length))
		.attr("height", this.longueur(this.data.length));

		this.g.attr("width", this.longueur(this.data.length))
		.attr("height", this.longueur(this.data.length));

		var bubbleData = this.bubble.nodes({children:this.data})//.map(function(d){ d.r = +r(d["nbTweet"]); return d; })
		.filter(function(d) { return !d.children; });

		var bubbles = this.g.selectAll("circle").data(bubbleData);
		var textes = this.g.selectAll("text").data(bubbleData);

		if (this.data.length > 0){

			bubbles.exit().remove();
			textes.exit().remove();

			bubbles.enter().append("circle")
			.attr("r", function(d){ return d.r; })
			.attr("cx", function(d){ return d.x; })
			.attr("cy", function(d){ return d.y; })
			.style("fill", this.func(this.color));

			//format the text for each bubble
			textes.enter().append("text")
				.attr("x", function(d){ return d.x; })
				.attr("y", function(d){ return d.y + 5; })
				.attr("text-anchor", "middle")
				.text(function(d){ return d["mot"]; })
				.style({
					"fill":"white", 
					"font-family":"Helvetica Neue, Helvetica, Arial, \
					san-serif",
					"font-size": "12px"
				});
			bubbles.transition()
				.attr("r", function(d){ return d.r; })
				.attr("cx", function(d){ return d.x; })
				.attr("cy", function(d){ return d.y; })
				.style("fill", this.func(this.color));

			textes.transition()
				.attr("x", function(d){ return d.x; })
				.attr("y", function(d){ return d.y + 5; })
				.text(function(d){ return d["mot"];});
		}
		else {
			bubbles.exit().remove();
			textes.exit().remove();
			bubbles.transition()
				.attr("r", function(d){ return 0; })
				.attr("cx", function(d){ return 0; })
				.attr("cy", function(d){ return 0; });

			textes.transition()
				.attr("x", function(d){ return 0; })
				.attr("y", function(d){ return 0; });
		}
	};

	/*
		Deuxième partie : on souhaite faire un slider qui 
		controle 
		l'affichage des bulles 
		*/

	//longueur du slider en pixels
	this.longueurSlider = 180;

	//hauteur du slider en pixel
	this.hauteurSlider = 15;

	//hauteur de l'axe en pixel
	this.hauteurAxe = 10; 

	//Correspondance entr la position du slider et le nombre 
	//de tweets
	//affichés dans des bulles
	this.nbTweetSlider = d3.scale.linear()
	.domain([0, 10])
	.range([0,this.longueurSlider])
	.clamp(true);

	//ajout d'une balise svg pour le slider
	this.svgSlider = d3.select("#words-bubble-chart")
	.insert("svg", ":first-child")
	.attr("height", this.hauteurSlider+this.hauteurAxe+20)
	.attr("width", this.longueurSlider+20);

	$("#words-bubble-chart").width(this.minLongueur);

	//ajout d'une balise g pour le slider
	this.gSlider = this.svgSlider.append("g")
		.attr("class", "slider")
		.attr("transform", "translate(10,10)")
		.attr("height", this.hauteurSlider+this.hauteurAxe+20+"px")
		.attr("width", this.longueurSlider+20+"px");


	//creation du slider

	this.gSlider.append("line")
		.attr("x1", this.nbTweetSlider.range()[0]) // = 0
		.attr("x2", this.nbTweetSlider.range()[1]) 
		// = longueurSlider
		.style({
			"stroke":"#000", 
			"stroke-width": this.hauteurSlider+"px",
			"stroke-linecap": "round",
			"stroke-opacity" : 0.3
		});

	this.gSlider.append("line")   
		.attr("x1", this.nbTweetSlider.range()[0]) // = 0
		.attr("x2", this.nbTweetSlider.range()[1]) // = longueurSlider
		.style({
			"stroke":"#ddd", 
			"stroke-width": this.hauteurSlider-5+"px",
			"stroke-linecap": "round"
		});

	//creation de l'axe
	this.axeSlider = d3.svg.axis()
		.scale(this.nbTweetSlider)
		.orient("bottom");

	this.ladderSlider = this.gSlider.append("g")
		.attr("transform","translate(0,10)")
		.attr("class", "axis")
		.call(this.axeSlider);

	//creation du curseur du slider et appel de méthode

	this.circleBubbles = this.gSlider.append("circle")
		.attr("r", 9)
		.attr("cx",0)
		.style({
			"fill": "#fff",
			"stroke": "#000",
			"stoke-width": "1.25px"
		});

	this.dragMove = function(){
		//on bouge le curseur
		this.circleBubbles.attr("cx",Math.max(0,
			Math.min(this.nbTweetSlider.range()[1],d3.event.x)));
		//on update les bulles
		this.update();
	};
	
	this.func2 = function(callback,target){
		return function(){
			return callback.call(target);
		};
	}

	this.circleBubbles.call(d3.behavior.drag()
		.on("drag", this.func2(this.dragMove,this))
		.on("dragend", function(){})
	);

	console.timeEnd("creation bubblechart");
}