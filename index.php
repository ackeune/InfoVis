<!-- <?php session_start(); ?> -->


<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Trade your Life | test</title>

        <!-- dit script zorgt voor  gesimuleerde sessievariabelen met puur javascript -->
        <!-- ze worden allemaal ge-prefixed met "sessvars."-->
        <script type="text/javascript" src="sessvars.js"></script>
        <!--<script type="text/javascript" src="http://code.jquery.com/jquery-latest.js"></script>-->
        <script type="text/javascript" src="http://code.jquery.com/jquery-1.7.2.min.js"></script>

        <script type="text/javascript" src="http://d3js.org/d3.v3.min.js"></script>
        <!-- <script type="text/javascript" src="fisheye.js"></script> -->
        <!-- <script type="text/javascript" src="qtip1.js"></script>-->
        
        <!-- mijn code -->
        <script type="text/javascript" src="mycode.js"></script>
        
        <script type="text/javascript" src="jqvmap/jquery.vmap.js"></script>
        <script type="text/javascript" src="jqvmap/jquery.vmap.world.js"></script>
        <!-- sugar.js breekt met jqueryvmap dus underscore -->
        <script type="text/javascript" src="http://underscorejs.org/underscore-min.js"></script>

        
        <link href="indexstyle.css" rel="stylesheet" type="text/css" />
        <link href="jqvmap/jqvmap.css" rel="stylesheet" type="text/css" />

    </head>
    <body>
    
   
    
    <div id="header">
            Here be some header
    </div>
        
	<div id="wrapper">
        
        <div id="firsttab" >
                First tab </br>

                <div id="my_jqvmap" class="jqvmap"></div> <!-- world map-->

                <div id="sidetomap">

                    <div class ="subsidetomapblock">
                        <div id="tooltipinfo"  >
                            <p class="info">
                                Country stats:
                            </p>
                            <p id="none">
                                Hover over an active country for info.                                
                            </p>
                        </div>
                    </div>

                    <form action="#secondtabsection" method="post">
                        <div class ="subsidetomapblock">
                            <p class="info" >
                                Select countries:
                            </p>

                            <div id="countries">
                                <select id="country" name="countrySelector"></select>
                            </div>

                        </div>
                        <div class="subsidetomapblock">
                            <ul id="location-selected"  ></ul>
                        </div>
                        <div class="subsidetomapblock">

                            <input id="submitbutton" type="submit" name="bla" value="Show for products" disabled="true">

                        </div>
                    </form>
                </div>
            </div>
                       
        
            
            <div id="secondtab">
                <a id="secondtabsection"></a>
                    Second tab </br>                    
                    
                    <script>                    
                        var ccs = [];
                        
                        console.log("workData2:");
                        console.log(sessvars.workData2);
                        console.log("codeToName:");
                        console.log(sessvars.codeToName);
                        console.log(sessvars.ccValues);
                        
                        window.strokedCountries = [];
                        var $map = null; 
                        $map = $('#my_jqvmap');
                        window.countries = [];

                        var promise = $.when(loadD3Data()); // laad algemene data (merged_db)
                        $.when(promise).then(function() { // + bereken de kleuren
                            var promiseColor =  $.when(getCountryColorValues(["cappuccino", "bread", "jeans","cinema"]));
                            
                            $.when(promiseColor).then(function() {
                                var promiseMap = $.when(makeMap());
                                
                                function makeMap() {
                                     //alert("We got data: ");
                                        var deferred = $.Deferred();

                                        setTimeout(function() {
                                         $map.vectorMap( { // maak worldmap
                                                map: 'world_en',
                                                selectedColor: '#666666',
                                                backgroundColor: null,
                                                enableZoom: true,
                                                showTooltip: true,                                           
                                                hoverColor: '#f1dfa9',    
                                                hoverOpacity: 0.6,   
                                                selectedRegion: null,
                                                values: sessvars.ccValues,
                                                scaleColors: ['#2c2e3f', '#dbdbd2'],
                                                normalizeFunction: 'polynomial', //linear or polynomial
                                                
                                                onRegionClick: function(element, code, region) {
                                                    
                                                    if (!strokedCountries[code]) {
                                                        putStroke(code, region);
                                                    }
                                                    else {
                                                        removeStroke(code);
                                                    }
                                                },                                        
                                                 onRegionOut: function(event, code, region){
                                                    var active = isNumber(sessvars.ccValues[code]);  // data voor land
                                                    if (active) {
                                                        $('#tooltipinfo #' + code).remove();
                                                        $('#tooltipinfo').append('<p id=none>' + "Hover over an active country for info." + '</p>');
                                                    }
                                                 },                                         
                                                 onRegionOver: function(element, code, region) {
                                                    var active = isNumber(sessvars.ccValues[code]);
                                                    if (active) {
                                                        $('#tooltipinfo #none').remove();
                                                        $('#tooltipinfo').append('<p id='+code+'>' + sessvars.codeToName[code] + ' is/has/was... </br> Bla </p>');
                                                    }                                            
                                                    if (!active) {
                                                        if (window.SVGAngle) {
                                                             sessvars.countries[code].setHoverOpacity(1); // simply breaks it
                                                        }
                                                    }
                                                   
                                                 }
                                            });
                                            sessvars.countries = $('#my_jqvmap').data('mapObject').countries;     
                                            deferred.resolve();
                                        }, 
                                    100);
                                    return deferred.promise();
                                }
                                    
                                $.when(promiseMap).then(function() {
                                                                  
                                    
                                    for(var index in sessvars.codeToName) {
                                        var active = isNumber(sessvars.ccValues[index]);
                                        if (active) {
                                            $('#country').append("<option value=\""+index+"\">"+sessvars.codeToName[index]+"</option>");
                                        }
                                        else {
                                        $('#country').append('<option value=\"'+index+'\" disabled>'+sessvars.codeToName[index]+'</option>');
                                        }
                                }
                                <?php // zet de grafische selectie van de vorige pagina (de selecties) opnieuw in de huidige pagina (first tab)
                                if(isset($_POST['countries'] ) ) {      
                                    if (is_array($_POST['countries'])) {
                                        $i = 0;
                                        foreach ($_POST['countries'] as $key => $value) {
                                             
                                             echo ' ccs['.$i.'] = "'.$value.'";';
                                             echo 'console.log(ccs['.$i.']);';
                                             
                                            $i++;
                                        }
                                        echo  ' for(var i=0; i < ccs.length; i++) {   ';
                                        echo ' putStroke(ccs[i],sessvars.codeToName[ccs[i]]);';  // plaatjes 
                                        echo '} ';
                                    }
                                 }
                                ?>
                                //console.log(ccs);       
                                //console.log("workData2:");
                                console.log(sessvars.ccValues);
                                console.log(sessvars.codeToName);                
                                for(var i=0; i < ccs.length; i++) { // zet de landnamen weer in het html selector ding
                                    document.getElementById("secondtab").innerHTML += "<b> country " + i + ": </b> " +  sessvars.codeToName[ccs[i]] + " </br>";
                                }
                                // als je in de selectbox selecteert
                                $('#country').on('change', function() {console.log(this), selectCountry(this);});                   
                                //console.log(sessvars.codeToName);                    
                                 console.log(sessvars.codeToName);   
                            
                            });
                        });
                             
                    });
                            
                    promise.fail(function(){
                        alert("FAIL We not got data.. ");
                    });   
                    
                </script>   
         
            <p> 
                You selected from the map: 
            </p>
        </div> <!-- id = secondttab -->
        
    </div> <!-- id = wrapper -->
    
    </body>
</html>     