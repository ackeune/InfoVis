var dataCountries, 
    labels,
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
	numberAxes = 8;
	

var loadViz = function(){
  loadData();
  buildBase();
  setScales();
  addAxes();
  draw();
};

var makeSpiderChart = function(countriesAndColors ){
  getDataCountries(countriesAndColors );
  buildBase();
  setScales();
  addAxes();
  draw();
};

var loadData = function(){
    var randomFromTo = function randomFromTo(from, to){
       return Math.floor(Math.random() * (to - from + 1) + from);
    };

    //TODO use country data
    dataCountries = [
      [],
      [],
      [],
	  []
    ];

    labels = [];
    labels = ["cappuchino","jeans","bread","internet","sneakers", "movie","prepaid","mcdonalds"];
    for (i = 0; i < 8; i += 1) {
        dataCountries[0][i] = randomFromTo(0,20);
        dataCountries[1][i] = randomFromTo(5,15);
        dataCountries[2][i] = randomFromTo(5,25);
		dataCountries[3][i] = randomFromTo(10,25);
        //labels[i] = i; //in case we want to do different formatting
    }

	//TODO do this better
    mergedArr = dataCountries[0].concat(dataCountries[1]).concat(dataCountries[2]);

    minVal = d3.min(mergedArr);
    maxVal = d3.max(mergedArr);
    
    //give 25% of range as buffer to top
    maxVal = maxVal + ((maxVal - minVal) * 0.25);
    minVal = 0;

    //to complete the radial lines
    for (i = 0; i < dataCountries.length; i += 1) {
        dataCountries[i].push(dataCountries[i][0]);
    }
	console.log("old");
	console.log(dataCountries);
};

var findMinMax = function(array){
	var tempMin, tempMax;
	for(i = 0; i < array.length; i += 1){
		tempMin = d3.min(array[i]);
		tempMax = d3.max(array[i]);
		if(tempMin < minVal){
			minVal = tempMin
		}
		if(tempMax > maxVal){
			maxVal = tempMax
		}
	}
}

function getDataCountries(countriesAndColors) {
	labels = ["cappuchino","jeans","bread","internet","sneakers", "movie","prepaid","mcdonalds"]; //TODO put somewhere else
    console.log("IN RADAR");

	dataCountries = new Array();
	for(var i=0; i < countriesAndColors.length; i++) { 
		dataCountries[i] = new Array();
		countryCode = countriesAndColors[i].code;
		countryCode = countryCode.toUpperCase();
		countryMatrixData = _.find(sessvars.workData2, function(el) { return el.cc == countryCode; });
		
		countryMatrixProductData = _.filter(countryMatrixData.products, function (prod) { return _.contains(productNames, prod.name); });
		console.log(countryMatrixProductData);
		for(var j=0; j < labels.length; j++){
			a = countryMatrixProductData[j].minutes;
			dataCountries[i][j] = a;
		}	
	}
	
	 //to complete the radial lines
    for (i = 0; i < dataCountries.length; i += 1) {
        dataCountries[i].push(dataCountries[i][0]);
    }
	console.log("new");
	console.log(dataCountries);
	//console.log(dataCountries);
	minVal = 0;
	maxVal = 1000;
	//document.getElementById("spiderchart").innerHTML = "";
    //for(var i=0; i < countriesAndColors.length; i++) { // zet de landnamen weer in het html selector ding
    //   document.getElementById("spiderchart").innerHTML += "<b> country " + i + ": </b> " +  sessvars.codeToName[countriesAndColors[i].code] + " </br>";
    //}
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

  circleAxes.append("svg:text")
      .attr("text-anchor", "middle")
      .attr("dy", function (d) {
          return -1 * radius(d);
      })
      .text(String);

  lineAxes = vizBody.selectAll('.line-ticks')
      .data(labels)
      .enter().append('svg:g')
      .attr("transform", function (d, i) {
          return "rotate(" + ((i / labels.length * 360) - 90) +
              ")translate(" + radius(maxVal) + ")";
      })
      .attr("class", "line-ticks");

  lineAxes.append('svg:line')
      .attr("x2", -1 * radius(maxVal))
      .style("stroke", ruleColor)
      .style("fill", "none");

  lineAxes.append('svg:text')
      .text(String)
      .attr("text-anchor", "middle")
      .attr("transform", function (d, i) {
          //return (i / labels.length * 360) < 180 ? null : "rotate(180);
		  return "rotate(90)";
      });
};

var draw = function () {
  var groups,
      lines,
      linesToUpdate;
	console.log("data in draw");
	console.log(dataCountries);
  highlightedDotSize = 4;
  groups = vizBody.selectAll('.dataCountries')
      .data(dataCountries);
  groups.enter().append("svg:g")
      .attr("class", function (d, i){
		return 'country' + i;
	  })
	  /*
	  .attr('class', 'dataCountries')
	  
      .style('stroke', function (d, i) { //TODO make dynamic
		return countryColours[i]
      })
	  .attr('fill', function (d, i) {
		return countryColours[i]
	  })
	  */
	  
	  .attr('opacity', 0.3);
	  
  groups.exit().remove();

  lines = groups.append('svg:path')
      .attr("class", "line")
      .attr("d", d3.svg.line.radial()
          .radius(function (d) {
              return 0;
          })
          .angle(function (d, i) {
              if (i === numberAxes) { //TODO numberAxes var
                  i = 0;
              } //close the line
              return (i / numberAxes) * 2 * Math.PI; //TODO numberAxes var
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
          if (i === numberAxes) { //TODO numberAxes var
              i = 0;
          } //close the line
          return (i / numberAxes) * 2 * Math.PI; //TODO numberAxes var
      }));
};
