var dataCountries, 
    minVal,
    maxVal,
    w = 400,
    h = 400,
    vizPadding = {
        top: 30,
        right: 0,
        bottom: 15,
        left: 0
    },
    radius,
    radiusLength,
	countryColours = ['#ed1c24', '#f15a29', '#fff100', '#94e01b', '#4dd5ff', '#1e29f7', '#0e0e51', '#763cd3', '#631f4c', '#ec008b'],
    ruleColor = "#CCC",
	numberAxes = 8,
	labels = ["cappuchino","jeans","bread","internet","sneakers", "movie","prepaid","mcdonalds"],
	margin = 30,
	r = (d3.min([w, h]) / 2) - 1.5 * margin;
	

var loadViz = function(){
	loadData();
	buildBase();
	setScales();
	addAxes();
	draw();
};

var makeSpiderChart = function(countriesAndColors){
	console.log("IN RADAR");
	document.getElementById("spiderchart").innerHTML = "";
	getDataCountries(countriesAndColors);
	buildBase();
	setScales();
	addAxes();
	draw(countriesAndColors);
};

function getDataCountries(countriesAndColors) {
	dataCountries = new Array();
	productValues = new Array();
	for(var i=0; i < countriesAndColors.length; i++) { 
		dataCountries[i] = new Array();
		countryCode = countriesAndColors[i].code;
		countryCode = countryCode.toUpperCase();
		countryMatrixData = _.find(sessvars.workData2, function(el) { return el.cc == countryCode; });
		
		countryMatrixProductData = _.filter(countryMatrixData.products, function (prod) { return _.contains(productNames, prod.name); });
		console.log(countryMatrixProductData);
		for(var j=0; j < labels.length; j++){
			dataCountries[i][j] = countryMatrixProductData[j].minutes;
		}
		
		for(var k=0; k < labels.length; k++){
			if(i==0){
				productValues[k] = new Array();
			}
			productValues[k][i] = countryMatrixProductData[k].minutes;
		}
	}
	
	
	 //to complete the radial lines
    for (var i = 0; i < dataCountries.length; i += 1) {
        dataCountries[i].push(dataCountries[i][0]);
    }
	
	console.log("productValues");
	console.log(productValues);
	//console.log(dataCountries);
	minValues = new Array();
	maxValues = new Array();
	for(var i = 0; i < productValues.length; i++){
		minValues[i] = d3.min(productValues[i]);
		maxValues[i] = d3.max(productValues[i]);
	}
	minVal = d3.min(minValues);
	maxVal = d3.max(maxValues);
	console.log("minVal");
	console.log(minVal);
	console.log("maxVal");
	console.log(maxVal);
 }

var buildBase = function(){
    var viz = d3.select("#spiderchart")
        .append('svg:svg')
        .attr('width', w)
        .attr('height', h)
        .attr('class', 'vizSvg');

    viz.append("svg:rect")
        .attr('id', 'axis-separator')
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', 0)
        .attr('width', 0)
        .attr('height', 0);
    
    vizBody = viz.append("svg:g")
        .attr('id', 'body');
};

setScales = function () {
	var heightCircleConstraint,
	  widthCircleConstraint,
	  circleConstraint,
	  centerXPos,
	  centerYPos;
	  
	var scales = $.map(labels, function(m, i) {
			return d3.scale.linear()
				.domain([minValues[i], maxValues[i]])
				.range([margin, r]).nice();
		})
		axes = $.map(labels, function(m, i) {
			return d3.svg.axis().scale(scales[i]).orient("left")
				.tickSize(0);
		});	  

	//need a circle so find constraining dimension
	heightCircleConstraint = h - vizPadding.top - vizPadding.bottom;
	widthCircleConstraint = w - vizPadding.left - vizPadding.right;
	circleConstraint = d3.min([
	  heightCircleConstraint, widthCircleConstraint]);

	radius = d3.scale.linear().domain([minVal, maxVal])
	  .range([0, (circleConstraint / 2)]);
	radiusLength = radius(maxVal);

	//attach everything to the group that is centered around middle
	centerXPos = widthCircleConstraint / 2 + vizPadding.left;
	centerYPos = heightCircleConstraint / 2 + vizPadding.top;

	vizBody.attr("transform",
	  "translate(" + centerXPos + ", " + centerYPos + ")");
};

addAxes = function () {
  var radialTicks = radius.ticks(10), //set the number of ticks
      i,
      circleAxes,
      lineAxes;
	  
	console.log("dataCountries");
	console.log(dataCountries);
	vizBody.selectAll('.circle-ticks').remove();
	vizBody.selectAll('.line-ticks').remove();

	circleAxes = vizBody.selectAll('.circle-ticks')
	  .data(radialTicks)
	  .enter().append('svg:g')
	  .attr("class", "circle-ticks");

	circleAxes.append("svg:circle")
	  .attr("r", function (d, i) {
		  return radius(d);
	  })
	  .attr("class", "circle")
	  .style("stroke", ruleColor)
	  .style("fill", "none");
	
	/*
	circleAxes.append("svg:text")
		.attr("text-anchor", "middle")
		.attr("dy", function (d) {
			return -1 * radius(d);
		})
		.text(String);
	*/	
		  
	
	lineAxes = vizBody.selectAll('.line-ticks')
		.data(labels)
		.enter().append('svg:g')
		.attr("transform", function (d, i) {
			return "rotate(" + ((i / labels.length * 360) - 90) +
			  ")translate(" + radius(maxValues[i]) + ")";
      })
	  .attr("class", "back")
	  .attr("class", "line-ticks");

	lineAxes.append('svg:line')
		.attr("x2", -1 * radius(maxValues[0]))
		.style("stroke", ruleColor)
		.style("fill", "none");

	// rotate the text
	lineAxes.append('svg:text')
	  .text(String)
	  .attr("text-anchor", "middle")
	  .attr("transform", function (d, i) {
		  //return (i / labels.length * 360) < 180 ? null : "rotate(180);
		  return "rotate(90)";
	  });
};

function angle(i) {
	return i * (2 * Math.PI / labels.length) +
		Math.PI;
}

var draw = function (countriesAndColors) {
  var groups,
      lines,
      linesToUpdate;
	console.log("data in draw");
	console.log(dataCountries);
  highlightedDotSize = 4;
  groups = vizBody.selectAll('.dataCountries')
		.data(dataCountries);
		groups.enter().append("svg:g")
		/*  .attr("class", function (d, i){
			return 'country' + i;
		  })
		*/
		.style('stroke', function (d, i) { 
			return countriesAndColors[i].color;
		})
		.attr('fill', function (d, i) { 
			return countriesAndColors[i].color;
		})
		.attr('opacity', 0.3);
	

		$.each(axes, function(i, a) {
			$.each([true, false], function(j, v) {
				vizBody.append("svg:g")
					.attr("transform",
						"rotate(" + -(angle(i)*180/Math.PI) + ")")
					.call(a)
					.selectAll("text")
					.attr("text-anchor", "middle")
					.attr("class", v ? "back" : "")
					.attr("transform", function(d) {
						var x = d3.select(this).attr("x"),
							y = d3.select(this).attr("y");
						return "rotate(" + (angle(i)*180/Math.PI) + " " +
								x + " " + y + ")";
					});
			});
		});
	
  
  groups.exit().remove();
	
  lines = groups.append('svg:path')
      .attr("class", "line")
      .attr("d", d3.svg.line.radial()
          .radius(function (d) {
              return 0;
          })
          .angle(function (d, i) {
              if (i === numberAxes) {
                  i = 0;
              } //close the line
              return (i / numberAxes) * 2 * Math.PI;
          }))
      .style("stroke-width", 3);

  groups.selectAll(".curr-point")
      .data(function (d) {
          return [d[0]];
      })
      .enter().append("svg:circle")
      .attr("class", "curr-point")
      .attr("r", 0);

  groups.selectAll(".clicked-point")
      .data(function (d) {
          return [d[0]];
      })
      .enter().append("svg:circle")
      .attr('r', 0)
      .attr("class", "clicked-point");

  lines.attr("d", d3.svg.line.radial()
      .radius(function (d) {
          return radius(d);
      })
      .angle(function (d, i) {
          if (i === numberAxes) {
              i = 0;
          } //close the line
          return (i / numberAxes) * 2 * Math.PI;
      }));
};
