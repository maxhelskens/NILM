/**
 * Created by Max on 18/05/2017.
 */

/********************************
 *                              *
 *           Globals            *
 *                              *
 ********************************/

/** GAS COLORS **/
color_gas = d3.scale.linear().domain([0, 5])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#E0F3F7"), d3.rgb('#007038')]);

/** WATER COLORS **/
color_water = d3.scale.linear().domain([0, 6])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#DAE8F5"), d3.rgb('#00579A')]);

/** ELECTRICITY COLORS **/
color_electricity = d3.scale.linear().domain([0, 7])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#FFF8CE"), d3.rgb('#ED6B2D')]);


week_prices = {};
month_prices = [];


/********************************
 *                              *
 *           Get Data           *
 *                              *
 ********************************/


$.getJSON("assets/php/get_appliances.php",
    {
        cons_type: 'gas',
        user: sessionStorage.getItem('user')
    },
    function (result) {
        if (result.length > 0) {
            color_gas = d3.scale.linear().domain([0, result.length + 1])
                .interpolate(d3.interpolateHcl)
                .range([d3.rgb("#E0F3F7"), d3.rgb('#007038')]);

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
            color_water = d3.scale.linear().domain([0, result.length + 1])
                .interpolate(d3.interpolateHcl)
                .range([d3.rgb("#DAE8F5"), d3.rgb('#00579A')]);

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
            color_electricity = d3.scale.linear().domain([0, result.length + 1])
                .interpolate(d3.interpolateHcl)
                .range([d3.rgb("#FFF8CE"), d3.rgb('#ED6B2D')]);

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

$.getJSON("assets/php/get_self_compare.php",
    {
        sample: 'week', // 'week' or 'month
        amount: 12, // number of samples to the past
        user: sessionStorage.getItem('user')
    },
    function (result) {
        result = JSON.parse(result);

        handle_price_data(result, 'week');
    }
);

$.getJSON("assets/php/get_self_compare.php",
    {
        sample: 'month', // 'week' or 'month
        amount: 12, // number of samples to the past
        user: sessionStorage.getItem('user')
    },
    function (result) {
        result = JSON.parse(result);

        handle_price_data(result, 'month');
    }
);


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
    for (var i = 0; i < appliances.length; i++) {
        colors.push(color_scale(i));
        data.push(parseInt(appliances[i].Percentage));
        total_p += parseInt(appliances[i].Percentage);
        labels.push(appliances[i].Name);
    }

    colors.push(color_scale(i));
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
            }
        }
    });
}

function handle_price_data(result, sample) {
    /** Modify data **/
    var keys = Object.keys(result);

    var gas_data = [];
    var water_data = [];
    var electricity_data = [];
    var labels = [];

    for (var i = 0; i < keys.length; i++) {
        labels.push(keys[i]);
        var prices = result[keys[i]];
        var prices_keys = Object.keys(result[keys[i]]);

        var gas_index = prices_keys.indexOf("gas");
        var water_index = prices_keys.indexOf("water");
        var electricity_index = prices_keys.indexOf("electricity");

        if (gas_index != -1) {
            gas_data.push(prices[prices_keys[gas_index]]);
        }
        else {
            gas_data.push(0);
        }

        if (water_index != -1) {
            water_data.push(prices[prices_keys[water_index]]);
        }
        else {
            water_data.push(0);
        }

        if (electricity_index != -1) {
            electricity_data.push(prices[prices_keys[electricity_index]]);
        }
        else {
            electricity_data.push(0);
        }
    }

    for (var i = 0; i < 12 - keys.length; i++) {
        labels.push('No data');
        gas_data.push(0);
        water_data.push(0);
        electricity_data.push(0);
    }

    if (sample == 'week') {
        week_prices['labels'] = labels;
        week_prices['gas'] = gas_data;
        week_prices['water'] = water_data;
        week_prices['electricity'] = electricity_data;

        plot_price_chart(week_prices, sample);
    }
    else {
        month_prices['labels'] = labels;
        month_prices['gas'] = gas_data;
        month_prices['water'] = water_data;
        month_prices['electricity'] = electricity_data;
    }
}

function plot_price_chart(data, sample) {

    var ctx = document.getElementById("price_chart");

    ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);

    if (window.innerWidth >= 992) {
        ctx.height = 300;
        var labels = data.labels;
    }
    else {
        ctx.height = 300;

        var labels = ['', '', '', '', '', '', '', '', '', '', '', ''];
    }

    const parentnode = ctx.parentNode;
    parentnode.innerHTML = '<canvas id="price_chart" height="300" width="400"></canvas>';
    var ctx = document.getElementById("price_chart");


    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'gas',
                data: data.gas,
                backgroundColor: '#7FCDBD'
            },
            {
                label: 'electricity',
                data: data.electricity,
                backgroundColor: '#FFDC92'
            },
            {
                label: 'water',
                data: data.water,
                backgroundColor: '#85C0D9'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            tooltips: {
                enabled: true,
                callbacks: {
                    label: function (tooltipItem, data) {
                        return '€' + Math.round(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] * 100)/100;
                    }
                },
                position: 'cursor'
            },
            scales: {
                yAxes: [{
                    stacked: true,
                    ticks: {
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Price ( € )'
                    }
                }],
                xAxes: [{
                    stacked: true,
                    ticks: {
                        beginAtZero: true
                    },
                    gridLines: {
                        display: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Time ( ' + sample + ' )'
                    }
                }]

            }
        }
    });
}

/*****************************************
 *                                       *
 *             Set Username              *
 *                                       *
 *****************************************/

$('#username').html(sessionStorage.getItem('first name') + ' ' + sessionStorage.getItem('last name'));

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
    (function ($, viewport) {

        // Executes in XS and SM breakpoints
        if (viewport.is('<md')) {
            height = "100%";
        }
        else {
            var dummie = [{Percentage: 90, Name: "dummie"}];
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
        "<a class='logo' style='font-size: x-large; color: " + color + ";'> <b>No " + tag + "-data available</b></a>" +
        "</div>";
}

/*****************************************
 *                                       *
 *            Other functions            *
 *                                       *
 *****************************************/

$('#radioBtn a').on('click', function () {
    var sel = $(this).data('title');
    var tog = $(this).data('toggle');
    $('#' + tog).prop('value', sel);

    if ($('a[data-toggle="' + tog + '"]').not('[data-title="' + sel + '"]').hasClass('active')) {
        $('a[data-toggle="' + tog + '"]').not('[data-title="' + sel + '"]').removeClass('active').addClass('notActive');
    }
    else {
        $('a[data-toggle="' + tog + '"]').not('[data-title="' + sel + '"]').removeClass('notActive').addClass('active');
    }

    if ($('a[data-toggle="' + tog + '"][data-title="' + sel + '"]').hasClass('active')) {
        $('a[data-toggle="' + tog + '"][data-title="' + sel + '"]').removeClass('active').addClass('notActive');
    }
    else {
        $('a[data-toggle="' + tog + '"][data-title="' + sel + '"]').removeClass('notActive').addClass('active');
    }

    var sample = $('a[data-toggle="' + tog + '"]').filter('.active').attr('data-title');
    if (sample == 'week') {
        plot_price_chart(week_prices, 'week');
    }
    else {
        plot_price_chart(month_prices, 'month');
    }
});

$(function () {
    $('#datetimepicker0').datetimepicker({
        format: 'DD-MM-YYYY HH:mm'
    });
    $('#datetimepicker1').datetimepicker({
        format: 'DD-MM-YYYY HH:mm'
    });
    $('#datetimepicker2').datetimepicker({
        format: 'DD-MM-YYYY HH:mm'
    });
    $('#datetimepicker3').datetimepicker({
        format: 'DD-MM-YYYY HH:mm'
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

function to_input(label, icon, type) {

    var width = 60;
    if (width < label.innerWidth()) {
        width = label.innerWidth();
    }

    var input = $('<input id="' + label.attr('id') + '" style="display: inline; height: 100%; width: ' + width + 'px;"/>').val(label.text().trim());
    label.replaceWith(input);

    var save = function () {
        var i = '';
        if (icon != '') {
            i = '<i class="fa fa-' + icon + '"></i>';
        }

        var p = $('<' + type + ' id="' + input.attr('id') + '"> ' + i + ' ' + input.val().trim() + '</' + type + '>');
        input.replaceWith(p);

        $('#modal_footer').removeClass('hide');
    };

    input.one('blur', save).focus();
}
function to_tags_input() {

    window.addEventListener('click', function (e) {
        if (document.getElementById('clickbox').contains(e.target)) {
            // Clicked in box
        } else {
            $('#tag-group_in').empty();
            tags = $('#tags-input_in').tagsinput('items');
            var html = '';
            for (var i = 0; i < tags.length; i++) {
                html += '<span class="label label-default">' + tags[i] + '</span>' + '\n';
            }
            $('#tag-group_in').append(html);

            $('#tags-input').addClass('hide');
            $('#tag-group').removeClass('hide');

            $('#modal_footer').removeClass('hide');
        }
    });


    $('#tag-group').addClass('hide');
    $('#tags-input').removeClass('hide');

    var tags = $('#tag-group_in').children();
    for (var i = 0; i < tags.length; i++) {
        $('#tags-input_in').tagsinput('add', tags[i].innerHTML);
    }

}