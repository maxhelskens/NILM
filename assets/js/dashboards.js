/**
 * Created by Max on 18/05/2017.
 */


/********************************
 *                              *
 *    Show appropriate navs     *
 *                              *
 ********************************/

if (sessionStorage.getItem('gas') == 'true') {
    $("#nav_gas").removeClass("hide");
}
if (sessionStorage.getItem('water') == 'true') {
    $("#nav_water").removeClass("hide");
}
if (sessionStorage.getItem('electricity') == 'true') {
    $("#nav_electricity").removeClass("hide");
}



/********************************
 *                              *
 *           Globals            *
 *                              *
 ********************************/

/** COLORS **/
color_gas = d3.scale.linear().domain([1,5])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#E0F3F7"), d3.rgb('#007038')]);

color_water = d3.scale.linear().domain([1,6])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#DAE8F5"), d3.rgb('#00579A')]);

color_electricity = d3.scale.linear().domain([1,7])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#FFF8CE"), d3.rgb('#ED6B2D')]);


function get_color (type, index) {
    if (type == 'gas') {
        return color_gas(index + 1)
    }
    else if (type == 'water') {
        return color_water(index + 1)
    }
    else {
        return color_electricity(index + 1)
    }
}

/** Appliance data**/
datapoints = {};
compare_data = {};
appID = -1;
dataID = -1;

function get_unit (type) {
    if (type == 'water') {
        return 'liter'
    }
    else {
        return 'Watt'
    }
}



/********************************
 *                              *
 *      Get all appliances      *
 *                              *
 ********************************/

function plot_stacked_bar(result, type) {

    /** PUT THE DATA IN THE CORRECT STRUCTURE **/
    var data = {};
    data.labels = [""];
    const datasets = [];

    var total_cons = 0;
    for (var i=0; i < result.length; i++) {
        total_cons += parseInt(result[i].Percentage);

        var set = {
            label: result[i].Name,
            data: [parseInt(result[i].Percentage)],
            backgroundColor: get_color(type, i)
        };

        datasets.push(set)
    }

    set = {
        label: 'Rest',
        data: [(100 - total_cons)],
        backgroundColor: get_color(type, result.length)
    };

    datasets.push(set);

    data.datasets = datasets;

    /** SET THE CHART OPTIONS **/
    const barOptions_stacked = {
        tooltips: {
            enabled: true,
            callbacks: {
                label: function (tooltipItem, data) {
                    if (data.datasets.length - 1 != tooltipItem.datasetIndex) {
                        show_appliance(tooltipItem.datasetIndex, data.datasets[tooltipItem.datasetIndex].backgroundColor);
                    }
                    return data.datasets[tooltipItem.datasetIndex].label + ' : ' + tooltipItem.xLabel + '%';
                }
            },
            position: 'cursor'
        },
        hover: {
            animationDuration: 0
        },
        scales: {
            xAxes: [{
                display: false,
                ticks: {
                    beginAtZero: false,
                    fontFamily: "'Open Sans Bold', sans-serif",
                    fontSize: 11
                },
                scaleLabel: {
                    display: false
                },
                gridLines: {
                    display: false
                },
                stacked: true
            }],
            yAxes: [{
                display: false,
                gridLines: {
                    display: false,
                    color: "#fff",
                    zeroLineColor: "#fff",
                    zeroLineWidth: 0
                },
                ticks: {
                    fontFamily: "'Open Sans Bold', sans-serif",
                    fontSize: 11
                },
                stacked: true
            }]
        },
        legend: {
            display: false
        },

        animation: {
            onCompvare: function () {
                const chartInstance = this.chart;
                const ctx = chartInstance.ctx;
                ctx.textAlign = "left";
                ctx.font = "9px Open Sans";
                ctx.fillStyle = "#fff";

                Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
                    const meta = chartInstance.controller.getDatasetMeta(i);
                    Chart.helpers.each(meta.data.forEach(function (bar, index) {
                        data = dataset.data[index];
                        if (i == 0) {
                            //ctx.fillText(data, 50, bar._model.y+4);
                        } else {
                            //ctx.fillText(data, bar._model.x-25, bar._model.y+4);
                        }
                    }), this)
                }), this);
            }
        },
        responsive: true,
        maintainAspectRatio: false
    };

    /** PLOT THE ACTUAL CHART **/
    const ctx = document.getElementById("stacked_bar");
    var myChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: data,
        options: barOptions_stacked
    });
}

function get_datasets(appliances, type) {

    for (var i = 0; i < appliances.length; i++) {

        $.ajax({
            type: 'GET',
            async: true,
            url: 'assets/php/get_data.php',
            contentType: 'application/json; charset=utf-8',
            data: {
                appliance_id: appliances[i].App_ID,
                index: i
            },
            dataType: 'json',
            success: function (result) {

                datapoints[result[0]] = {
                    start: result[1].Start,
                    data: result[2]
                };


                if (result[0] == 0) {
                    show_appliance(0, get_color(type, 0));
                    document.getElementById("preloader").className += " hide";
                    document.getElementById("preloader2").className += " hide";
                }
            }
        });

    }

}

$.getJSON("assets/php/get_appliances.php",
    {
        //TODO: Change back
        cons_type: $('#type').val(),
        user: sessionStorage.getItem('user')
    },
    function (result) {
        var type = $('#type').val();

        if(type == 'gas') {
            color_gas = d3.scale.linear().domain([1,result.length+1])
                .interpolate(d3.interpolateHcl)
                .range([d3.rgb("#E0F3F7"), d3.rgb('#007038')]);
        }
        else if (type == 'water') {
            color_water = d3.scale.linear().domain([1,result.length+1])
                .interpolate(d3.interpolateHcl)
                .range([d3.rgb("#DAE8F5"), d3.rgb('#00579A')]);
        }
        else {
            color_electricity = d3.scale.linear().domain([1,result.length+1])
                .interpolate(d3.interpolateHcl)
                .range([d3.rgb("#FFF8CE"), d3.rgb('#ED6B2D')]);
        }

        appliances = result;

        plot_stacked_bar(result, type);

        get_compare(result);
        get_datasets(result, type);


    });

$.getJSON("assets/php/get_tags.php",
    {
        cons_type: $('#type').val()
    },
    function (result) {

        const select = document.getElementById("tags_select");

        var option = document.createElement("option");
        option.text = '- Select a tag -';
        option.value = '';

        select.appendChild(option);

        for (var i = 0; i < result.length; i++) {
            var option = document.createElement("option");
            option.text = result[i].Name;
            option.value = result[i].Name;

            select.appendChild(option);
        }
    });

var prevID = -1;


/***********************************
 *                                 *
 *      Change appliance info      *
 *                                 *
 ***********************************/

function show_appliance(id, color) {
    if (id != prevID) {
        prevID = id;


        /** STORE CURRENT ID **/
        appID = appliances[id].App_ID;
        dataID = id;



        /** SET NAME TITLE **/
        document.getElementById('appliance_name').innerText = appliances[id].Name;

        /** SET CHARACTERISTICS **/
        document.getElementById('duration').innerHTML = appliances[id].Avg_duration + ' min';
        document.getElementById('consumption').innerHTML = appliances[id].Avg_tot_consumption + ' m<sup>3</sup>';
        document.getElementById('count').innerHTML = appliances[id].Count;
        document.getElementById('start_time').innerHTML = datapoints[id].start;
        document.getElementById('pricepo').innerText = '€'+appliances[id].Avg_price_per_occ;
        document.getElementById('pricetot').innerText = '€'+appliances[id].Total_price;

        /** SET COMPARE CHART **/
        console.log(compare_data[id]);
        if(compare_data[id] != null) {
            var canvas = document.getElementById("compare");
            var panel = canvas.parentNode;

            panel.innerHTML = "<canvas id='compare' height='50%' width='400'></canvas>";


            plot_compare(compare_data[id]);
        }
        else {
            // Get the correct panel
            var canvas = document.getElementById("compare");
            var panel = canvas.parentNode;

            // Add a 'NO DATA' tag to the panel
            panel.innerHTML =
                "<div id='compare' style='width: 100%; height: 60px ; display: -webkit-flex;" +
                " display: flex; align-items: center; justify-content: center;'>" +
                "<h4>Assign a tag to the appliance in order to compare to other users.</h4>" +
                "</div>";
        }

        /** CLEAR CHART **/
        const ctx = document.getElementById("line");
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);

        if (window.innerWidth >= 992) {
            ctx.height = 300;
        }
        else {
            ctx.height = 150;
        }


        const parentnode = ctx.parentNode;
        const iframes = parentnode.querySelectorAll('iframe');
        for (var i = 0; i < iframes.length; i++) {
            iframes[i].parentNode.removeChild(iframes[i]);
        }



        /** PROCESS DATA **/
        thisData = datapoints[id].data;

        labels = [];
        values = [];
        for (var i = 0; i < thisData.length; i++) {
            labels.push(thisData[i].index);
            values.push(thisData[i].Value);
        }


        const data = {
            labels: labels,
            datasets: [
                {
                    label: name,
                    fill: true,
                    lineTension: 0.1,
                    backgroundColor: color,
                    //borderColor: "rgba(75,192,192,1)",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    //pointBorderColor: "rgba(75,192,192,1)",
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    //pointHoverBackgroundColor: "rgba(75,192,192,1)",
                    //pointHoverBorderColor: "rgba(220,220,220,1)",
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: values,
                    spanGaps: false
                }
            ]
        };

        const options = {
            tooltips: {
                enabled: false
            },
            scales: {
                xAxes: [{
                    display: true,
                    ticks: {
                        fontFamily: "'Open Sans Bold', sans-serif",
                        fontSize: 11,
                        autoSkip: true,
                        maxTicksLimit: 20
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Time (min)'
                    },
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    display: true,
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        fontFamily: "'Open Sans Bold', sans-serif",
                        fontSize: 11
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Consumption ( '+ get_unit($('#type').val())+' )'
                    }
                }]
            },
            legend: {
                display: false
            },
            responsive: true,
            maintainAspectRatio: false
        };

        var myChart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        });
    }
}

$("#form_name").submit(function(e) {
    e.preventDefault();
});

function edit_appliance() {
    const name = $('#new_name').val();

    const e = document.getElementById("tags_select");
    const tag = e.options[e.selectedIndex].value;


    $.getJSON("assets/php/update_appliance.php",
        {
            new_name: name,
            tag: tag,
            id: appID
        });

    appliances[dataID].Name = name;
    document.getElementById('appliance_name').innerText = name;
    $('#myModal').modal('hide');


}


/**********************************
 *                                *
 *       Compare appliances       *
 *                                *
 **********************************/


function get_compare (result) {

    for (var i = 0; i < result.length; i++) {
        if (appliances[i].Tags_Tags_ID != 1) {
            $.getJSON('assets/php/get_same_devices.php',
                {
                    tag_id: appliances[i].Tags_Tags_ID
                },
                function (res) {
                    compare_data[i] = res;
                }
            );
        }

    }
}

function plot_compare (to_compare) {

    /** CLEAR CHART **/
    const ctx = document.getElementById("compare");
    ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);

    const parentnode = ctx.parentNode;
    const iframes = parentnode.querySelectorAll('iframe');
    for (var i = 0; i < iframes.length; i++) {
        iframes[i].parentNode.removeChild(iframes[i]);
    }

    if (window.innerWidth >= 992) {
        ctx.height = 50;
    }
    else {
        ctx.height = 50;
    }


    /** MODIFY DATA **/
    const data = [];
    const mydata = [];
    var max = to_compare[0].Avg_tot_consumption;
    var min = to_compare[0].Avg_tot_consumption;
    var this_appl = 0;

    for ( i = 0; i < to_compare.length; i++) {

        temp = {};

        if (to_compare[i].Users_ID != sessionStorage.getItem('user')) {
            temp.x = parseInt(to_compare[i].Avg_tot_consumption);
            temp.y = 0;
            temp.r = 10;

            data.push(temp);
        }
        else {
            temp.x = parseInt(to_compare[i].Avg_tot_consumption);
            temp.y = 0;
            temp.r = 10;

            mydata.push(temp);

            this_appl = to_compare[i].Avg_tot_consumption
        }

        if (to_compare[i].Avg_tot_consumption > max) {
            max = to_compare[i].Avg_tot_consumption;
        }
        if (to_compare[i].Avg_tot_consumption < min) {
            min = to_compare[i].Avg_tot_consumption
        }

    }

    const bubbleChartData =
        {
            datasets: [
                {
                    label: 'Appliances',
                    data: data,
                    backgroundColor: get_color($('#type').val(), 0),
                    hoverBackgroundColor: get_color($('#type').val(), 0)
                }, {
                    label: 'My Appliances',
                    data: mydata,
                    backgroundColor: get_color($('#type').val(), Math.ceil(appliances.length/2)),
                    hoverBackgroundColor: get_color($('#type').val(), Math.ceil(appliances.length/2))
                }]
        };


    /** PLOT CHART **/
    var scatterChart = new Chart(ctx, {
        type: 'bubble',
        data: bubbleChartData,
        options: {
            tooltips: {
                enabled: false
            },
            scales: {
                xAxes: [{
                    display: true,
                    ticks: {
                        beginAtZero: false,
                        fontFamily: "'Open Sans Bold', sans-serif",
                        fontSize: 11,
                        maxTicksLimit: 2
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Consumption ( '+ get_unit($('#type').val())+' )'
                    },
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    display: false,
                    gridLines: {
                        display: false,
                        color: "#fff",
                        zeroLineColor: "#fff",
                        zeroLineWidth: 0
                    },
                    ticks: {
                        beginAtZero: false,
                        fontFamily: "'Open Sans Bold', sans-serif",
                        fontSize: 11
                    }
                }]
            },
            legend: {
                display: false
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });


    /** CALCULATE STATUS **/

    if (to_compare.length > 1) {
        const percentage = (this_appl - min) / (max - min);

        if (percentage == 1) {
            // HIGHEST CONSUMER
            document.getElementById('comparison').innerText = 'Yours is the highest consumer';
        }
        else if (percentage == 0) {
            // LOWEST CONSUMER
            document.getElementById('comparison').innerText = 'Yours is the lowest consumer';
        }
        else if (percentage <= 0.5) {
            // LOWER CONSUMER
            document.getElementById('comparison').innerText = 'Bottem ' + (percentage * 100) + '% lowest consumer';
        }
        else {
            // HIGHER CONSUMER
            document.getElementById('comparison').innerText = 'Top ' + (100 - (percentage * 100)) + ' highest consumers';
        }
    }
    else {
        // ONLY ONE CONSUMER
        document.getElementById('comparison').innerText = 'Unable to compare this appliance';
    }
}

/*****************************************
 *                                       *
 *             Set Username              *
 *                                       *
 *****************************************/

$('#username').html(sessionStorage.getItem('first name') + ' ' + sessionStorage.getItem('last name'));

/***********************************
 *                                 *
 *         Other functions         *
 *                                 *
 ***********************************/

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