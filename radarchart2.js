var dataCountries, 
    minVal,
    maxVal,
    minValues,
    maxValues,
    w = 400,
    h = 400,
    vizPadding = {
        top: 35,
        right: 0,
        bottom: 30,
        left: 0
    },
    radius,
    radiusLength,
	countryColours = ['#ed1c24', '#f15a29', '#fff100', '#94e01b', '#4dd5ff', '#1e29f7', '#0e0e51', '#763cd3', '#631f4c', '#ec008b'],
    ruleColor = "#CCC",
	numberAxes = 8,
    
	//productNames = ["cappuchino","jeans","bread","internet","sneakers", "movie","prepaid","mcdonalds"],
	margin = 30,
	r = (d3.min([w, h]) / 2) - 1.5 * margin,
	scales,
    radia,
    highestProduct,
    dataCountries2;

var loadViz = function(){
	loadData();
	buildBase();
	setScales();
	addAxes();
	draw();
};

var makeSpiderChart = function(countriesAndColors){
	console.log("IN RADAR");
	getDataCountries(countriesAndColors);
	buildBase();
	setScales();
	addAxes();
	draw(countriesAndColors);
};

function getDataCountries(countriesAndColors) {
	dataCountries = new Array();
    dataCountries2 = new Array();
	productValues = new Array();
	for(var i=0; i < countriesAndColors.length; i++) { 
		dataCountries[i] = new Array();
		countryCode = countriesAndColors[i].code;
		countryCode = countryCode.toUpperCase();
		countryMatrixData = _.find(sessvars.workData2, function(el) { return el.cc == countryCode; });
		
		countryMatrixProductData = _.filter(countryMatrixData.products, function (prod) { return _.contains(productNames, prod.name); });
		console.log(countryMatrixProductData);
		for(var j=0; j < productNames.length; j++){
			dataCountries[i][j] = countryMatrixProductData[j].minutes;
		}
		
		for(var k=0; k < productNames.length; k++){
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
    maxMin=-1;
    highestProduct = -1;
	for(var i = 0; i < productValues.length; i++){
		minValues[i] = d3.min(productValues[i]);
		maxValues[i] = d3.max(productValues[i]);
        if (maxValues[i] > maxMin) {
            maxMin = maxValues[i];
            highestProduct = i;
        }
	}
	minVal = d3.min(minValues);
	maxVal = d3.max(maxValues);
	console.log("minVal");
	console.log(minVal);
	console.log("maxVal");
	console.log(maxVal);
    console.log(minValues);
    console.log(maxValues);
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
	  
      
	  scales = $.map(productNames, function(m, i) {
      
            var minVal0 = minValues[highestProduct];
            var rescaleMin = minVal0 / minValues[i];
            var maxVal0 = maxValues[highestProduct];
            var rescaleMax = maxVal0 / maxValues[i];
            
             var rescale = d3.scale.linear()
                             .domain([minValues[i], maxValues[i]])
                             .range([minVal0, maxVal0]);//.nice();
                            
			 // return d3.scale.linear()
				 // .domain([minValues[i], maxValues[i]])
				 // .range([margin, r]);//.nice();
             return d3.scale.linear()
				  .domain([rescale(minVal0), rescale(maxVal0)])
				  .range([margin, r]);//.nice();
		});
		axes = $.map(productNames, function(m, i) {
                            
			return d3.svg.axis().scale(scales[i]).orient("left")
				.ticks(5);
		});	  
	 
     
     // radia = [];
     // for (var i=0; i < 8; i++) {
         // radia.push( function() { return d3.scale.linear()
            // .domain([minValues[i], maxValues[i]])
            // .range([0, (circleConstraint / 2)]); });      
	// }
   
    
    // for (var i=0; i < 8; i++) {
        // console.log(minValues[i]);
        // console.log(scales[i](minValues[i]));
        // console.log(maxValues[i]);
        // console.log(scales[i](maxValues[i]));
    // }
	  
	//need a circle so find constraining dimension
	heightCircleConstraint = h - vizPadding.top - vizPadding.bottom;
	widthCircleConstraint = w - vizPadding.left - vizPadding.right;
	circleConstraint = d3.min([
	  heightCircleConstraint, widthCircleConstraint]);

	radius = d3.scale.linear().domain([minVal, maxVal])
                .range([0, (circleConstraint / 2)]);
	radiusLength = radius(maxVal);
    
    radia = $.map(productNames, function(m, i) {
            console.log(i);
            //console.log([minValues[i], maxValues[i]]);
            //console.log((circleConstraint / 2));
			return (
                d3.scale.linear()
                   .domain([minValues[i], maxValues[i]])
                   .range([0, (circleConstraint / 2)]));
               });         
		
      console.log(radia);  
      
      
	/*
	scales = $.map(productNames, function(l, i) {
		return d3.scale.linear()
		.domain([minValues[i], maxValues[i]])
		.range([margin, r]).nice();
	})
	*/

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
		  //.attr("class", "shadow")
		  .text(String);
		*/
		  
	
    
                            
	lineAxes = vizBody.selectAll('.line-ticks')
		.data(productNames)
		.enter().append('svg:g')
		.attr("transform", function (d, i) {
        
            var minVal0 = minValues[highestProduct];
            var rescaleMin = minVal0 / minValues[i];
            var maxVal0 = maxValues[highestProduct];
            var rescaleMax = maxVal0 / maxValues[i];
            
            var rescale = d3.scale.linear()
                            .domain([minValues[i], maxValues[i]])
                            .range([minVal0, maxVal0]);//.nice();
                            
            
                    
			return "rotate(" + ((i / productNames.length * 360) - 90) + // (angle(i)*180/Math.PI)
			  ")translate(" + radius(rescale(maxValues[i])) + ")translate(10,0)";
            })
	  //.attr("class", "back")
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
		  //return (i / productNames.length * 360) < 180 ? null : "rotate(180);
		  return "rotate(90)";
	  });
};

function angle(i) {
	return i * (2 * Math.PI / productNames.length) +
		Math.PI;
}

var draw = function (countriesAndColors) {
  var groups,
      lines,
      linesToUpdate;
        console.log("data in draw");
        console.log(dataCountries);
      highlightedDotSize = 4;

     /////////////// herschalen
     for (var i =0; i < countriesAndColors.length; i++) {
        console.log(i);
        dataCountries2[i] = new Array(productNames.length);        
        
        for(var j=0; j < productNames.length; j++) { // producten
            console.log([minValues[j], maxValues[j]]);
            console.log([minVal, maxVal]);
            
            var minVal0 = minValues[highestProduct];
            var rescaleMin = minVal0 / minValues[j];
            var maxVal0 = maxValues[highestProduct];
            var rescaleMax = maxVal0 / maxValues[j];
            
            var rescale = d3.scale.linear()
                            .domain([minValues[j], maxValues[j]])
                            .range([minVal0, maxVal0]);//.nice();
                            
            console.log(j);
            dataCountries2[i][j] =  rescale(dataCountries[i][j]);
        }
     }
     for (var i = 0; i < dataCountries2.length; i += 1) {
        dataCountries2[i].push(dataCountries2[i][0]);
    }
    /////////////////////////////////
    
    //// tooltip
    var tooltip = d3.select("#spiderchart")
     .append("div")
         .attr("class", "tooltip")
         .attr("id", "tooltip")
         .style("background-color","#1b1b1b")
         .style("margin", "10px")
         .style("padding", "5px")
         .style("border-radius",3)
         .style("position", "absolute")
         .style("z-index", "20")
         .style("opacity", 0);
     //////
     

 
 var legendPosition = {x: 0, y: 18, dimensionsRect: 15};
        
         var legend = d3.select('#legend').selectAll('.legend')
              .data(dataCountries/*.slice().reverse()*/)
                .enter()
                    .append("svg")
                      .attr("width", 800)
                      .attr("height", legendPosition.dimensionsRect + 5)
                      .attr("y", legendPosition.y)                      
                      .append("g")
                       .attr("class", "legend");
                        //.attr("transform", function(d, i) { return "translate(0," + i * -2 + ")"; });
        
          legend.append("rect")
              .attr("id", function(d,i) { return "legendrect"+i;})
              .attr("x", legendPosition.x)
              .attr("width", legendPosition.dimensionsRect)
              .attr("height", legendPosition.dimensionsRect)
              .on("click", function(d,i) {editOpacity(i); })
              .attr('stroke', function(d,i) { return countriesAndColors[i].color;})
              .style("fill", function(d,i) {  return countriesAndColors[i].color;})
              .style("fill-opacity", 0.3);
        
      
          legend.append("text")          
              .attr("x", legendPosition.x + legendPosition.dimensionsRect + 5)
              .attr("y", legendPosition.y )
              .attr("dy", "-.35em")
              .style("text-anchor", "begin")      
              .on("click", function(d,i) {editOpacity(i); })
              .text(function(d,i) { return sessvars.codeToName[countriesAndColors[i].code.toLowerCase()]; })
                .attr('fill', "#c8c7c1" /*function(d,i) { return countryColours[i];}*/);
                
      groups = vizBody.selectAll('.dataCountries')
		.data(dataCountries2 );
        
    groups.enter().append("svg:g")
            .attr("class", "countrysvg")
      .attr("id", function(d,i) { return "line"+i; })
      
	  .attr('fill', function (d, i) {
		return  countriesAndColors[i].color;
	  })        
      .attr('stroke', function(d,i) {  return  countriesAndColors[i].color;})
      .style('stroke-opacity', 0.9) 
      .style('stroke-width', 0.5)
      .attr("stroke-linecap", "round")      
      .attr('fill-opacity', 0.3)
      
      .on("mouseover", function(d,i) { 
            var mousePos = d3.mouse(this);
            
           
            console.log(mousePos);
            
           // tooltip.attr("visibility", "visible");
           // tooltip.attr({transform: 'translate(' + mousePos + ')'});
          
            $('#tooltip2').css("display", "none");
             $('#tooltip').css("display", "inline");
             
            tooltip.html(
                    sessvars.codeToName[countriesAndColors[i].code.toLowerCase()]
                    + ": </br>"+ 
                    getTextDataAllProducts(countriesAndColors[i].code.toLowerCase()))
                .transition().duration(600)
                .style("opacity", .7)
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
           
            
        })
        .on("mousemove", function(d,i) { 
            $('#tooltip').css("display", "inline");
            var mousePos = d3.mouse(this);
            tooltip
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
        })
        
        .on("mouseout", function(d,i) { 
            var mousePos = d3.mouse(this);
             tooltip
                .transition().duration(600)
                .style("opacity", 0)
                .attr("display","none");
        });
	
    
              
  function editOpacity(i) {
        var bla = d3.select("#line"+i);
        var blaR = d3.select("#line2"+i);
        var bla2 = d3.select("#legendrect"+i);
        
        var op = bla2.style('fill-opacity');
        
        if (op == 1) {
           
            bla2.transition().duration(600).style('fill-opacity', 0.3);
            bla.transition().duration(600).attr('fill-opacity', 0.3);
            blaR.transition().duration(600).attr('fill-opacity', 0.3);
            
        }
        else {
            bla.attr("display","inline");
            blaR.attr("display","inline");
            bla2.transition().duration(600).style('fill-opacity', 1);
            
            bla.transition().duration(600).attr('fill-opacity', 0.9);           
            bla.style('stroke-opacity', 0.9);
            blaR.transition().duration(600).attr('fill-opacity', 0.9);           
            blaR.style('stroke-opacity', 0.9);
             
        }
        
        for (var j=0; j < count; j++) {
            if (i != j) {
                var bla = d3.select("#line"+j);
                var blaR = d3.select("#line2"+j);
                var bla2 = d3.select("#legendrect"+j);
                
               
                
                if (op == 1) {
                    bla.attr("display","inline");
                    blaR.attr("display","inline");
                    bla2.transition().duration(600).style('fill-opacity', 0.3);
                    bla.transition().duration(600).attr('fill-opacity', 0.3);
                    bla.style('stroke-opacity', 0.9);
                    blaR.transition().duration(600).attr('fill-opacity', 0.3);
                    blaR.style('stroke-opacity', 0.9);
                }
                else {
                     bla2.transition().duration(600).style('fill-opacity', 0.3);
                     
                     bla.transition().duration(600).attr('fill-opacity', 0);
                     bla.style('stroke-opacity', 0);
                     bla.attr("display","none");
                     
                     blaR.transition().duration(600).attr('fill-opacity', 0);
                     blaR.style('stroke-opacity', 0);
                     blaR.attr("display","none");
                }
            }
        
        }
    }
    
	 ctr = vizBody.append("svg:g");
                
      // $.each(axes, function(i, a) {
			// $.each([true, false], function(j, v) {
                // console.log("j: " + j);
                // console.log("v:" + v);
				// ctr.append("g")
					// .attr("transform",
						// "rotate(" + -(angle(i)*180/Math.PI) + ")")
                    // .attr("class", "xaxis2")
					// .call(a)
                        // .selectAll("text")
                        // .attr("text-anchor", "middle")
                        // .attr("class", v ? "back" : "")
                        // .attr("transform", function(d) {
                            // var x = d3.select(this).attr("x"),
                                // y = d3.select(this).attr("y");
                            // return "rotate(" + (angle(i)*180/Math.PI) + " " + 
                                    // x + " " + y + ")";
                       // });
			// });
		// });	
	
  
 // groups.exit().remove();
	
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
            console.log("d[0]:");
            console.log(d[0]);
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

      console.log("radia");
      console.log(radia);
      
  lines.attr("d", d3.svg.line.radial()
    
      .radius(function (d,i) {
            return radius(d);
      })
      .angle(function (d, i) {
          if (i === numberAxes) {
              i = 0;
          } //close the line
          return (i / numberAxes) * 2 * Math.PI;
      }));
};
