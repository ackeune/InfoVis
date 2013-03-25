window.onload = loadD3Data; 

window.dataRead = false;
var mapLoaded = false;

var databaseFilename = "merged_db_20130315.csv";
window.productNames = ["cappuccino", "bread", "jeans", "movie", "internet", "sneakers", "prepaid", "mcdonalds"];
window.selectedProductNames = ["cappuccino", "bread", "jeans", "movie"];


var productNamesToText = new Array();
productNamesToText["cappuccino"] = "a cappuccino in a restaurant";
productNamesToText["bread"] = "a loaf of fresh white bread";
productNamesToText["jeans"] = "a pair of jeans (Levis 501 or similar)";
productNamesToText["movie"] = "a cinema ticket";
productNamesToText["internet"] = "a month of internet (cable/ADSL)",
productNamesToText["sneakers"] = "a pair of Nike sneakers";
productNamesToText["prepaid"] = "1 min. of mobile prepaid",
productNamesToText["mcdonalds"] = "a combo meal at McDonalds";

var countryColors = {};

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
        if (!sessvars.workData2 || !sessvars.codeToName) { // niet elke keer inlezen bij POST refresh
            console.log("in D3");

            sessvars.workData2 = [];
            sessvars.codeToName = {};

            d3.csv(databaseFilename, function(error, data) {

                data.forEach(function(d) {

                    var obj2 = {};
                    obj2["country"] = d["COUNTRY"];
                    obj2["cc"] = d["CC"];
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
                    // hier ergens synoniemen van codes verwerken
                    
                    // de html selector stuff
                    //$('#country').append("<option value=\"" + d["CC"] + "\">" + d["COUNTRY"] + "</option>");

                    //console.log(  d["COUNTRY"]    );
                    //console.log(sessvars.codeToName[d["CC"].toLowerCase()]);
                });
                fillMatrixMinutes();

                console.log("workData2 in d3:");
                console.log(sessvars.workData2);
                console.log(sessvars.codeToName);
                
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
            }
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
    // alert('**' + code);
    var countries = sessvars.countries;

    var active = isNumber(sessvars.ccValues[code]);
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

    console.log(cc.value.toLowerCase());
    ccV = cc.value.toLowerCase();

    //var countries = $('#my_jqvmap').data('mapObject').countries;
   
    if (!(_.some(countriesAndColors, function(el) {return el.code === ccV;}))){
        //console.log(ccV + " kwam nog niet voor");
        
        
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
        console.log(option);

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
        
        
        //ul.appendChild(li);
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
    console.log(count);
    
    console.log("countriesAndColors:");
    console.log(countriesAndColors);
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

        if (!sessvars.ccValues || sessvars.ccValues.length == 0) {
            var colors = {};
            var absentColor = "#808080";

            var maxMinutesC;
            var maxMinutes = 0;
            var minMinutesC;
            var minMinutes = 999999999;
            
            //console.log("selectedProducts:");
            //console.log(selectedProducts);
            
            sessvars.workData2.forEach(function(d) {
                
                var totalMinutes;
                var color;

                if (isNumber(d["wage per minute"])) {
                    var productsWithCost = _.filter(d["products"], function(product) {
                        return _.contains(selectedProducts, product.name) && isNumber(product["cost"]);
                    });
                    var hasAll = productsWithCost.length == selectedProducts.length;

                    if (hasAll) {
                        //console.log("hasAll");
                        totalMinutes = _.reduce(d["products"], function(memo, prod) {
                            if (_.contains(selectedProducts, prod.name)) {
                                //console.log("selectedProducts contains " + prod.name + " it has " + prod.minutes + " minutes");
                                return memo + prod.minutes;
                            }
                            else {
                                //console.log("selectedProducts not contains " + prod.name );
                                return memo;
                            }
                        }, 0);
                        
                       // console.log("totalMinutes: " + totalMinutes);
                        colors[ d["cc"].toLowerCase()] = totalMinutes;

                        if (totalMinutes > maxMinutes) {
                            maxMinutes = totalMinutes;
                        }
                        else if (totalMinutes < minMinutes) {
                            minMinutes = totalMinutes;
                        }
                    } else {
                        //  colors[ d["cc"].toLowerCase()] = absentColor;
                    }
                } else {
                    //colors[ d["cc"].toLowerCase() ] = absentColor;
                }
            });

            console.log(maxMinutes);
            console.log(minMinutes);
            sessvars.ccValues = colors;
            console.log("sessvars.ccValues in getcolors:");
            console.log(sessvars.ccValues );
            
            //$('#my_jqvmap').vectorMap('set', 'values', sessvars.ccValues);
            
                       
        }
        deferred.resolve();
    }, 1000);
}

function getCountryColorValues_noTimeOut(selectedProducts) {
    

    if (true)/*(!sessvars.ccValues || sessvars.ccValues.length == 0) */{
        var colors = {};
        var absentColor = "#808080";

        var maxMinutesC;
        var maxMinutes = 0;
        var minMinutesC;
        var minMinutes = 999999999;
        
        //console.log("selectedProducts:");
        //console.log(selectedProducts);
        
        sessvars.workData2.forEach(function(d) {
            
            var totalMinutes;
            var color;

            if (isNumber(d["wage per minute"])) {
                var productsWithCost = _.filter(d["products"], function(product) {
                    return _.contains(selectedProducts, product.name) && isNumber(product["cost"]);
                });
                var hasAll = productsWithCost.length == selectedProducts.length;

                if (hasAll) {
                    //console.log("hasAll");
                    totalMinutes = _.reduce(d["products"], function(memo, prod) {
                        if (_.contains(selectedProducts, prod.name)) {
                            //console.log("selectedProducts contains " + prod.name + " it has " + prod.minutes + " minutes");
                            return memo + prod.minutes;
                        }
                        else {
                            //console.log("selectedProducts not contains " + prod.name );
                            return memo;
                        }
                    }, 0);
                    
                   // console.log("totalMinutes: " + totalMinutes);
                    colors[ d["cc"].toLowerCase()] = totalMinutes;

                    if (totalMinutes > maxMinutes) {
                        maxMinutes = totalMinutes;
                    }
                    else if (totalMinutes < minMinutes) {
                        minMinutes = totalMinutes;
                    }
                } else {
                    //  colors[ d["cc"].toLowerCase()] = absentColor;
                }
            } else {
                //colors[ d["cc"].toLowerCase() ] = absentColor;
            }
        });

        console.log(maxMinutes);
        console.log(minMinutes);
        sessvars.ccValues = colors;
        console.log("sessvars.ccValues in getcolors:");
        console.log(sessvars.ccValues );
        
        //$('#my_jqvmap').vectorMap('set', 'values', sessvars.ccValues);
        
                   
    }
}

//... 
function getColorsSampleData() {
    var max = 0, min = Number.MAX_VALUE, cc, startColor = [200, 238, 255], endColor = [0, 100, 145], colors = {}, hex;

    //console.log("gdpData:");
    //console.log(gdpData);

    //find maximum and minimum values
    for (cc in gdpData) {//console.log(cc);

        if (parseFloat(gdpData[cc]) > max) {
            max = parseFloat(gdpData[cc]);
        }
        if (parseFloat(gdpData[cc]) < min) {
            min = parseFloat(gdpData[cc]);
        }
    }

    //set colors according to values of GDP
    for (cc in gdpData) {
        if (gdpData[cc] > 0) {
            colors[cc] = '#';
            for (var i = 0; i < 3; i++) {
                hex = Math.round(startColor[i] + (endColor[i] - startColor[i]) * (gdpData[cc] / (max - min))).toString(16);

                if (hex.length == 1) {
                    hex = '0' + hex;
                }

                colors[cc] += (hex.length == 1 ? '0' : '') + hex;
            }
        }
    }
    //console.log("colors in getColorsSampleData(): ");
    //console.log(colors);
    return colors;
}

function colorTest() {
    // alert("colortest");
    //console.log(countryColors['af']);
    //var kleurtjes = getColorsSampleData();
    // $('#my_jqvmap').vectorMap('set', 'colors', countryColors );
    $('#my_jqvmap').vectorMap('set', 'colors', {
        us : '#8EE5EE',
        af : "#8e0505"
    });
    //$('#my_jqvmap').vectorMap('set', 'colors', kleurtjes );

}



function bla() {
    alert("bla");
}


function submitCountries() {    
    
    console.log(countriesAndColors);
    document.getElementById("resultingcountries").innerHTML = "";
    for(var i=0; i < countriesAndColors.length; i++) { // zet de landnamen weer in het html selector ding
        document.getElementById("resultingcountries").innerHTML += "<b> country " + i + ": </b> " +  sessvars.codeToName[countriesAndColors[i].code] + " </br>";
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
     console.log(selectedProductNames);
     
     //getCountryColorValues(selectedProductNames);
    getCountryColorValues_noTimeOut(selectedProductNames);
    
    
    $('#my_jqvmap').vectorMap('set', 'values', sessvars.ccValues);
    
    
 }  
 
 
 function getTextData(countryCode) {
    countryCode = countryCode.toUpperCase();
    countryMatrixData = _.find(sessvars.workData2, function(el) { return el.cc == countryCode; });
    countryMatrixProductData = _.filter(countryMatrixData.products, function (prod) { return _.contains(selectedProductNames, prod.name); });
    console.log(countryMatrixProductData);
    var text = "";
    for(var i=0; i < countryMatrixProductData.length; i++) {
        if (countryMatrixProductData[i].minutes <= 60) {
            text += countryMatrixProductData[i].minutes.toFixed(0) + " minutes for a " + productNamesToText[countryMatrixProductData[i].name] + "</br>";
        }
        else {
            var number = (countryMatrixProductData[i].minutes/60).toFixed(0) ;
            text += number;
            if (number == 1) {
                text+=  " hour ";
            }
            else {
                text += " hours ";
            }
            text += "for a " + productNamesToText[countryMatrixProductData[i].name] + "</br>";
        }
    }
    return text;
 }

