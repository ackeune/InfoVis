var series, 
    labels,
    minVal,
    maxVal,
    w = 400,
    h = 400,
    vizPadding = {
        top: 10,
        right: 0,
        bottom: 15,
        left: 0
    },
    radius,
    radiusLength,
    ruleColor = "#CCC";

var loadViz = function(){
  loadData();
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
    series = [
      [],
      [],
      []
    ];

    labels = [];

    for (i = 0; i < 5; i += 1) {
        series[0][i] = randomFromTo(0,20);
        series[1][i] = randomFromTo(5,15);
        series[2][i] = randomFromTo(5,25);
        //labels[i] = i; //in case we want to do different formatting
    }
    labels = ["coffee","jeans","bread","prepaid","cinema"];

    mergedArr = series[0].concat(series[1]).concat(series[2]);

    minVal = d3.min(mergedArr);
    maxVal = d3.max(mergedArr);
    
    //give 25% of range as buffer to top
    maxVal = maxVal + ((maxVal - minVal) * 0.25);
    minVal = 0;

    //to complete the radial lines
    for (i = 0; i < series.length; i += 1) {
        series[i].push(series[i][0]);
    }
};

var buildBase = function(){
    var viz = d3.select("#viz")
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
          return (i / labels.length * 360) < 180 ? null : "rotate(180)";
      });
};

var draw = function () {
  var groups,
      lines,
      linesToUpdate;

  highlightedDotSize = 4;

  groups = vizBody.selectAll('.series')
      .data(series);
  groups.enter().append("svg:g")
      .attr('class', 'series')
      .style('fill', function (d, i) { //TODO make dynamic
          if(i === 0){
            return "green";
          } else if(i === 1){
            return "blue";
          } else if(i === 2){
            return "red";
          }
      })
      .style('stroke', function (d, i) {
          if(i === 0){
            return "green";
          } else if(i === 1){
            return "blue";
          }else if(i === 2){
            return "red";
          }
      });
  groups.exit().remove();

  lines = groups.append('svg:path')
      .attr("class", "line")
      .attr("d", d3.svg.line.radial()
          .radius(function (d) {
              return 0;
          })
          .angle(function (d, i) {
              if (i === 5) { //TODO numberAxes var
                  i = 0;
              } //close the line
              return (i / 5) * 2 * Math.PI; //TODO numberAxes var
          }))
      .style("stroke-width", 3)
      .style("fill", "none");

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
          if (i === 5) { //TODO numberAxes var
              i = 0;
          } //close the line
          return (i / 5) * 2 * Math.PI; //TODO numberAxes var
      }));
};
