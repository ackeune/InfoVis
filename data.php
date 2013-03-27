<!-- <?php session_start(); ?> -->


<html lang="en">
    <head>
        <!-- dit laad de google webfont-->
        <link href='http://fonts.googleapis.com/css?family=Oxygen:400,700,300&subset=latin,latin-ext' rel='stylesheet' type='text/css'>

        <meta charset="utf-8">
        <title>Trade your Life | test</title>

        <!-- dit script zorgt voor  gesimuleerde sessievariabelen met puur javascript -->
        <!-- ze worden allemaal ge-prefixed met "sessvars."-->
        <script type="text/javascript" src="sessvars.js"></script>
        <!--<script type="text/javascript" src="http://code.jquery.com/jquery-latest.js"></script>-->
        <script type="text/javascript" src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
        
        
        <script type="text/javascript" src="http://d3js.org/d3.v3.min.js"></script>
        <!-- <script type="text/javascript" src="fisheye.js"></script> -->
        <!-- <script type="text/javascript" src="qtip1.js"></script>-->
        
        <!-- sugar.js breekt met jqueryvmap dus underscore -->
        <script type="text/javascript" src="http://underscorejs.org/underscore-min.js"></script>
        
        <script type="text/javascript" src="radarchart.js"></script>
        <!-- mijn code -->
        <script type="text/javascript" src="mycode.js"></script>
        
        <script type="text/javascript" src="jqvmap/jquery.vmap.js"></script>
        <script type="text/javascript" src="jqvmap/jquery.vmap.world.js"></script>
        
        
        <script type="text/javascript" src="chosen.js"></script>

        

                
        <link type="text/css" rel="stylesheet" href="chosen1.css" />
        <link type="text/css" rel="stylesheet" href="jqvmap/jqvmap.css" />
        <link href="indexstyle.css" rel="stylesheet" type="text/css" />
        
         <link type="text/css" rel="stylesheet" href="radarstyle.css" />
        
        
    </head>
    <body>
    
   
    
    <div id="header">
		<img src="images/header.png" alt=""></br>
        <p>Compare the number of hours you have to work for a product per country on the minimum wage of that country.</br>
		See for more information about the product prices <a href="http://www.numbeo.com">this site</a>.</br></p>
    </div>
	
	<div id="belt"></div>
        
	<div id="wrapper">
        
        <div id="firsttab" >
                First tab </br>

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
                        <p class="info"> Workload distribution</p>
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
                    <a href="#secondtabsection"><img id="submitbutton" src="images/icons/show for products-2.png" width="171px" height="85px""></src></a>
                </div>
            </div>
            
            <div id="secondtab">                
                    Second tab </br>                    
                    
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
                                                    var active = sessvars.ccValues[code] != absentColor;  // data voor land
                                                    if (active) {
                                                        $('#tooltipinfo #' + code).remove();
                                                         $('#tooltipinfo .info').remove();
                                                      
                                                        $('#tooltipinfo').append('<p id=none>' + "Hover over a colored country for info." + '</p>');
                                                        $('#tooltipinfo').css("display", "none");
                                                        $('#rectangles').css("display", "inline");
                                                    }
                                                 },                                         
                                                 onRegionOver: function(element, code, region) {
                                                    var active = sessvars.ccValues[code] != absentColor;
                                                    if (active) {
                                                        $('#rectangles').css("display", "none");
                                                        $('#tooltipinfo').css("display", "inline");
                                                        $('#tooltipinfo #none').remove();
                                                        $('#tooltipinfo').append('<p class=info>In <b>' + sessvars.codeToName[code] + '</b> you need to work... </br></p><p id='+ code + '> ' + getTextData(code) + ' </p>');
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
                                                var active = sessvars.ccValues[index] != absentColor;
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
                                        barChart();
                                    
                                });
                            });
                        });
                             
                    });
                            
                    promise.fail(function(){
                        alert("FAIL We did not got data.. ");
                    });   
                    
                    
                        
                    
                </script>   
            
            <p> 
                You selected from the map: 
            </p>
            <div id="resultingcountries"></div>
            <div id="viz">
            <div id="spiderchart">
            </div>



        </div> <!-- id = secondttab -->
    <a name="secondtabsection"></a>  
    </div> <!-- id = wrapper -->
    
   
    
    </body>
</html>     