/**
 * Created by Max on 18/05/2017.
 */

/********************************
 *                              *
 *           Globals            *
 *                              *
 ********************************/

/** GAS COLORS **/
color_gas = d3.scale.linear().domain([1,5])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#E0F3F7"), d3.rgb('#007038')]);

/** WATER COLORS **/
color_water = d3.scale.linear().domain([1,6])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#DAE8F5"), d3.rgb('#00579A')]);

/** ELECTRICITY COLORS **/
color_electricity = d3.scale.linear().domain([1,7])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#FFF8CE"), d3.rgb('#ED6B2D')]);



/********************************
 *                              *
 *           Get App            *
 *                              *
 ********************************/


$.getJSON("assets/php/get_appliances.php",
    {
        cons_type: 'gas',
        user: sessionStorage.getItem('user')
    },
    function (result) {
        if (result.length > 0) {
            // show the corresponding navigation buttons
            $("#nav_gas").removeClass("hide");

            // Remember this
            sessionStorage.setItem('gas', true);

            // plot the doughnut
            plot_doughnut(result, 'gas');
        }
        else {
            // Remember this
            sessionStorage.setItem('gas', false);

            show_no_data('gas');
        }

    });

$.getJSON("assets/php/get_appliances.php",
    {
        cons_type: 'water',
        user: sessionStorage.getItem('user')
    },
    function (result) {
        if (result.length > 0) {
            // show the corresponding navigation buttons
            $("#nav_water").removeClass("hide");

            // Remember this
            sessionStorage.setItem('water', true);

            // plot the doughnut
            plot_doughnut(result, 'water');
        }
        else {
            // Remember this
            sessionStorage.setItem('water', false);

            show_no_data('water');
        }

    });

$.getJSON("assets/php/get_appliances.php",
    {
        cons_type: 'electricity',
        user: sessionStorage.getItem('user')
    },
    function (result) {
        if (result.length > 0) {
            // show the corresponding navigation buttons
            $("#nav_electricity").removeClass("hide");

            // Remember this
            sessionStorage.setItem('electricity', true);

            // plot the doughnut
            plot_doughnut(result, 'electricity');
        }
        else {
            // Remember this
            sessionStorage.setItem('electricity', false);

            show_no_data('electricity');
        }

    });



/***************************************
 *                                     *
 *           Plot function             *
 *                                     *
 ***************************************/

function plot_doughnut(appliances, tag) {

    if (tag == 'gas') {
        var color_scale = color_gas;
    }
    else if (tag == 'water') {
        var color_scale = color_water;
    }
    else {
        var color_scale = color_electricity;
    }

    /** Put the data in the correct format **/
    var labels = [];
    var data = [];
    var colors = [];
    var total_p = 0;
    for ( var i = 0; i < appliances.length; i++) {
        colors.push(color_scale(i+1));
        data.push(parseInt(appliances[i].Percentage));
        total_p += parseInt(appliances[i].Percentage);
        labels.push(appliances[i].Name);
    }

    colors.push(color_scale(i+1));
    data.push(parseInt(100 - total_p));
    labels.push("Rest");

    var ctx = document.getElementById("doughnut_" + tag).getContext('2d');
    var chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                backgroundColor: colors,
                data: data
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            tooltips: {
                enabled: true,
                callbacks: {
                    label: function (tooltipItem, data) {
                        return data.labels[tooltipItem.index] + ' : ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + '%';
                    }
                },
                position: 'cursor'
            },
        }
    });
}


/*****************************************
 *                                       *
 *           No data function            *
 *                                       *
 *****************************************/

function show_no_data(tag) {


    // Get the correct panel
    var canvas = document.getElementById("doughnut_" + tag);
    var panel = document.getElementById("doughnut_" + tag).parentNode;

    // Check if the window is mobile or not
    var height = "0px";
    (function($, viewport){

        // Executes in XS and SM breakpoints
        if( viewport.is('<md') ) {
            height = "100%";
        }
        else {
            var dummie = [{Percentage: 90, Name:"dummie"}];
            plot_doughnut(dummie, tag);

            height = canvas.offsetHeight + 4 + "px";
        }


    })(jQuery, ResponsiveBootstrapToolkit);

    // Check the tag to see what color to use
    if (tag == 'water') {
        var color = color_water(4);
    }
    else if (tag == 'gas') {
        var color = color_gas(3);
    }
    else {
        var color = color_electricity(4);
    }

    // Add a 'NO DATA' tag to the panel
    panel.innerHTML =
        "<div style='width: 100%; height: " + height + " ; display: -webkit-flex;" +
        " display: flex; align-items: center; justify-content: center;'>" +
        "<a class='logo' style='font-size: x-large; color: " + color + ";'> <b>No " + tag + "-data available.</b></a>" +
        "</div>";
}




$(function () {
    $('#datetimepicker0').datetimepicker({
        format:'DD-MM-YYYY HH:mm'
    });
    $('#datetimepicker1').datetimepicker({
        format:'DD-MM-YYYY HH:mm'
    });
    $('#datetimepicker2').datetimepicker({
        format:'DD-MM-YYYY HH:mm'
    });
    $('#datetimepicker3').datetimepicker({
        format:'DD-MM-YYYY HH:mm'
    });
});


function show_messages() {
    if ($('#pin').is(":visible")) {
        $('#pin').slideToggle('slow');

        setTimeout(function () {
            $('#messages').slideToggle('slow');
        }, 800);
    }
    else {
        $('#messages').slideToggle('slow');
    }
}

function show_pin() {
    if ($('#messages').is(":visible")) {
        $('#messages').slideToggle('slow');

        setTimeout(function () {
            $('#pin').slideToggle('slow');
        }, 800);
    }
    else {
        $('#pin').slideToggle('slow');
    }
}