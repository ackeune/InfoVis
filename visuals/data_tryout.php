<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>D3 Test</title>
		<style>
        
            /* Note: css styles will be overwritten by D3 attributes  */
            
            body { /* HTML element selector */
                background-color: #FBF2EF;
            }

			           
            p {
                font-size: 11px;
                color: black;
                background-color: gray;
                font-style: bold;
                font-family: sans-serif;
                padding-top:10px;
                padding-bottom:10px;
                padding-right:5px;
                padding-left:5px;
                margin: 0px;
            }
            
            #missingcountries {
                font-size: 10px;
                background-color: #a2a2a2;
                padding:10px;
            }
            #rect-demo { /* id selector,  used to specify a style for a single, unique element */
                fill: red;
                stroke: black;
            }
            
            .barplot { /* class selector, used to specify a style for a group of elements */
                background-color: #e5eecc;
                fill: #8ac007;
            }
            
            #maps { /* id selector,  used to specify a style for a single, unique element */               
                background-color: #364765;
            }
            
            .bar {
              fill: steelblue;
            }
            
            .xaxis path,
            .xaxis line {
                fill: none;
                stroke: black;                
                stroke: black;                
            }
            
            .xaxis text {
                font-family: sans-serif;
                font-size: 9px;
                font-style: bold;
            }
            
            .yaxis path,
            .yaxis line {
                fill: none;
                stroke: black;                
                stroke: black;                
            }
            
            .yaxis text {
                font-family: sans-serif;
                font-size: 10px;
            }
            
            .tooltip  {
                background-color: steelblue;
                font-family: sans-serif;
                font-size: 10px;
            }
            
            table {   
                border: 1px solid black;
                border-collapse:collapse;
            }
            td, th {
                text-align:left;
                padding: 1px 4px;
            }
            
            #minuteswork  {
                font-size: 8px;    
                font-family: sans-serif;           
                background-color: #ececec;
                font-family: sans-serif;
            }
            
            .legend  {
                font-family: sans-serif;
                font-size: 9px;
                font-style: bold;
            }  
            
            #grouped-bars .xaxis path {
                display: none;              
            }
                         
            /*svg {
                shape-rendering: crispEdges;
            }*/
		</style>
		
        <script type="text/javascript" src="http://d3js.org/d3.v3.min.js"></script>
		<script type="text/javascript" src="fisheye.js"></script>
        <script type="text/javascript" src="http://code.jquery.com/jquery-latest.js"></script>
        <script src="tabbedContent.js" type="text/javascript"></script>
        <script type="text/javascript" src="sugar-1.3.9.min.js"></script>
        
        <div id = maps>            
            <p>Life expectancy (use scrollwheel to zoom, mouse to pan)</p>
            <div id="map-world2"> </div>
         </div>
        
        <p>Life expectancy plot using <b>merged_db_20130313.csv</b> </p>
        <div id="bars-example"></div>
     	
     	
     	
     	<p>How many minutes to work for coffee, bread, and 1/10 th of a pair of jeans. <br/>
     	    Using <b>merged_db_20130313.csv</b> <br/>
     	    <p id="missingcountries"></p>
 	    </p>
     	<div id="grouped-bars"></div>
        
        <p> Table showing the same</p>
        <div id ="table-example"> </div>
        
         <p id="debug">
            <b>Debug info</b>
            <br>
         </p>
        
        </div>
        
        <div id="images"</div>
    </head>
    <body>	
		
		
		
    <script>
       
     /////////////
    // world map 2
    /////////////
    var fisheye = d3.fisheye.circular()
        .radius(200)
        .distortion(2);
    
    
        
    var svgMapWorld2 = d3.select("#map-world2").
                        append("svg").
                            attr("x", 0).
                            attr("y", 0).
                            attr("width", 900).
                            attr("height",500).
                            attr("pointer-events", "all").
                        append("g")
                            .call(d3.behavior.zoom().on("zoom", redraw));
                            
                        
    
    var groupMapWorld2a = svgMapWorld2.append("g").
            attr("id", "group-map-world2").
            attr("class", "LifeExpectancyCountry").               
            attr("x", 0).
            attr("y", 0);
            
      groupMapWorld2a.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("opacity", .5)
                .attr("width", 900)
                .attr("height",500);
  
    var vis = groupMapWorld2a;           
    function redraw() {
      trans=d3.event.translate;
      scale=d3.event.scale;
      vis.attr("transform",
          "translate(" + trans + ")"
          + " scale(" + scale + ")");
    }
    
    var groupMapWorld2 = groupMapWorld2a;
    
    d3.json("all-countries.json", function(error, collection) {
    
        if (error) {  
            document.getElementById("debug").innerHTML += "Error loading world map file <br>"; 
            return console.warn(error); 
        }
        //console.log(collection);
    
        groupMapWorld2.selectAll("path").
            data(collection.features).
            enter().
            append("path").
                attr("stroke", "black").
                attr("id", function(data) { return data.properties.name; }).   
                //style("fill", function(d) { return '#'+Math.floor(d.properties.name.charCodeAt(0)/100*4620980).toString(16); }).                   
                attr("d", d3.geo.path().projection(d3.geo.mercator().scale(500).rotate([-10,0,0])));
      
   
    
    
        var rows; // first
        d3.csv("life_expectancy_per_country_CIA.csv", function(data) { // third
            rows = data;
            console.log(rows);            
            doSomethingWithRows();
        });        
        //second
        
        function doSomethingWithRows() {
             var rank = [], countryName = [], years =[];
             //console.log(rows);
             //document.getElementById("debug").innerHTML += d.COUNTRY + "<br>";
             document.getElementById("debug").innerHTML += "loaded separate life exp. per country (rows) <br>";
             rows.map(function(d) {
                rank.push(d.RANK);
                countryName.push(d.COUNTRY);
                years.push(d.YEARS);
            })
            //console.log(rows);
           
           /*groupMapWorld2.selectAll("path").
                data(rows, function(d){return d.id;}).
                    attr("stroke", "black").
                    attr("id", function(data) { return data.COUNTRY; });
                    style("fill", function(data) { return '#'+Math.floor(data.COUNTRY.charCodeAt(0)/100*4620980).toString(16); }).                   
                    
            */

            groupMapWorld2.selectAll("path").
                //data(rows).
                style("fill", function(d) {
                    var fillColor = "black";
                    
                    //document.getElementById("debug").innerHTML += this.id ;   // json country names
                    var matched = false;
                    
                    for(var i in countryName) { // maybe better use jQuery, for for-each loops
                        //console.log(countryName[i]);
                        //alert(countryName[i]);
                        
                        
                        if(countryName[i] == this.id){
                            matched = true;
                            //document.getElementById("debug").innerHTML += " == " + countryName[i] + " <br>"; 
                            this.years = years[i];
                            fillColor = colorLEFunction(years[i]);
                        }
                        
                    }  
                    if (matched == false) {
                        // document.getElementById("debug").innerHTML += " == ???????? <br>"; 
                    }
                    return fillColor;                               
                })
               // .on("mouseover", function(){return tooltip.style("visibility", "visible");})
                .on("mouseover", function(d){return tooltip.text(this.id + ": " + this.years).style("visibility","visible");})
                .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
                .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
         }
     });
     
     var colorLEFunction = d3.scale.linear()
        .domain([40, 65,90])
        .range(["darkred", "pink", "#0b640d"]);

    var tooltip = d3.select("body")
        .append("div")
        .attr("class","tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("color", "white")
        .text("a simple tooltip");
   
    
    ////////////////
    // bar chart
    ///////////////////
   
 
    var barWidth = 40;
    var diagramWidth = 3000;
    var diagramHeight = 400;
    var xAxisHeight = 20;
    // d3.scale.linear() returns a function
    
    var xFun = d3.scale.ordinal()
                .rangeRoundBands([0, diagramWidth], .3);
              //  domain([0, exampleData.length]).
                //.range([0, diagramWidth]);
  
  
    var yFun = d3.scale.linear().    
               range([diagramHeight, 0]);
    
    var xAxis = d3.svg.axis()
        .scale(xFun)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(yFun)
        .ticks(5)
        .orient("right");


    var barsExample = d3.select("#bars-example").
        append("svg"). // inserts <svg .. > tag in div 
        attr("width", diagramWidth).
        attr("height", diagramHeight+20);
    
    //document.getElementById("debug").innerHTML += "selected #bar-demo <br>"; 

    
    var allData; // first
    d3.csv("merged_db_20130313.csv", function(error, data) { // third
        allData = data;
        console.log(allData);       
        var countryArray = new Array(1);
        var yearsArray = new Array(1);
        data.forEach(function(d) {
            //document.getElementById("debug").innerHTML += "d: " + d.YEARS + " <br>";  
            countryArray.push(d.COUNTRY);
            yearsArray.push(d.YEARS);                
           // document.getElementById("debug").innerHTML += "country: " + d.COUNTRY + " <br>";  
          //  document.getElementById("debug").innerHTML += "years: " + d.YEARS + " <br>";  
            if (d.COUNTRY ) {
                d.YEARS = +d.YEARS;
            }
        });      
        
        
        xFun.domain(data.map(function(d) {   return d.COUNTRY; }   ));
        yFun.domain([0, d3.max(data, function(d) { return d["YEARS"]; })]);
        
        document.getElementById("debug").innerHTML += "max years: " + d3.max(data, function(d) { return d["YEARS"]; }) + " <br>";  
            
        barsExample.selectAll(".bar")
            .data(data)
            .enter()
                .append("rect")
                    .attr("class","bar")
                    .attr("x", function(d) {return xFun(d.COUNTRY); })
                    .attr("width", xFun.rangeBand())
                    .style("fill", function(d) { if (isNaN(d.YEARS)) {
                                                    return "red";
                                                }
                                                else {
                                                    return this.fill;
                                            }})
                    .attr("y", function(d) { if (isNaN(d.YEARS)) {
                                                    return diagramHeight - 10;
                                                }
                                                else {
                                                    return yFun(d.YEARS);
                                            }})
                    .attr("height", function(d) { 
                                                    if (isNaN(d.YEARS)) {
                                                        return yFun(10);
                                                    }
                                                    else {
                                                        return diagramHeight- yFun(d.YEARS);
                                                    }
                                                });
                                                
        barsExample.append("g")
            .attr("class","xaxis")
            //.attr("transform", "translate(200,100)rotate(180)")
            .attr("transform", "translate(0," + (diagramHeight ) + ")")
            .call(xAxis)
                .selectAll("text")  
                .style("text-anchor", "end")
                .attr("dx", "-0.6m")
                .attr("dy", -5.5)  // why...??
                .attr("transform", function(d) {
                    return "translate(0,-5),rotate(70)" 
                });
            
        barsExample.append("g")
            .attr("class", "yaxis")
            .attr("transform", "translate(" + 10 + ",0)")
            .call(yAxis);
                    
    });  
   
    
	/////////////////
	// table
	///////////////
	var productNames = ["cappuccino", "bread", "jeans"];
	
	var workData = [];
	var workData2 = [];
	
	function Product(name, cost)  {
     this.name = name;
     this.cost = cost;
    }

	d3.csv("merged_db_20130313.csv", function(error, data) { // third
	    document.getElementById("debug").innerHTML += "got in table cvs reading function <br>";  
        
        //console.log(matrixData);
        data.forEach(function(d) {
            // /document.getElementById("debug").innerHTML += "d: " + d.COUNTRY + " <br>";  
            var obj = {};
            obj["country"]= d["COUNTRY"];
            obj["wage per minute"] = d["GROSS WAGE PER MINUTE"];
            obj["cappuccino cost"]=  d["Cappucinno USD"];
            obj["jeans cost"] = d["Pair of Levis jeans USD"];
            obj["bread cost"] = d["Loaf of bread USD"];
            workData.push(obj);    
            
            var obj2 = {};
            obj2["country"]= d["COUNTRY"];
            obj2["wage per minute"] = d["GROSS WAGE PER MINUTE"];
            obj2["products"] = [];
            obj2["products"].push( new Product("cappuccino", d["Cappucinno USD"]) );
            obj2["products"].push( new Product("jeans", d["Pair of Levis jeans USD"]) );
            obj2["products"].push( new Product("bread", d["Loaf of bread USD"]) );
            
            workData2.push(obj2);           
           // document.getElementById("debug").innerHTML += "country: " + d.COUNTRY + " <br>";  
          //  document.getElementById("debug").innerHTML += "years: " + d.YEARS + " <br>";             
        }); 
        console.log("workData2:");
        console.log(workData2);
        fillMatrixMinutes();        
        calcMissingCountries();
        
        makeGroupedBars(workData2);
        
        removeTest(workData2);
        
        showMinutesTable();
    });     
    
    function calcMissingCountries() {
        var nrNoWage= workData2.count(function(el) { return !(isNumber(el["wage per minute"])); });
        
        var nrNoNumbeo = workData2.count(function(el) { return (isNumber(el["wage per minute"]) && 
                                                            el["products"].count(function(p) { 
                                                                    return !isNumber(p.cost);
                                                                }) == productNames.length
                                                            ); });
                                                            
        var nrWageAndAllNumbeo = workData2.count(function(el) { return (isNumber(el["wage per minute"]) && 
                                                            el["products"].count(function(p) { 
                                                                    return isNumber(p.cost);
                                                                }) == productNames.length
                                                            ); });
                                                            
        var nrWageAndSomeNumbeo = workData2.count(function(el) { return (isNumber(el["wage per minute"]) && 
                                                            el["products"].count(function(p) { 
                                                                    return isNumber(p.cost);
                                                                }) > 0
                                                            ); });
        
        document.getElementById("missingcountries").innerHTML += nrNoWage + " countries have no wage info <br>";
        document.getElementById("missingcountries").innerHTML += nrNoNumbeo + " countries do have wage info, but no Numbeo product cost info <br>";
        document.getElementById("missingcountries").innerHTML += nrWageAndAllNumbeo + " countries do have wage info, and ALL Numbeo product's cost info <br>";
        document.getElementById("missingcountries").innerHTML += nrWageAndSomeNumbeo + " countries do have wage info, and at least 1 Numbeo product cost info <br>";
    }
    
    function fillMatrixMinutes(){
        for (var i=0; i < productNames.length; i++) {
            document.getElementById("debug").innerHTML += "product name: " + productNames[i] + " <br>";             
            fillMinutesMatrix(workData, productNames[i]);
            fillMinutesMatrix2(workData2, productNames[i]);        
        }
    }
    
    function showMinutesTable() {
        var showCost = true;
        makeMinutesTable(workData, productNames, showCost);
    }
    
    function fillMinutesMatrix2(workData2, productName) {       
       for (var i=0; i < workData2.length; i++) {     
           for (var j=0; j < workData2[i]["products"].length; j++) {
              if (productName == workData2[i]["products"][j].name) {
               workData2[i]["products"][j]["minutes"] = calcMinutesToWork(workData2[i]["products"][j]["cost"], workData2[i]["wage per minute"]);
            } 
           }    
           //workData[i]["minutes to work for " + productName] = calcMinutesToWork(workData[i][productName +" cost"], workData[i]["wage per minute"]);
       } 
    } 
    
    function fillMinutesMatrix(workData, productName) {       
       for (var i=0; i < workData.length; i++) {            
           workData[i]["minutes to work for " + productName] = calcMinutesToWork(workData[i][productName +" cost"], workData[i]["wage per minute"]);
       } 
    } 
    
    function calcMinutesToWork(productCost, wageInMinutes) {            
        var minutes = 0;
        if (isNumber(productCost) && isNumber(wageInMinutes)) {
            minutes = productCost / wageInMinutes;  
            if (!isNumber(minutes)) { // bijv. kan Infinity zijn als wageInMinutes 0 is
                minutes = 0;
            }              
        }
        return minutes;
    }      

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function makeMinutesTable(matrixData, productNames, showCost) {
        var columns = ["country", "wage per minute"];
        
        for (var i=0; i < productNames.length; i++) { 
            if (showCost == true) {
                columns.push(productNames[i] + " cost");
            }
            columns.push("minutes to work for " + productNames[i]);
        }   
        var peopleTable = tabulate(matrixData, columns);

    }
    
    function tabulate(data, columns) {
        var table = d3.select("#table-example").
                        append("table").
                        attr("id","minuteswork");
                        
        var thead = table.append("thead"),
            tbody = table.append("tbody");
        
        // append the header row
        thead.append("tr")
            .selectAll("th")
            .data(columns)
            .enter()
            .append("th")
                .text(function(column) { return column; });
        
        // create a row for each object in the data
        var rows = tbody.selectAll("tr")
            .data(data)
            .enter()
            .append("tr");
        
        
        // create a cell in each row for each column
        var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
            .text(function(d) { return d.value; });
    
            
        return table;
    }
    
    function makeGroupedBars(workData2) {
        
        // jeans = jeans/10
        var thisProductNames =  productNames.map(function(name) { if (name == "jeans") {
                                                                         return "1/10 jeans";//"(1/10)" + name;
                                                                 } 
                                                                else {
                                                                    return name;
                                                                } });;
        // jeans = jeans/10
        for (var i=0; i < workData2.length; i++) {     
            for (var j=0; j < workData2[i]["products"].length; j++) {
                
                if ("jeans" == workData2[i]["products"][j].name) {
                    if (workData2[i]["products"][j]["minutes"] > 0) {
                        workData2[i]["products"][j]["minutes"] =  workData2[i]["products"][j]["minutes"]/10;   
                    }
                    workData2[i]["products"][j].name =  "1/10 " + workData2[i]["products"][j].name;           
                } 
            }    
       } 
       
        var margin = {top: 10, right: 35, bottom: 210, left: 35},
            width = 2000 - margin.left - margin.right,
            height = 1000 - margin.top - margin.bottom;
            
        var x0 = d3.scale.ordinal()
            .rangeRoundBands([0, width],.1);
        
        var x1 = d3.scale.ordinal();
        
        var y = d3.scale.linear()
            .range([height, 0]);
        
        var colorBars = d3.scale.ordinal()
            .range(["#98abc5",  "#6b486b",  "#ff8c00"]);
        
        var xAxis = d3.svg.axis()
            .scale(x0)
            .orient("bottom");
        
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");
        
        var groupedBarSvg = d3.select("#grouped-bars")
                                .append("svg")
                                .attr("width", width + margin.left + margin.right)
                                .attr("height", height + margin.top + margin.bottom)
                                .append("g")
                                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x0.domain(workData2.map(function(d) { return d.country; }));
        x1.domain(thisProductNames).rangeRoundBands([0, x0.rangeBand()]);
        
        var maxMinutes = d3.max(workData2, function(d) { return d3.max(d.products, function(d) { return d.minutes; }); });
        y.domain([-10, maxMinutes]);
    
        document.getElementById("debug").innerHTML += "max minutes: " + maxMinutes + " <br>";
        
        groupedBarSvg.append("g")
          .attr("class", "xaxis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
          .selectAll("text")  
                .style("text-anchor", "end")
                //.attr("dx", "3em")
                .attr("dy", -7)  // why...??
                .attr("transform", function(d) {
                        return "translate(0,7),rotate(-80)";
                    });
                
        groupedBarSvg.append("g")
              .attr("class", "yaxis")
              .call(yAxis)
                .append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("x", 0 - (height/4))
                  .attr("y", 6)
                  .attr("dy", ".71em")
                  .style("text-anchor", "end")
                  .text("Minutes of work");
                  
      var country = groupedBarSvg.selectAll(".country")
                        .data(workData2)
                            .enter().append("g")
                              .attr("class", "countrybars")
                              .attr("transform", function(d) { return "translate(" + x0(d.country) + ",0)"; });
                
        country.selectAll("rect")
                .data(function(d) { return d.products; })
                .enter()
                .append("rect")
                  .attr("width", x1.rangeBand())
                  .attr("x", function(d) { return x1(d.name); })
                  .attr("y", function(d) { return y(d.minutes); }  )
                  .attr("height", function(d) {  return height - y(d.minutes);  })
                  .style("fill", function(d) { return colorProducts(d.name, d.minutes); });
    
        function colorProducts(name, minutes) {
            if (minutes == 0) {
                return "red";
            }
            else {
                return colorBars(name);
            }
        }
        
        var legendPosition = {x: 50, y: 10, dimensionsRect: 15};
        
         var legend = groupedBarSvg.selectAll(".legend")
              .data(thisProductNames/*.slice().reverse()*/)
                .enter()
                    .append("svg")
                      .attr("y", legendPosition.y)                      
                      .append("g")
                        .attr("class", "legend")
                        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        
          legend.append("rect")
              .attr("x", legendPosition.x)
              .attr("width", legendPosition.dimensionsRect)
              .attr("height", legendPosition.dimensionsRect)
              .style("fill", colorBars);
        
      
          legend.append("text")          
              .attr("x", legendPosition.x + legendPosition.dimensionsRect + 5)
              .attr("y", legendPosition.y )
              .attr("dy", ".35em")
              .style("text-anchor", "begin")
              .text(function(d) { return d; });   
    }
    
    function removeTest(workData2) {
        workData2.remove(function(el) { return el.country === "Uganda"; });
        
        var groupedBarSvg = d3.select("#grouped-bars");
        var country = groupedBarSvg.selectAll("countrybars")
                        .data(workData2);
        country.exit().remove();
                        
            /* country.selectAll("rect")
                .data(function(d) { return d.products; })
                .exit().remove();*/
    }
    
    </script>
        
        
    </body>
</html>     