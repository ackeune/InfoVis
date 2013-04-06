<!-- <?php session_start(); ?> -->


<html lang="en">
    <head>
        <!-- dit laad de google webfont-->
        <link href='http://fonts.googleapis.com/css?family=Oxygen:400,700,300&subset=latin,latin-ext' rel='stylesheet' type='text/css'>

        <meta charset="utf-8">
        <title>Trade your Life</title>

        <!-- dit script zorgt voor  gesimuleerde sessievariabelen met puur javascript -->
        <!-- ze worden allemaal ge-prefixed met "sessvars."-->
        <script type="text/javascript" src="sessvars.js"></script>
        <!--<script type="text/javascript" src="http://code.jquery.com/jquery-latest.js"></script>-->
        <script type="text/javascript" src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
         
        

        
        <script type="text/javascript" src="http://d3js.org/d3.v3.min.js"></script>
        <!-- <script type="text/javascript" src="fisheye.js"></script> -->
      <!-- <script type="text/javascript" src="qtip.js"></script>-->
        
        <!-- sugar.js breekt met jqueryvmap dus underscore -->
        <script type="text/javascript" src="http://underscorejs.org/underscore-min.js"></script>
        
        <script type="text/javascript" src="radarchart2.js"></script>
        <script type="text/javascript" src="radarchart2b.js"></script>
        <!-- mijn code -->
        <script type="text/javascript" src="mycode.js"></script>
        
        <script type="text/javascript" src="jqvmap/jquery.vmap.js"></script>
        <script type="text/javascript" src="jqvmap/jquery.vmap.world.js"></script>
        
        
        <script type="text/javascript" src="chosen.js"></script>

        <script type="text/javascript" src="leanModal.js"></script>
   
                
        <link type="text/css" rel="stylesheet" href="chosen1.css" />
        <link type="text/css" rel="stylesheet" href="jqvmap/jqvmap.css" />
        <link href="indexstyle.css" rel="stylesheet" type="text/css" />
        
         <link type="text/css" rel="stylesheet" href="radarstyle.css" />
           
        
        
        
        
    </head>
    <body>
    
    

    <a name="firsttabsection"></a>  
   
    <div id="header">
        
		<img src="images/header.png" alt="">
        
        </br>
        <p class="info2">Compare the number of hours you have to work for a product per country on the minimum wage of that country.</br>
		See for more information about the product prices <a href="http://www.numbeo.com">this site</a>.</br></p>
        
        <a  href="#abouttext" name="abouttext" class="about" rel="leanModal">About</a>
        <a  href="#usetext" name="usetext" class="about" rel="leanModal">How to use</a>
        
    </div>
	   <div id="belt"></div>
      
	
        
	<div id="wrapper">
        
        <div id="firsttab" >
                
                
                
    
                <p class="info">Click on a product icon below the map too see the workload with that product added. </br> Select countries first to compare them individually.</p>

                <div id="my_jqvmap" class="jqvmap"></div> <!-- world map-->

                <div id="sidetomap">

                    <div class ="subsidetomapblock">
                        <div id="tooltipinfo"  >                        
                            <!-- <p class="info">
                                Country stats:
                            </p> -->
                            <p id="none">
                                Hover over a colored country for info.                                
                            </p>
                            
                        </div>
                        <div id="rectangles">
                        <p class="info"> Worldwide workload for selected products</p>
                        </div>
                    </div>

                    <form action="#secondtabsection" method="post">
                        <div class ="subsidetomapblock">
                            
                            
                            <div id="countries">
                                <select id="country" class="chzn-select" name="countrySelector" size="1" >
                                    <option disabled="disabled" selected = "selected">
                                        Select a country
                                    </option>
                                </select>
                            </div>
                            
                        </div>
                        <div class="subsidetomapblock">
                            <ul id="location-selected"  ></ul>
                        </div>
                       
                    </form>

                </div>
            </div>
           
             <!--<input id="submitbutton" type="submit" name="bla" value="Show for products" disabled="true">-->
             <div id="bottomfirsttab">
                <div id="producticons">
                    <img src="images/icons/bread-seleted.png" alt="Load of bread" class="producticon" id="bread" />
                    <img src="images/icons/cappuccino-seleted.png" alt="Cappuccino" class="producticon" id="cappuccino" />
                    <img src="images/icons/internet-deseleted.png" alt="Internet" class="producticon" id="internet" />
                    <img src="images/icons/jeans-seleted.png" alt="Pair of jeans" class="producticon" id="jeans" />
                    <img src="images/icons/mcdonalds-deseleted.png" alt="McDonald's combo meal" class="producticon" id="mcdonalds" />
                    <img src="images/icons/prepaid-deseleted.png" alt="Prepaid" class="producticon" id="prepaid" />
                    <img src="images/icons/sneakers-deseleted.png" alt="Sneakers" class="producticon" id="sneakers" />
                    <img src="images/icons/movie-seleted.png" alt="Movie ticket" class="producticon" id="movie" />
                </div>
                <div id="submitbutton">
                    <a href="#secondtabsection"><img id="submitbutton" src="images/icons/compare-countries.png" width="230.75px" height="65px""></src></a>
                </div>
            </div>
         
            
            <hr size=5 class="division">
           
            
            <div id="secondtab">                
                    <p class="info">Hover over the chart for country info.</p>                    
                    
                    <script>                    
                        var ccs = [];
                        
                        console.log("workData2:");
                        console.log(sessvars.workData2);
                        console.log("codeToName:");
                        console.log(sessvars.codeToName);
                        console.log(sessvars.ccValues);
                        
                        window.strokedCountries = [];
                        window.countriesAndColors = [];
                        var $map = null; 
                        $map = $('#my_jqvmap');
                        window.countries = [];
                        selectedProductNames = ["cappuccino", "bread", "jeans", "movie"];

                        var promise = $.when(loadD3Data()); // laad algemene data (merged_db)
                        $.when(promise).then(function() { // + bereken de kleuren
                            var promiseColor =  $.when(getCountryColorValues(selectedProductNames));
                            
                            $.when(promiseColor).then(function() {
                                var promiseMap = $.when(makeMap()); // maak map
                                
                                function makeMap() {
                                     //alert("We got data: ");
                                        var deferred = $.Deferred();

                                        setTimeout(function() {
                                         $map.vectorMap( { // maak worldmap
                                                map: 'world_en',
                                                //selectedColor: '#666666',
                                                backgroundColor: null,
                                                enableZoom: true,
                                                showTooltip: true,                                           
                                                hoverColor: '#f1dfa9',    
                                                hoverOpacity: 0.6,   
                                                selectedRegion: null,
                                                colors: sessvars.ccValues,
                                                //scaleColors: ['#dbdbd2', '#2c2e3f'],
                                                //normalizeFunction: 'polynomial', //linear or polynomial
                                                
                                                onRegionClick: function(element, code, region) {
                                                    
                                                    if (!(_.some(countriesAndColors, function(el) {return el.code === code;}))) {
                                                        console.log("putstroke")
                                                        putStroke(code, region);
                                                    }
                                                    else {
                                                        removeStroke(code);
                                                    }
                                                },                                        
                                                 onRegionOut: function(event, code, region){
                                                    //countryMatrixData = _.find(sessvars.workData2, function(el) { return el.cc.toLowerCase() == code; });    
                                                    var active = sessvars.ccValues[code] != absentColor &&  sessvars.ccValues[code] != noWageColor; //isNumber(countryMatrixData['wage per minute']);
                                                    if (active) {
                                                        $('#tooltipinfo #' + code).remove();
                                                         $('#tooltipinfo .info').remove();
                                                      
                                                        $('#tooltipinfo').append('<p id=none>' + "Hover over a colored country for info." + '</p>');
                                                        $('#tooltipinfo').css("display", "none");
                                                        $('#rectangles').css("display", "inline");
                                                    }
                                                 },                                         
                                                 onRegionOver: function(element, code, region) {
                                                    //countryMatrixData = _.find(sessvars.workData2, function(el) { return el.cc.toLowerCase() == code; });    
                                                    var active = sessvars.ccValues[code] != absentColor &&  sessvars.ccValues[code] != noWageColor ; //isNumber(countryMatrixData['wage per minute']);
                                                   // var active = sessvars.ccValues[code] != absentColor;
                                                    if (active) {
                                                        $('#rectangles').css("display", "none");
                                                        $('#tooltipinfo').css("display", "inline");
                                                        $('#tooltipinfo #none').remove();
                                                        $('#tooltipinfo').append('<p class=info><b>'+  getTotalTextData(code) + '</b> you need to work for these products in total in <b>' + sessvars.codeToName[code] + '</b>: </br></p><p id='+ code + ' class="small"> ' + getTextData(code) + ' </p>');
                                                    }                                            
                                                    if (!active) {
                                                        
                                                        if (window.SVGAngle) {
                                                             //sessvars.countries[code].setHoverOpacity(1); // simply breaks it
                                                        }
                                                    }
                                                   
                                                 }
                                            });
                                            sessvars.countries = $('#my_jqvmap').data('mapObject').countries;     
                                            deferred.resolve();
                                        }, 
                                    1000);
                                    return deferred.promise();
                                }
                                    
                                $.when(promiseMap).then(function() {
                                                                  
                                   
                                     function makeChosen() {
                                        var deferred = $.Deferred();

                                        setTimeout(function() {
                                            for(var index in sessvars.codeToName) {
                                                var active = sessvars.ccValues[index] != absentColor && sessvars.ccValues[index] != noWageColor;
                                                if (active) {
                                                    $('#country').append("<option value=\""+index+"\">"+sessvars.codeToName[index]+"</option>");
                                                }
                                                else {
                                                    $('#country').append('<option value=\"'+index+'\" disabled>'+sessvars.codeToName[index]+'</option>');
                                                }
                                            }
                                            $("select").chosen();
                                           deferred.resolve();
                                        }, 10);
                                        
                                        return deferred.promise();
                                    }
                                                                        
                                    var promiseChosen = $.when(makeChosen());
                                    
                                     
                                    $.when(promiseChosen).then(function() {
                                    
                                    
                                // <?php // zet de grafische selectie van de vorige pagina (de selecties) opnieuw in de huidige pagina (first tab)
                                // if(isset($_POST['countries'] ) ) {      
                                    // if (is_array($_POST['countries'])) {
                                        // $i = 0;
                                        // foreach ($_POST['countries'] as $key => $value) {
                                             
                                             // echo ' ccs['.$i.'] = "'.$value.'";';
                                             // echo 'console.log(ccs['.$i.']);';
                                             
                                            // $i++;
                                        // }
                                        // echo  ' for(var i=0; i < ccs.length; i++) {   ';
                                        // echo ' putStroke(ccs[i],sessvars.codeToName[ccs[i]]);';  // plaatjes 
                                        // echo '} ';
                                    // }
                                 // }
                                // ?>
                                
                                    
                                        //console.log(ccs);       
                                        //console.log("workData2:");
                                        console.log(sessvars.ccValues);
                                        console.log(sessvars.codeToName);                
                                        
                                        // als je in de selectbox selecteert
                                        $('#country').on('change', function() {
                                            //alert(this);
                                            console.log(this); 
                                            selectCountry(this);
                                        });                   
                                        //console.log(sessvars.codeToName);                    
                                         console.log(sessvars.codeToName);   
                                        
                                        $('#submitbutton').click(function() {                                    
                                            submitCountries();
                                        });
                                        
                                        $('img.producticon').click(function() {
                                            //alert(this.id );
                                           
                                            addProductData(this);
                                         
                                        });
                                        
                                        $('#tooltipinfo').css("display", "none");
                                        $('#rectangles').css("display", "inline");
                                        barChartOnce();
                                        
                                        $('#secondtab').css("display", "none"); 
                                        
                                        //$("#aboutlink").leanModal();
                                        $('a[rel*=leanModal]').leanModal({ closeButton: ".modal_close" });


                                    
                                });
                            });
                        });
                             
                    });
                            
                    promise.fail(function(){
                        alert("FAIL We did not got data.. ");
                    });   
                    
                    
                        
                    
                </script>   
            
            <!-- <p> 
                You selected from the map: 
            </p> -->
        <div id="resultingcountries"></div>
        <div id="viz">
            <div id="legend"></div>
            <div id="spiderinfoblock">
                <div class="spiderinfo">Absolute work load</div>
                <div class="spiderinfo">Work load relative to life expectancy</div>
            </div>
            <div class="spider" id="spiderchart"></div>                
            <div class="spider" id="spiderchart2"></div>
            <div id="backtotop">
                <a href="#firsttabsection"><img id="backbutton" src="images/icons/back-to-top.png" width="50px" height="50px" alt="Back to top"></src></a>
            </div>
        </div>
        

    </div> <!-- id = secondttab -->
<a name="secondtabsection"></a>  
</div> <!-- id = wrapper -->


<div  id="usetext">
                <p class="aboutheader" style="font-size: 13px;"> How to use  <i> Trade your Life </i> ? </p>
               
                    
                     <a class="modal_close" href="#"></a>
                     
                     <p class="aboutheader"> What it shows </p>
                    <p class="abouttext">
                     We show how much to work on minimum wage for certain products. </br>
                     For example, how much do you have to work in Mali on minimum wage to buy a cappuccino, or a pair of jeans? And how does this differ from the situation in Libya and the USA? And how much is "much" actually, considering your life expectancy in those countries?
                     </p>
                     
                      <p class="aboutheader"> Map view </p>
                    <p class="abouttext">
                     By (de)selecting the product icons below the map, you can get an overview on the map of the global workload 
                     for the selected products. The upper right bar chart shows the numbers corresponding to the colors in the map.<br><br>
                     
                     You can also hover over countries for detailed info per selected product.</br></br>
                     You can also select countries by clicking on them. 
                     Why is that? Read on...
                     
                     </p>
                     <p class="aboutheader"> Compare countries  </p>
                     <p class="abouttext">
                     Given the map view, you might  want to compare some countries more detailed. </br>
                     You can select up to 10 countries by clicking on the map or by using select list besides the map.<br>
                     Then by clicking on the yellow "Compare countries"
                     button, you will get a specificic comparison of the countries in terms of work load.</br></br>
                     
                     The first radial chart shows the absolute working hours. The second radial chart shows the percentage of life needed to work. (To see that these are not always the same, compare for example Iran and The Netherlands!)
                    </p>
                    
                
            </div>
            
             <div id="abouttext">
                   <p class="aboutheader" style="font-size: 13px;"> What is <i> Trade your Life </i> ? </p>
                    <a class="modal_close" href="#"></a>
               
                
                    
                    <p class="aboutheader"> Goal </p>
                    
                     <p class="abouttext">
                    The goal of this information visualization project is to raise public awareness to global economic inequality from a different angle by connecting each country's minimum wage with the cost of a set of basic consumer goods and translate that connection in terms of working hours.</br>
                    This way we aim to show the (relative) "<i>slaving away</i>" amount around the world concretely.</br>
                    
                    This approach is more
                    tangible and personal than standard indicators such as the 
                    <a class="inabout" href="http://en.wikipedia.org/wiki/List_of_countries_by_GDP_(PPP)_per_capita" TARGET="_blank"> 
                        GDP per capita
                    </a>
                    or the
                    <a class="inabout" href="http://en.wikipedia.org/wiki/Gini_coefficient" TARGET="_blank"> 
                        Gini coefficient
                    </a>. 
                    </p>
                    
                    <p class="aboutheader"> Methodolody </p>
                    
                     <p class="abouttext">
                    In order to make a global comparison possible, the assumption for the working
                    hours calculation was based on a working day of 8 hours and a a working week of 5 days.
                    This results in an average of 20 working days in a month. 
                    This allows for a comparison between
                    distinct situations in equal terms.</br>
                    The cost of the consumer goods selected for the application is originally crowd
                    sourced and gathered in a platform named 
                    Numbeo
                     (see <b>Datasets</b> below for further
                    information). Note that "outlier" countries in terms of product cost from Numbeo (.e.g. Burundi) were deliberately included. </br>
                    The choice for minimum wage (as opposed to e.g. average wage) as wage metric is made because of standardization and availability. Still, information on the percentage of the population in
                    each country earning the minimum wage is unavailable, so note that the figures presented do not take this into account. </br>
                    </p>
                    
                    <p class="aboutheader">  Datasets </p>
                     <p class="abouttext">
                    All data included in this application were captured on March 2013 from the following
                    sources: 
                    <ul STYLE="font-size: 10px;">
                        <li> Wikipedia (<a class="inabout" href="http://en.wikipedia.org/wiki/List_of_minimum_wages_by_country">minimum wage per country</a>) </li>
                        <li> CIA (<a class="inabout" href="https://www.cia.gov/library/publications/the-world-factbook/rankorder/2102rank.html"> life expectancy per country</a>) </li> 
                        <li>Numbeo (cost of products in USD, per country):
                        
                            
                                    <a class="inabout" href="http://www.numbeo.com/cost-of-living/prices_by_country.jsp?displayCurrency=USD&itemId=9"  TARGET="_blank" >loaf of bread</a>; 
                                
                                    <a class="inabout" href="http://www.numbeo.com/cost-of-living/prices_by_country.jsp?displayCurrency=USD&itemId=3"  TARGET="_blank" > McDonalds meal</a>; 
                                
                                    <a class="inabout" href="http://www.numbeo.com/cost-of-living/prices_by_country.jsp?displayCurrency=USD&itemId=114"   TARGET="_blank"> cappuccino </a>; 
                                 
                                    <a class="inabout" href="http://www.numbeo.com/cost-of-living/prices_by_country.jsp?displayCurrency=USD&itemId=60"  TARGET="_blank" > pair of brand jeans </a>; 
                                
                                    <a class="inabout" href="http://www.numbeo.com/cost-of-living/prices_by_country.jsp?displayCurrency=USD&itemId=64"  TARGET="_blank"> brand sneakers </a>; 
                               
                                    <a class="inabout" href="http://www.numbeo.com/cost-of-living/prices_by_country.jsp?displayCurrency=USD&itemId=32"  TARGET="_blank"> pre-paid mobile </a>; 
                                
                                    <a class="inabout" href="http://www.numbeo.com/cost-of-living/prices_by_country.jsp?displayCurrency=USD&itemId=33"  TARGET="_blank"> monthly internet package </a>;
                                
                                    <a class="inabout" href="http://www.numbeo.com/cost-of-living/prices_by_country.jsp?displayCurrency=USD&itemId=44"  TARGET="_blank"> movie ticket  </a>
                                
                       </li>
                    </ul> 
                    
                    </p>
                    <p class="aboutheader"> Your workers </p>
                    <p class="abouttext">
                     The (<a class="inabout" href="http://www.uva.nl/en/home" TARGET="_blank">UvA</a> and <a  class="inabout" href="http://www.mahku.nl/" TARGET="_blank">maHKU</a> based) <a class="inabout" href="http://showmethedata.nl/2012/" TARGET="_blank">InfoVis 2012/2013</a> team of:  Agnes, Ana, Anna and Buffy
                    </p>
            </div>

    
    </body>
</html>     