google.charts.load('current', {packages: ['corechart', 'bar']});

var defaultBarChartOptions = {
    title: 'Miles traveled',
    hAxis: {
        title: 'Number of miles (bucketed)',
        viewWindow: {
            min: 0,
            max: 500
        }
    },
    vAxis: {
        title: 'Number of trips',
        scaleType: 'log'
    },
    legend: {position: 'none'}
};

function prepDataForGoogleChart(input, bucketWidth) {
    var carRange = getCarRange();
    var bucket = new Map();
    input.forEach(function(trip) {
        var key = Math.floor(trip.distance / bucketWidth);
        if (typeof(bucket.get(key)) == 'undefined') {
            bucket.set(key, 0);
        }
        bucket.set(key, bucket.get(key) + 1);
    });
    var data = [];
    bucket.forEach(function(value, key) {
        var miles = key*bucketWidth;
        var color = getColorForValue(miles, carRange);
        data.push([miles, value, color]);
    });

    return data;
}

function createChartByTrip(trips) {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Miles driven in trip');
    data.addColumn('number', 'Number of trips');
    data.addColumn({type: 'string', role: 'style'});

    data.addRows(prepDataForGoogleChart(trips, 10.0));

    var chart = new google.visualization.ColumnChart(document.getElementById('chart_trips_div'));
    chart.draw(data, defaultBarChartOptions);
}

function createChartByDay(days) {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Miles driven in day');
    data.addColumn('number', 'Number of days');
    data.addColumn({type: 'string', role: 'style'});

    data.addRows(prepDataForGoogleChart(days, 10.0));

    var dayChartOptions = JSON.parse(JSON.stringify(defaultBarChartOptions));
    dayChartOptions.vAxis.title = "Number of days";

    var chart = new google.visualization.ColumnChart(document.getElementById('chart_days_div'));
    chart.draw(data, dayChartOptions);
}

function pieDataTable(good, possible, required) {
    return google.visualization.arrayToDataTable([
        ["Status", "Days"],
        ["Good", good],
        ["Possible fill-up", possible],
        ["Requires fill-up", required]
    ]);
}

function shouldStopChecking(distanceTraveled, carRange) {
    return (distanceTraveled*1.0 / carRange) > .95;
}

function shouldStartChecking(distanceTraveled, carRange) {
    return (distanceTraveled*1.0 / carRange) > .7;
}

// With long trips (75% of range) on a given day, check if charging stations exist
function canChargeTrips(trips) {
    var carRange = getCarRange();
    // Max distance to look for charging station - either 10% of max range or 15 miles
    var maxDistance = Math.min(carRange * 0.1, 10);
    var stations = getStations();

    // Look at all trips to see if need fill up
    for (var i = 0; i < trips.length; i++) {
        var trip = trips[i];
        if (needsCharge(trip.distance, carRange)) {
            var locations = trip.locations;
            var currDistance = 0;
            var prevLoc = locations[0];

            // "Travel" through points along trip, make sure we have charging points
            for (var i = 1; i < locations.length; i++) {
                var currLoc = locations[i];
                currDistance += distance(currLoc.lat, currLoc.long, prevLoc.lat, prevLoc.long);

                if (shouldStopChecking(currDistance, carRange)) {
                    return false;
                }
                if (shouldStartChecking(currDistance, carRange)) {
                    var nearest = nearestChargingStation(currLoc, stations);
                    if (nearest.distance < maxDistance) {
                        // Found station to fill up at, reset
                        currDistance = 0;
                    }
                }
                prevLoc = currLoc;
            }
        }
    }

    return true;
}

function createPieCharts(days) {
    var good = 0, possible = 0, required = 0;
    var chargeGood = 0, chargePossible = 0, chargeRequired = 0;
    var carRange = getCarRange();
    var maxTravelDistanceForCharge = 10;
    for (var i = 0; i < days.length; i++) {
        var day = days[i];
        var dayColor = getColorForValue(day.distance, carRange);
        var chargedColor = dayColor;
        if (chargedColor != "green") {
            if (canChargeTrips(day.trips)) {
                chargedColor = "green"
            } else {
                console.log(day);
            }
        }
        if (dayColor == "green") {
            good += 1;
        } else if (dayColor == "yellow") {
            possible += 1;
        } else {
            required += 1;
        }
        if (chargedColor == "green") {
            chargeGood += 1;
        } else if (chargedColor == "yellow") {
            chargePossible += 1;
        } else {
            chargeRequired += 1;
        }
    }

    var data = pieDataTable(good, possible, required);
    var chargeData = pieDataTable(chargeGood, chargePossible, chargeRequired);

    var pieNoCharge = new google.visualization.PieChart(document.getElementById('chart_no_charging_div'));
    var pieCharge = new google.visualization.PieChart(document.getElementById('chart_with_charging_div'));
    pieNoCharge.draw(data, {
        title: "Days range exhausted (not allowing charges)",
        slices: {
            0: {color: "green"},
            1: {color: "yellow"},
            2: {color: "red"}
        }
    });
    pieCharge.draw(chargeData, {
        title: "Days range exhausted (allowing charges)",
        slices: {
            0: {color: "green"},
            1: {color: "yellow"},
            2: {color: "red"}
        }
    });
}

function outputChartSummary(results) {
    var days = results.days;
    var trips = results.trips;

    createChartByDay(days);
    createChartByTrip(trips);
    createPieCharts(days);
}