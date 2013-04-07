var dataCountries2, 
    minVal2,
    maxVal2,
    minValues2,
    maxValues2,
    w2 = 400,
    h2 = 400,
    vizPadding2 = {
        top: 35,
        right: 0,
        bottom: 30,
        left: 0
    },
    radius2,
    radiusLength2,
	countryColours2 = ['#ed1c24', '#f15a29', '#fff100', '#94e01b', '#4dd5ff', '#1e29f7', '#0e0e51', '#763cd3', '#631f4c', '#ec008b'],
    ruleColor2 = "#CCC",
	numberAxes2 = 8,
    
	//productNames = ["cappuchino","jeans","bread","internet","sneakers", "movie","prepaid","mcdonalds"],
	margin2 = 30,
	r2 = (d3.min([w2, h2]) / 2) - 1.5 * margin2,
	scales2,
    radia2,
    highestProduct2,
    dataCountries2b;

var loadViz2 = function(){
	loadData();
	buildBase();
	setScales();
	addAxes();
	draw();
};

var makeSpiderChart2 = function(countriesAndColors){
	getDataCountries2(countriesAndColors);
	buildBase2();
	setScales2();
	addAxes2();
	draw2(countriesAndColors);
};

function getDataCountries2(countriesAndColors) {
	dataCountries2 = new Array();
    dataCountries2b = new Array();
	productValues = new Array();
	for(var i=0; i < countriesAndColors.length; i++) { 
		dataCountries2[i] = new Array();
		countryCode = countriesAndColors[i].code;
		countryCode = countryCode.toUpperCase();
		countryMatrixData = _.find(sessvars.workData2, function(el) { return el.cc == countryCode; });
		
		countryMatrixProductData = _.filter(countryMatrixData.products, function (prod) { return _.contains(productNames, prod.name); });
		for(var j=0; j < productNames.length; j++){
			dataCountries2[i][j] = countryMatrixProductData[j].percentage * 100;
		}
		
		for(var k=0; k < productNames.length; k++){
			if(i==0){
				productValues[k] = new Array();
			}
			productValues[k][i] = countryMatrixProductData[k].percentage * 100;
		}
	}
	
	
    //to complete the radial lines
    for (var i = 0; i < dataCountries2.length; i += 1) {
        dataCountries2[i].push(dataCountries2[i][0]);
    }
	
	minValues2 = new Array();
	maxValues2 = new Array();
    maxMin=-1;
    highestProduct2 = -1;
	for(var i = 0; i < productValues.length; i++){
		minValues2[i] = d3.min(productValues[i]);
		maxValues2[i] = d3.max(productValues[i]);
        if (maxValues2[i] > maxMin) {
            maxMin = maxValues2[i];
            highestProduct2 = i;
        }
	}
	minVal2 = d3.min(minValues2);
	maxVal2 = d3.max(maxValues2);
 }

var buildBase2 = function(){
    var viz = d3.select("#spiderchart2")
        .append('svg:svg')
        .attr('width', w2)
        .attr('height', h2)
        .attr('class', 'vizSvg');

    viz.append("svg:rect")
        .attr('id', 'axis-separator2')
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', 0)
        .attr('width', 0)
        .attr('height', 0);
    
    vizBody = viz.append("svg:g")
        .attr('id', 'body2');
};

setScales2 = function () {
	var heightCircleConstraint,
	  widthCircleConstraint,
	  circleConstraint,
	  centerXPos,
	  centerYPos;
	  
      
	  scales2 = $.map(productNames, function(m, i) {
      
            var minVal0 = minValues2[highestProduct2];
            var rescaleMin = minVal0 / minValues2[i];
            var maxVal0 = maxValues2[highestProduct2];
            var rescaleMax = maxVal0 / maxValues2[i];
            
             var rescale = d3.scale.linear()
                             .domain([minValues2[i], maxValues2[i]])
                             .range([minVal0, maxVal0]);//.nice();
             return d3.scale.linear()
				  .domain([rescale(minVal0), rescale(maxVal0)])
				  .range([margin2, r2]);//.nice();
		});
		axes = $.map(productNames, function(m, i) {
                            
			return d3.svg.axis().scale(scales2[i]).orient("left")
				.ticks(5);
		});	  	 
	  
	//need a circle so find constraining dimension
	heightCircleConstraint = h2 - vizPadding2.top - vizPadding2.bottom;
	widthCircleConstraint = w2 - vizPadding2.left - vizPadding2.right;
	circleConstraint = d3.min([
	  heightCircleConstraint, widthCircleConstraint]);

	radius2 = d3.scale.linear().domain([minVal2, maxVal2])
                .range([0, (circleConstraint / 2)]);
	radiusLength2 = radius2(maxVal2);
    
    radia2 = $.map(productNames, function(m, i) {
            return (
                d3.scale.linear()
                   .domain([minValues2[i], maxValues2[i]])
                   .range([0, (circleConstraint / 2)]));
               });         

	//attach everything to the group that is centered around middle
	centerXPos = widthCircleConstraint / 2 + vizPadding2.left;
	centerYPos = heightCircleConstraint / 2 + vizPadding2.top;

	vizBody.attr("transform",
	  "translate(" + centerXPos + ", " + centerYPos + ")");
};

addAxes2 = function () {
  var radialTicks = radius2.ticks(10), //set the number of ticks
      i,
      circleAxes,
      lineAxes;
	  
	  vizBody.selectAll('.circle-ticks').remove();
      vizBody.selectAll('.line-ticks').remove();

  circleAxes = vizBody.selectAll('.circle-ticks')
      .data(radialTicks)
      .enter().append('svg:g')
      .attr("class", "circle-ticks");

  circleAxes.append("svg:circle")
      .attr("r", function (d, i) {
            
          return radius2(d);
      })
      .attr("class", "circle")
      .style("stroke", ruleColor2)
      .style("fill", "none");
                            
	lineAxes = vizBody.selectAll('.line-ticks')
		.data(productNames)
		.enter().append('svg:g')
		.attr("transform", function (d, i) {
        
            var minVal0 = minValues2[highestProduct2];
            var rescaleMin = minVal0 / minValues2[i];
            var maxVal0 = maxValues2[highestProduct2];
            var rescaleMax = maxVal0 / maxValues2[i];
            
            var rescale = d3.scale.linear()
                            .domain([minValues2[i], maxValues2[i]])
                            .range([minVal0, maxVal0]);//.nice();
                            
			return "rotate(" + ((i / productNames.length * 360) - 90) + // (angle(i)*180/Math.PI)
			  ")translate(" + radius2(rescale(maxValues2[i])) + ")translate(10,0)";
            })
	  .attr("class", "line-ticks");

	lineAxes.append('svg:line')
		.attr("x2", -1 * radius2(maxValues2[0]))
		.style("stroke", ruleColor2)
		.style("fill", "none");

	// rotate the text
	// hardcoded way to put the 8 labels straight
	lineAxes.append('svg:text')
			.text(String)
		.attr("text-anchor", "middle")
		.attr("transform", function (d, i) {
		if(i==0)
			return "rotate(90)";
		if(i==1)
			return "rotate(45)";
		if(i==2)
			return "rotate(0)";
		if(i==3)
			return "rotate(-45)";
		if(i==4)
			return "rotate(-90)";
		if(i==5)
			return "rotate(-135)";
		if(i==6)
			return "rotate(-180)";
		if(i==7)
			return "rotate(-225)";
		return "rotate(0)";
	  });
};

function angle(i) {
	return i * (2 * Math.PI / productNames.length) +
		Math.PI;
}

var draw2 = function (countriesAndColors) {
  var groups,
      lines,
      linesToUpdate;
      highlightedDotSize = 4;

     /////////////// herschalen
     for (var i =0; i < countriesAndColors.length; i++) {
        dataCountries2b[i] = new Array(productNames.length);        
        
        for(var j=0; j < productNames.length; j++) { // producten            
            var minVal0 = minValues2[highestProduct2];
            var rescaleMin = minVal0 / minValues2[j];
            var maxVal0 = maxValues2[highestProduct2];
            var rescaleMax = maxVal0 / maxValues2[j];
            
            var rescale = d3.scale.linear()
                            .domain([minValues2[j], maxValues2[j]])
                            .range([minVal0, maxVal0]);//.nice();
                            
            dataCountries2b[i][j] =  rescale(dataCountries2[i][j]);
        }
     }
     for (var i = 0; i < dataCountries2b.length; i += 1) {
        dataCountries2b[i].push(dataCountries2b[i][0]);
    }
    /////////////////////////////////
    
    //// tooltip
    var tooltip2 = d3.select("#spiderchart2")
     .append("div")
         .attr("class", "tooltip")
         .attr("id", "tooltip2")
         .style("background-color","#1b1b1b")
         .style("margin", "10px")
         .style("padding", "5px")
         .style("border-radius",3)
         .style("position", "absolute")
         .style("z-index", "30")
         .style("opacity", 0);
     //////
     
      groups = vizBody.selectAll('.dataCountries2')
		.data(dataCountries2b );
        
    groups.enter().append("svg:g")
            .attr("class", "countrysvg2")
      .attr("id", function(d,i) { return "line2"+i; })
      
	  .attr('fill', function (d, i) {
		return  countriesAndColors[i].color;
	  })        
      .attr('stroke', function(d,i) {  return  countriesAndColors[i].color;})
      .style('stroke-opacity', 0.9) 
      .style('stroke-width', 0.5)
      .attr("stroke-linecap", "round")      
      .attr('fill-opacity', 0.3)
      .attr("z-index",(10+i))
      .on("mouseover", function(d,i) { 

            var mousePos = d3.mouse(this);
             $('#tooltip').css("display", "none");
             $('#tooltip2').css("display", "inline");
            tooltip2.html(
                    sessvars.codeToName[countriesAndColors[i].code.toLowerCase()]
                    + ": </br>"+ 
                    getTextDataPercentagesAllProducts(countriesAndColors[i].code.toLowerCase()))
                .transition().duration(600)
                .style("opacity", .7)
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            
            
        })
        .on("mousemove", function(d,i) { 
            $('#tooltip2').css("display", "inline");
            var mousePos = d3.mouse(this);
            tooltip2
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
        })
        
        .on("mouseout", function(d,i) { 
            
            
             tooltip2
                .transition().duration(600)
                .style("opacity", 0)
                .attr("display","none");
                
        });
	    
	 ctr = vizBody.append("svg:g");
                
    
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
      .style("z-index", "0")
      .attr("class", "clicked-point");
  
  lines.attr("d", d3.svg.line.radial()
    
      .radius(function (d,i) {
            return radius2(d);
      })
      .angle(function (d, i) {
          if (i === numberAxes) {
              i = 0;
          } //close the line
          return (i / numberAxes) * 2 * Math.PI;
      }));
};
