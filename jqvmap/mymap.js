$(document).ready(function() {

    

    highlight = {};
    var country_colors = {};
    var countries;
    
    $('#my_jqvmap').vectorMap( {
        map: 'world_en',
        selectedColor: '#666666',
        backgroundColor: null,
        enableZoom: true,
        showTooltip: true,
        color: '#f4f3f0',       
        onRegionClick: function(element, code, region) {
            country_colors[code] = '#8EE5EE';
             $('#my_jqvmap').vectorMap('set', 'colors', country_colors);
            editStroke(code);
            
            if(highlight[code]!=='#0000ff'){
                highlight[code]='#0000ff';
                $('<li id=\"li_'+code+'\"></li>').html(region).appendTo($('#location-selected'));
            } else {
                highlight[code]='#f4f3f0';
                $('#li_'+code).remove();
            }
            $('#my_jqvmap').vectorMap('set', 'colors', highlight);
        },
         onRegionOut: function(event, code, region){
             $('#my_jqvmap').vectorMap('set', 'colors', country_colors);
         },
    });
    
     countries = $('#my_jqvmap').data('mapObject').countries;
     
    function editStroke(code) {
       
       
        if (window.SVGAngle) {
            countries[code].setAttribute("stroke", "#79230b");
            countries[code].setAttribute("stroke-width", 4);
            countries[code].setAttribute("stroke-opacity", 1);
        } else {
            countries[code].stroked = true;
            countries[code].strokeColor = "#f00";
        }
           
    }
});
