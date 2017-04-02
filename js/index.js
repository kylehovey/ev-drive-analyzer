var PREVIOUS_DAYS = 14;

google.charts.load('current', {packages: ['corechart', 'bar']});

function getColorForValue(value, carRange) {
    if (value < carRange * .75) {
        return 'green'
    } else if (value < carRange) {
        return 'yellow'
    } else {
        return 'red'
    }
}

function prepDataForGoogleChart(input, bucketWidth) {
    var carRange = Number(document.getElementById('select-car').value)
    var bucket = new Map();
    input.forEach(function(trip) {
        var key = Math.floor(trip['distance'] / bucketWidth);
        if (typeof(bucket.get(key)) == 'undefined') {
            bucket.set(key, 0);
        }
        bucket.set(key,  bucket.get(key) + 1);
    });
    var data = [];
    bucket.forEach(function(value, key) {
        var miles = key*bucketWidth;
        data.push([miles, value, getColorForValue(miles, carRange)]);
    });

    return data;
}

function createChartByTrip(result) {
    var bucketData = prepDataForGoogleChart(result, 10.0)

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Miles driven in trip');
    data.addColumn('number', 'Number of trips');
    data.addColumn({type: 'string', role: 'style'});

    data.addRows(bucketData)

    var options = {
        title: 'Miles traveled per trip',
        hAxis: {
            title: 'Number of miles',
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

    var chart = new google.visualization.ColumnChart(document.getElementById('chart_trips_div'));
    chart.draw(data, options);
}

function createChartByDay(result) {
    var bucketData = prepDataForGoogleChart(result, 10.0)

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Miles driven');
    data.addColumn('number', 'Number of days');
    data.addColumn({type: 'string', role: 'style'});

    data.addRows(bucketData)

    var options = {
        title: 'Miles traveled per day',
        hAxis: {
            title: 'Number of miles',
            viewWindow: {
                min: 0,
                max: 500
            }
        },
        vAxis: {
            title: 'Number of days',
            scaleType: 'log'
        },
        legend: {position: 'none'}
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('chart_days_div'));
    chart.draw(data, options);
}

function getLatestDaysFromResults(results, numberOfDays) {
    var days = results.days;
    var lastXDays = days.slice(Math.max(days.length - numberOfDays, 1));
    lastXDays.reverse()
    return lastXDays;
}

var SECONDS_PER_DAY = 86400;
function getLatestTripsFromResults(results, numberOfDays) {
    var trips = results.trips;
    var lastTrip = trips[trips.length-1];
    var lastTrips = [];
    var earliestTimestamp = lastTrip.startTime - (numberOfDays*SECONDS_PER_DAY);
    for (var i = trips.length-1; i > 0; i--) {
        var currTrip = trips[i];
        if (currTrip.startTime > earliestTimestamp) {
            lastTrips.push(currTrip);
        } else {
            break;
        }
    }
    lastTrips.reverse();
    return lastTrips;
}

function getLatestDaysTripsFromResults(results, numberOfDays) {
    var lastTrips = getLatestTripsFromResults(results, PREVIOUS_DAYS);
    var lastDays = getLatestDaysFromResults(results, PREVIOUS_DAYS);

    for (var i = 0; i < lastDays.length; i++) {
        var currDay = lastDays[i];
        var date = currDay.date;
        var tripsForDay = [];
        for (var j = 0; j < lastTrips.length; j++) {
            var currTrip = lastTrips[j];
            if (currTrip.startDatetime.includes(date)) {
                tripsForDay.push(currTrip);
            }
        }
        lastDays[i].trips = tripsForDay;
    }
    return lastDays;
}

function elem(elementString) {
    return document.createElement(elementString);
}

function textNode(elem, string) {
    elem.appendChild(document.createTextNode(string));
    return elem;
}

// Takes moment.duration as input
// returns "2 hour(s) 30 minute(s)" properly formatted
function durationFormat(momentDuration) {
    var hours = momentDuration.hours();
    var minutes = momentDuration.minutes();
    var output = "";
    if (hours > 0) {
        output += hours + (hours == 1 ? " hour" : " hours");
        if (minutes > 0) {
            output += " ";
        }
    }
    if (minutes > 0) {
        output += minutes + (minutes == 1 ? " minute" : " minutes");
    }
    return output;
}

function tableForTrips(trips) {
    var table = elem('table');

    for (var j = 0; j < currTrips.length; j++) {
        var currTrip = currTrips[j];
        var startTimestamp = currTrip.startTime
        var date = moment.unix(startTimestamp);
        var duration = moment.duration(currTrip.totalTime, "seconds");
        textNode(td3, "Start: " + date.format("LT") + " Distance: " + currTrip.distance + " Duration: " + durationFormat(duration));
    }

    return table;
}

function outputLatestDaysTrips(latestDays) {
    var latestDaysDiv = document.getElementById('latest_days_div');

    var table = elem('table');

    // Table header
    var trHeader = elem('tr');
    var th1 = textNode(elem('th'), 'Date');
    var th2 = textNode(elem('th'), 'Distance');
    var th3 = textNode(elem('th'), 'Trips');
    trHeader.appendChild(th1);
    trHeader.appendChild(th2);
    trHeader.appendChild(th3);
    table.appendChild(trHeader);

    // Table body
    for (var i = 0; i < latestDays.length; i++) {
        var tr = elem('tr');
        var currDay = latestDays[i];
        var currTrips = currDay["trips"];

        var td1 = elem('td');
        td1 = textNode(td1, currDay["date"]);

        var td2 = elem('td');
        var td3 = elem('td');
        if (currTrips.length == 0) {
            textNode(td3, "No trips");
        } else {
            textNode(td2, currDay.distance);
            td3.appendChild(tableForTrips(currTrips));
        }

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        table.appendChild(tr);
    }

    latestDaysDiv.innerHTML = "";
    latestDaysDiv.appendChild(table);
}

document.getElementById('import').onclick = function() {
    var files = document.getElementById('selectFiles').files;
    if (files.length <= 0) {
        return false;
    }

    var target = document.getElementById("spinner");
    var spinner = new Spinner({}).spin(target);

    var fr = new FileReader();
    fr.onload = function(e) { 
        try {
            // Strip whitespace
            var contents = e.target.result.replace(/\s+/g,"").replace(/(\r\n|\n|\r)/gm,"");
            var parsedContents = JSON.parse(contents);
        } catch (SyntaxError) {
            alert("Error: File is either >256MB or not valid. If the file is >256MB, try using Safari or Edge instead.")
        }

        var results = processLocationHistory(parsedContents);
        console.log(results);
        createChartByTrip(results['trips']);
        createChartByDay(results['days']);
        
        var latestDaysTrips = getLatestDaysTripsFromResults(results, PREVIOUS_DAYS);
        console.log(latestDaysTrips);
        outputLatestDaysTrips(latestDaysTrips);

        spinner.stop();
    }
    fr.readAsText(files.item(0));
};

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}