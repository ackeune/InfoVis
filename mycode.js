window.onload = loadD3Data; 

window.dataRead = false;
var mapLoaded = false;

var databaseFilename = "merged_db_20130407.csv";
window.productNames = ["cappuccino", "jeans", "bread", "internet", "sneakers", "movie", "prepaid", "mcdonalds"];
window.selectedProductNames = ["cappuccino", "bread", "jeans", "movie"];

var productNamesToText = new Array();
productNamesToText["cappuccino"] = "a cappuccino in a restaurant";
productNamesToText["bread"] = "a loaf of fresh white bread";
productNamesToText["jeans"] = "a pair of brand jeans (e.g. Levis 501)";
productNamesToText["movie"] = "a cinema ticket";
productNamesToText["internet"] = "a month of internet (cable/ADSL)",
productNamesToText["sneakers"] = "a pair of Nike sneakers";
productNamesToText["prepaid"] = "1 min of mobile prepaid",
productNamesToText["mcdonalds"] = "a combo meal at McDonalds";

var countryColors = {};
var absentColor = "#1e6166";
var noWageColor = "rgba(200, 54, 54, 0.1)";//absentColor;// "#2b929b";
var maxMinutes;
var minMinutes;

var count; // hoeveel landen selected
if (!count) {
    count = 0;
}


var maxNrSelectedCountries = 10;
var dummyColor = "#ffffff"; // added so that check when too much countries added deosn't break
var outlineColorsCountries = [
    "#ed1c24",
    "#f15a29",
    "#fff100",
    "#94e01b",
    "#4dd5ff",
    "#1e29f7",
    "#0e0e51",
    "#763cd3",
    "#631f4c",
    "#ec008b",
     dummyColor].reverse();

 var nrBars = 5;

/////////   needed:
///////// lijst me landen afkortingen synnoniemen (GB/UK enz.)

//////////
// merged_db inlezen
/////////

function Product(name, cost) {
    this.name = name;
    this.cost = cost;
}

function loadD3Data() {
    var deferred = $.Deferred();

    setTimeout(function() {
        if (true || !sessvars.workData2 || !sessvars.codeToName) { // niet elke keer inlezen bij POST refresh
            sessvars.workData2 = [];
            sessvars.codeToName = {};

            d3.csv(databaseFilename, function(error, data) {

                data.forEach(function(d) {

                    var obj2 = {};
                    obj2["country"] = d["COUNTRY"];
                    obj2["cc"] = d["CC"];
                    obj2["years"] = d["YEARS"];
                    // country code
                    obj2["wage per minute"] = d["GROSS WAGE PER MINUTE"];
                    obj2["products"] = [];
                    obj2["products"].push(new Product("cappuccino", d["Cappucinno USD"]));
                    obj2["products"].push(new Product("jeans", d["Pair of Levis jeans USD"]));
                    obj2["products"].push(new Product("bread", d["Loaf of bread USD"]));
                    obj2["products"].push( new Product("internet", d["Internet  USD"]));
                    obj2["products"].push( new Product ("sneakers", d["Nike sneakers USD"]));
                    obj2["products"].push(new Product("movie", d["Movie ticket USD"]));
                    obj2["products"].push( new Product ("prepaid", d["1mn prepaid mobile USD"]));
                    obj2["products"].push( new Product ("mcdonalds", d["McDonalds meal USD"]));
                    sessvars.workData2.push(obj2);
                    sessvars.codeToName[d["CC"].toLowerCase()] = d["COUNTRY"];
                });
                fillMatrixMinutes();
                noProductsNoWage();              
                window.dataRead = true;
            });            
        }
        deferred.resolve();
    }, 100);
    
    return deferred.promise();
}

function fillMatrixMinutes() {
    for (var i = 0; i < productNames.length; i++) {
        fillMinutesMatrix(productNames[i]);
    }
}

function fillMinutesMatrix(productName) {
    for (var i = 0; i < sessvars.workData2.length; i++) {
        for (var j = 0; j < sessvars.workData2[i]["products"].length; j++) {
           
            if (productName == sessvars.workData2[i]["products"][j].name) {
                sessvars.workData2[i]["products"][j]["minutes"] = calcMinutesToWork(sessvars.workData2[i]["products"][j]["cost"], sessvars.workData2[i]["wage per minute"]);
                
                if (isNumber(sessvars.workData2[i]["years"])) {
                    sessvars.workData2[i]["products"][j]["percentage"] =  calcPercentage(sessvars.workData2[i]["years"], sessvars.workData2[i]["products"][j]["minutes"]) 
                }
                else {
                    sessvars.workData2[i]["products"][j]["percentage"] = 0;
                }
            }
        }
    }
}

function noProductsNoWage() {
    
    for (var i = 0; i < sessvars.workData2.length; i++) {
       var maxProduct =  _.max(sessvars.workData2[i]["products"], function(prod){if(isNumber(prod.cost)) {return prod.cost;} else {return 0;}});
       var maxPrice = maxProduct.cost;
       if (!isNumber(maxPrice) || maxPrice == 0) { // no data for any product
            sessvars.workData2[i]["wage per minute"] = "-"; // act like doesnt have min. wage so it gets out of the map
       }
   }
    

}

function calcMinutesToWork(productCost, wageInMinutes) {
    var minutes = 0;
    if (isNumber(productCost) && isNumber(wageInMinutes)) {
        minutes = productCost / wageInMinutes;
        if (!isNumber(minutes)) {// bijv. kan Infinity zijn als wageInMinutes 0 is
            minutes = 0;
        }
    }
    return minutes;
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}


//////////
// jqv map
/////////

// aangeroepen als je op geselecteerd land in map klikt
function removeStroke(code) {

    var countries = sessvars.countries;

    if (window.SVGAngle) {
        countries[code].setAttribute("stroke", "none");
        countries[code].setAttribute("stroke-width", 0);
        countries[code].setAttribute("stroke-opacity", 0);
    } else {
        countries[code].stroked = false;
        countries[code].strokeColor = "#f00";
    }
 
    var countryAndColor = _.find(countriesAndColors, function(el){ return el.code === code; });
    outlineColorsCountries.push(countryAndColor.color);
    countriesAndColors = _.reject(countriesAndColors, function(el) { return el.code === code; });
    
    $('#li_' + code).remove();
    count--;
    checkButton(code);
}

// aangeroepen als je op land in map klikt
function putStroke(code, region) {
    var countries = sessvars.countries;

    countryMatrixData = _.find(sessvars.workData2, function(el) { return el.cc.toLowerCase() == code; });    
    var active = isNumber(countryMatrixData['wage per minute']);
    //sessvars.ccValues[code] != absentColor;
    if (active) {
        var newColor = outlineColorsCountries.pop();
        
        if (window.SVGAngle) {
            countries[code].setAttribute("stroke", newColor);
            countries[code].setAttribute("stroke-width", 3);
            countries[code].setAttribute("stroke-opacity", 1);
        } 
        else {
            countries[code].stroked = true;
            countries[code].strokeColor = newColor;
        }
   
        countriesAndColors.push({code: code, color: newColor});
        $('#location-selected').append('<li id=\"li_' + code + '\" onclick=\"deselectCountry(\'' + code + '\')\;\"><input type=\"hidden\" name=\"countries\[\]\" value=\"' + code + '\" \/>' + sessvars.codeToName[code] + ' </li>');

        count++;
        checkButton(code);
    }
}

// aangeroepen als je op naam in selectbox klinkt
function selectCountry(cc) {    
    var countries = sessvars.countries;

    ccV = cc.value.toLowerCase();

    if (!(_.some(countriesAndColors, function(el) {return el.code === ccV;}))){
        var newColor = outlineColorsCountries.pop();
        if (window.SVGAngle) {
            countries[ccV].setAttribute("stroke", newColor);
            countries[ccV].setAttribute("stroke-width", 4);
            countries[ccV].setAttribute("stroke-opacity", 1);
        } else {
            countries[ccV].stroked = true;
            countries[ccV].strokeColor = newColor;
        }
      
        countriesAndColors.push({code: ccV, color: newColor});
        
        var option = cc.options[cc.selectedIndex];

        var ul = document.getElementsByTagName('ul')[0];

        var choices = ul.getElementsByTagName('input');
        for (var i = 0; i < choices.length; i++)
            if (choices[i].value == option.value)
                return;

        var li = document.createElement('li');
        var input = document.createElement('input');
        var text = document.createTextNode(option.firstChild.data);
        input.type = 'hidden';
        input.name = 'countries[]';
        input.value = option.value.toLowerCase();
        li.appendChild(input);
        li.appendChild(text);
        li.setAttribute('id', 'li_' + ccV);        
        li.setAttribute('onclick', 'deselectCountry(\"' + input.value + '\");');
        
        $('#location-selected').append(li);
        
        count++;
        checkButton(ccV);
    }
}


// aangeroepen als je op naam in geselecteerden-lijstje klikt
function deselectCountry(cc) {
    var code = cc.toLowerCase();    
    var countries = $('#my_jqvmap').data('mapObject').countries;

    if (window.SVGAngle) {
        countries[code].setAttribute("stroke", "none");
        countries[code].setAttribute("stroke-width", 0);
        countries[code].setAttribute("stroke-opacity", 0);
    } else {
        countries[code].stroked = false;
        countries[code].strokeColor = "#f00";
    }

    var countryAndColor = _.find(countriesAndColors, function(el){ return el.code === code; });    
    outlineColorsCountries.push(countryAndColor.color);
    countriesAndColors = _.reject(countriesAndColors, function(el) { return el.code === code; });
    
    $(function() {
        $('#li_' + code).remove();
    });

    count--;
    checkButton(code);
}

// check of genoeg landen geselecteerd zijn
function checkButton(code) {
    if (count > 0) {
        document.getElementById("submitbutton").disabled = false;
        
        if (count > maxNrSelectedCountries) {          
            deselectCountry(code);
                  
        }
    } else if (count == 0) {
        document.getElementById("submitbutton").disabled = true;
    }
}


//////////
// coloring
/////////

// hier beter gelijk de kleuren berekenen (zijn nu getalswaarden voor in jqvmap)
function getCountryColorValues(selectedProducts) {
    var deferred = $.Deferred();
    
    setTimeout(function() {
        if (true || !sessvars.ccValues || sessvars.ccValues.length == 0) {
        
            
            var minutes = {};
            var colors = {};
            var absentMinutes = -1;
            var maxMinutesC;
            maxMinutes = 0;
            var minMinutesC;
            minMinutes = 999999999;
       
            sessvars.workData2.forEach(function(d) {
            
                var totalMinutes;

                if (isNumber(d["wage per minute"])) {
                    var productsWithCost = _.filter(d["products"], function(product) {
                        return _.contains(selectedProducts, product.name) && isNumber(product["cost"]);
                    });
                    var hasAll = productsWithCost.length == selectedProducts.length;

                    if (hasAll) {
                        totalMinutes = _.reduce(d["products"], function(memo, prod) {
                            if (_.contains(selectedProducts, prod.name)) {
                                return memo + prod.minutes;
                            }
                            else {
                                return memo;
                            }
                        }, 0);
                        
                        minutes[ d["cc"].toLowerCase()] = totalMinutes;

                        if (totalMinutes > maxMinutes) {
                            maxMinutes = totalMinutes;
                        }
                        else if (totalMinutes < minMinutes) {
                            minMinutes = totalMinutes;
                        }
                    } else {
                        minutes[ d["cc"].toLowerCase()] = absentMinutes;
                    }
                } else {
                    minutes[ d["cc"].toLowerCase() ] = absentMinutes-1;
                }
            });

            colorFun.domain([minMinutes, maxMinutes]);
            
            sessvars.workData2.forEach(function(d) {
                
                colors[ d["cc"].toLowerCase()] = colorFun(minutes[ d["cc"].toLowerCase()]);
                if (minutes[ d["cc"].toLowerCase()] == absentMinutes) {
                    colors[ d["cc"].toLowerCase()] = absentColor;
                }
                else if (minutes[ d["cc"].toLowerCase()] == absentMinutes-1) {
                    colors[ d["cc"].toLowerCase()] = noWageColor;
                }
                else {
                    colors[ d["cc"].toLowerCase()] = colorFun(minutes[ d["cc"].toLowerCase()]);
                }
            });
            sessvars.ccValues = colors;
            sessvars.cmValues = minutes;
        }
        deferred.resolve();
    }, 1000);
}
    
function getCountryColorValues_noTimeOut(selectedProducts) {
    

    if (true)/*(!sessvars.ccValues || sessvars.ccValues.length == 0) */{
        var minutes = {};
        var colors = {};
        var absentMinutes = -1;

        var maxMinutesC;
        maxMinutes = 0;
        var minMinutesC;
        minMinutes = 999999999;
        
        sessvars.workData2.forEach(function(d) {
            
            var totalMinutes;
            
            
                if (isNumber(d["wage per minute"])) {
                    if(selectedProducts.length > 0) {
                    var productsWithCost = _.filter(d["products"], function(product) {
                        return _.contains(selectedProducts, product.name) && isNumber(product["cost"]);
                    });
                    var hasAll = productsWithCost.length == selectedProducts.length;

                    if (hasAll) {
                        totalMinutes = _.reduce(d["products"], function(memo, prod) {
                            if (_.contains(selectedProducts, prod.name)) {
                                return memo + prod.minutes;
                            }
                            else {
                                return memo;
                            }
                        }, 0);
                        
                        minutes[ d["cc"].toLowerCase()] = totalMinutes;

                        if (totalMinutes > maxMinutes) {
                            maxMinutes = totalMinutes;
                        }
                        else if (totalMinutes < minMinutes) {
                            minMinutes = totalMinutes;
                        }
                    } else {
                        minutes[ d["cc"].toLowerCase()] = absentMinutes;
                    }
                }
                else {
                    minutes[ d["cc"].toLowerCase() ] = absentMinutes; 
                }
            }
            else {
                minutes[ d["cc"].toLowerCase() ] = absentMinutes-1;// no wage
            }
        });
        
        colorFun.domain([minMinutes, maxMinutes]);
        
        sessvars.workData2.forEach(function(d) {
            
            colors[ d["cc"].toLowerCase()] = colorFun(minutes[ d["cc"].toLowerCase()]);
            if (minutes[ d["cc"].toLowerCase()] == absentMinutes) {
                colors[ d["cc"].toLowerCase()] = absentColor;
            }
            else if (minutes[ d["cc"].toLowerCase()] == absentMinutes-1) {
                colors[ d["cc"].toLowerCase()] = noWageColor;
            }
            else {
                colors[ d["cc"].toLowerCase()] = colorFun(minutes[ d["cc"].toLowerCase()]);
            }
        });
        sessvars.cmValues = minutes;
        sessvars.ccValues = colors;                
    }
}

var colorFun = d3.scale.log().base(4.1).nice()
    .range(["#f3f3f3", "#1e1e1e"]);
    

function colorTest() {
    $('#my_jqvmap').vectorMap('set', 'colors', {
        us : '#8EE5EE',
        af : "#8e0505"
    });
}



function bla() {
    alert("bla");
}


function submitCountries() {    

    if (count > 0) {
        document.getElementById("spiderchart").innerHTML = "";
        document.getElementById("spiderchart2").innerHTML = "";
        document.getElementById("legend").innerHTML = "";
        makeSpiderChart(countriesAndColors);
        makeSpiderChart2(countriesAndColors);
        $('#secondtab').css("display", "inline"); 
    }
    else {
        $('#secondtab').css("display", "none"); 
    }
}

 function addProductData (img)
 {
    if (_.contains(selectedProductNames, img.id)) {
        img.src = 'images/icons/' + img.id + '-deseleted.png';
        selectedProductNames = _.without(selectedProductNames, img.id) ;
    }
    else {
         img.src = 'images/icons/' + img.id + '-seleted.png';
         selectedProductNames.push(img.id) ;
    }
     //getCountryColorValues(selectedProductNames);
    getCountryColorValues_noTimeOut(selectedProductNames);
    
    
    $('#my_jqvmap').vectorMap('set', 'colors', sessvars.ccValues);
    

    barChart() ;
    
 }  
 
function getTotalTextData(countryCode) {
    countryCode = countryCode.toUpperCase();
    countryMatrixData = _.find(sessvars.workData2, function(el) { return el.cc == countryCode; });
    countryMatrixProductData = _.filter(countryMatrixData.products, function (prod) { return _.contains(selectedProductNames, prod.name); });
    var text = "";
    var sum = 0;
    for(var i=0; i < countryMatrixProductData.length; i++) {
        sum = sum + countryMatrixProductData[i].minutes;
    }
    var arr =  rescaleMinutes(sum );
    var format = arr[0];
    var data = arr[1];
    text += data.toFixed(2)  + " " + format ;
    
    return text;
 }
 
 function getTextData(countryCode) {
    countryCode = countryCode.toUpperCase();
    countryMatrixData = _.find(sessvars.workData2, function(el) { return el.cc == countryCode; });
    countryMatrixProductData = _.filter(countryMatrixData.products, function (prod) { return _.contains(selectedProductNames, prod.name); });
    var text = "";
    for(var i=0; i < countryMatrixProductData.length; i++) {
    
        var arr =    rescaleMinutes(countryMatrixProductData[i].minutes );
        var format = arr[0];
        var data = arr[1];
        
        
        text += data.toFixed(2)  + " " + format + " for " + productNamesToText[countryMatrixProductData[i].name] + "</br>";
       
    }
    return text;
 }
 
  function getTextDataAllProducts(countryCode) {
    countryCode = countryCode.toUpperCase();
    countryMatrixData = _.find(sessvars.workData2, function(el) { return el.cc == countryCode; });
    countryMatrixProductData = _.filter(countryMatrixData.products, function (prod) { return _.contains(productNames, prod.name); });
    var text = "";
    for(var i=0; i < countryMatrixProductData.length; i++) {
        
        if (countryMatrixProductData[i].minutes  != 0 ) {
            var arr =    rescaleMinutes(countryMatrixProductData[i].minutes );
            var format = arr[0];
            var data = arr[1];
            
            
            text += "<b>"+ data.toFixed(2)  + " " + format + "</b> for " + productNamesToText[countryMatrixProductData[i].name] + "</br>";
        }
        else {
            text += "(no data for " + productNamesToText[countryMatrixProductData[i].name] + ")</br>";
        }
       
    }
    return text;
 }
 
 
function getTextDataPercentagesAllProducts(countryCode) {
    countryCode = countryCode.toUpperCase();
    countryMatrixData = _.find(sessvars.workData2, function(el) { return el.cc == countryCode; });
    countryMatrixProductData = _.filter(countryMatrixData.products, function (prod) { return _.contains(productNames, prod.name); });
    var text = "";
    for(var i=0; i < countryMatrixProductData.length; i++) {
    
        if (countryMatrixProductData[i].minutes != 0) {
            var data = calcPercentage(countryMatrixData["years"], countryMatrixProductData[i].minutes)
            text += "<b>"+data.toFixed(6)  + " %</b> of your life for " + productNamesToText[countryMatrixProductData[i].name] + "</br>";
        }
        else {
            text += "(no data for " + productNamesToText[countryMatrixProductData[i].name] + ")</br>";
        }
       
    }
    return text;
 }
 
 
 function yearsToMinutes(years) {
 
    var nrLeapYears = Math.floor(years % 4);
    var days = years * 365  ;
    days = days + nrLeapYears;
    var hours = days * 24;
    var minutes = hours * 60;
    return minutes;
 }
 
 function calcPercentage(totalYears, minutesWork) {
    var totalMinutesAlive = yearsToMinutes(totalYears);
    var percentageWorking = (100 / totalMinutesAlive) * minutesWork;
    return percentageWorking;
}
 
 function calcBarChartData() {
    
    var interval = maxMinutes - minMinutes;
    var newScale2 = colorFun.copy();
    newScale2.range([minMinutes,maxMinutes]);
    
    var barInterval = interval / nrBars;
    var nrCountriesPerBarRescaled = new Array(nrBars);
    var intervalNrPerBar = new Array(nrBars);
    var intervalNrPerBarReturned = new Array(nrBars);
    var intervalNumbers = new Array(nrBars);
    
    for (var i=0; i < nrBars; i++) {
        intervalNrPerBar[i] = barInterval * (i);
       intervalNrPerBarReturned[i] = barInterval * (i+1);
        nrCountriesPerBarRescaled[i] = 0;
        
    }
    
    sessvars.workData2.forEach(function(d) {
        var cc = d["cc"].toLowerCase();
        var active = sessvars.ccValues[cc] != absentColor && sessvars.ccValues[cc] != noWageColor;
        if (active) {
            for (var i = nrBars-1; i >= 0; i--) {
                if ((sessvars.cmValues[cc]) > intervalNrPerBar[i]) {
                    nrCountriesPerBarRescaled[i]++;
                    i=0;
                }
            }
        }
    });    
    return [nrCountriesPerBarRescaled, intervalNrPerBarReturned]
 }
 
 function rescaleMinutes (minutes) {
 
    if (minutes >= 60) {
        var hours = minutes / 60;
        if (hours >= 8) {
            var days = hours / 8;
            if (days >= 220) {
                var years = days / 220;
                return ["years", years];
            }
            return ["days", days];
        }
        return ["hours", hours];
    }
    return ["min", minutes];
 
 }
 
function setGradient(gradients, chart, id, startY,endY,startColor,endColor) {
    gradients[id] = chart
        .append("linearGradient");
        
    gradients[id].attr("y1", startY)
        .attr("y2", endY)
        .attr("x1", "0")
        .attr("x2", "0")
        .attr("id", "gradient"+id)
        .attr("gradientUnits", "userSpaceOnUse");
    
    gradients[id]
        .append("stop")
        .attr("offset", "0")
        .attr("stop-color", startColor);
        
    gradients[id]
        .append("stop")
        .attr("offset", "1")
        .attr("stop-color", endColor);
    
    
}

function formatNoDecimals(nr) {

    noDecimals = d3.format(".2s");
    if (!isNumber(nr) || nr < 0) {
        return 0;
    }
    else {
        return noDecimals(nr);
    }
    
}

function barChartOnce() {
 
    chartDataArray = calcBarChartData();
    nrCountriesPerBarRescaled = chartDataArray[0];
    intervalNrPerBar = chartDataArray[1];
    
    var w = 245,
        h = 110;
    var topmargin = 10;
    var leftmargin = 80;
    var barHeight = 15;
    
    
    var xFun = d3.scale.log().base(2)
        .domain([1, d3.max(nrCountriesPerBarRescaled)])
        .range([5, w-leftmargin-8]);
        
    var yFun = d3.scale.ordinal()
        .domain(d3.range(intervalNrPerBar.length))
        .rangeBands([topmargin, h+topmargin], .2);

    var chart = d3.select("#rectangles")
        .append("svg")
        .attr("id", "bars")
         .attr("width", w )
         .attr("height", h + 30);
    
   var formatSi = d3.format(".1s");
    var xAxis = d3.svg.axis()
            .scale(xFun)
            .ticks(5,function(d, i) {
                return formatSi(d) ;
            })
            .orient("bottom");
   
    
    
    var startY=30;
    var endY=40;
    var startColor="#ffffff";
    var endColor="#000000";
    
    var gradients = Array(4);
    
    colorFun2 = d3.scale.linear().range(["#f3f3f3", "#1e1e1e"]);
    
    var rects = chart.selectAll("rect").
        data(nrCountriesPerBarRescaled).
        enter().
        append("rect")
        .attr("x", function(datum, index) { return leftmargin; })
         .attr("y", function(datum, index) { return yFun(index); })
        .attr("fill", function(d, i) { return "#ac26d9"; } )    
         .transition().duration(600)
        .attr("width", function(datum, index) {   if(formatNoDecimals(datum) == 0) return 0; else return xFun(datum); })
        .attr("height", function(datum, index) { return barHeight; })
         .attr("fill", function(datum, index) { 
                                            if (index == 0) {
                                                startColor = colorFun(0);
                                            }
                                            else {
                                                startColor = colorFun(intervalNrPerBar[index-1]);
                                            }
                                            endColor = colorFun(intervalNrPerBar[index]);
                                            setGradient( gradients, chart,index,yFun(index),yFun(index)+barHeight,startColor,endColor);
                                            return "url(#gradient"+index+")"; });
    
                    
     chart.selectAll("text").
                data(intervalNrPerBar).
                enter().
                append("text").
                attr("x", function(datum, index) { return 0 ; } ).
                attr("y", function(datum, index) { return yFun(index); } ).
                attr("dx", "1.2em").
                attr("dy", 9).
                attr("text-achor","start"). 
                text( function(datum) { var arr = rescaleMinutes(datum); return "Up to " + formatNoDecimals(arr[1]) + " " + arr[0]; } )
                    .attr("class", "yaxistext");
     
     chart.append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate("+leftmargin+"," + (h+20) + ")")
      .call(xAxis)    
          
          .selectAll("text")                  
                .style("text-anchor", "begin")
                .attr("dy", -13) ; // why...??
   
     chart.append("text").              
              attr("x", leftmargin-10).
              attr("y", h+20).
              attr("dy", -5) .
              attr("class","xaxis").
              attr("text-anchor", "end").
              text("Nr. of countries");
}



 function barChart() {
 
    chartDataArray = calcBarChartData();
    nrCountriesPerBarRescaled = chartDataArray[0];
    intervalNrPerBar = chartDataArray[1];
        
    var w = 245,
        h = 110;
    var topmargin = 10;
    var leftmargin = 80;
    var barHeight = 15;
    
    
    var xFun = d3.scale.log().base(2)
        .domain([1, d3.max(nrCountriesPerBarRescaled)])
        .range([5, w-leftmargin-8]);
        
    var yFun = d3.scale.ordinal()
        .domain(d3.range(intervalNrPerBar.length))
        .rangeBands([topmargin, h+topmargin], .2);

    var chart = d3.select("#rectangles").select("#bars");
    
    var formatSi = d3.format(".1s");
    var xAxis = d3.svg.axis()
            .scale(xFun)
            .ticks(5,function(d, i) {
                return formatSi(d) ;
            })
            .orient("bottom");
   
    
    
    var startY=30;
    var endY=40;
    var startColor="#ffffff";
    var endColor="#000000";
    
    var gradients = Array(4);
    
    colorFun2 = d3.scale.linear().range(["#f3f3f3", "#1e1e1e"]);
    
    var rects = chart.selectAll("rect").
        data(nrCountriesPerBarRescaled)
        .attr("x", function(datum, index) { return leftmargin; })
        .attr("y", function(datum, index) { return yFun(index); })
        .attr("fill", function(d, i) { return "#ac26d9"; } )    
        .attr("fill", function(datum, index) { 
                                            if (index == 0) {
                                                startColor = colorFun(0);
                                            }
                                            else {
                                                startColor = colorFun(intervalNrPerBar[index-1]);
                                            }
                                            endColor = colorFun(intervalNrPerBar[index]);
                                            setGradient( gradients, chart,index,yFun(index),yFun(index)+barHeight,startColor,endColor);
                                            return "url(#gradient"+index+")"; })
         .transition().duration(600)
        .attr("width", function(datum, index) {   if(formatNoDecimals(datum) == 0) return 0; else return xFun(datum); })
        .attr("height", function(datum, index) { return barHeight; })
                    
     chart.selectAll("text").
                data(intervalNrPerBar).
                attr("x", function(datum, index) { return 0 ; } ).
                attr("y", function(datum, index) { return yFun(index); } ).
                attr("dx", "1.2em").
                attr("dy", 9).
                attr("text-achor","start"). 
                text( function(datum) { var arr = rescaleMinutes(datum); return "Up to " + formatNoDecimals(arr[1]) + " " + arr[0]; } )
                    .attr("class", "yaxistext");
     
     chart.select(".xaxis")
      .attr("transform", "translate("+leftmargin+"," + (h+20) + ")")
      .call(xAxis)    
          
          .selectAll("text")                  
                .style("text-anchor", "begin")
                .attr("dy", -13) ; // why...??
}

