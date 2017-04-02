
function getLatestDaysFromResults(results, numberOfDays) {
    var days = results.days;
    var lastXDays = days.slice(0, Math.min(numberOfDays, days.length));
    return lastXDays;
}

var SECONDS_PER_DAY = 86400;
function getLatestTripsFromResults(results, numberOfDays) {
    var trips = results.trips;
    var lastTrip = trips[trips.length-1];
    var lastTrips = [];
    var earliestTimestamp = lastTrip.startTime - (numberOfDays*SECONDS_PER_DAY);
    for (var i = 0; i < trips.length; i++) {
        var currTrip = trips[i];
        if (currTrip.startTime > earliestTimestamp) {
            lastTrips.push(currTrip);
        } else {
            break;
        }
    }
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

// Takes moment.duration as input
// returns "2 hour(s) 30 minute(s)" properly formatted
function formatDuration(momentDuration) {
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
    table.className = "table";

    // Header row
    var tHead = elem('thead');
    var trHead = elem('tr');
    var th1 = textNode(elem('th'), 'Start time');
    var th2 = textNode(elem('th'), 'Distance (miles)');
    var th3 = textNode(elem('th'), 'Duration');
    trHead.appendChild(th1);
    trHead.appendChild(th2);
    trHead.appendChild(th3);
    tHead.appendChild(trHead);
    table.appendChild(tHead);

    // Data rows
    var tBody = elem('tbody');
    for (var j = 0; j < trips.length; j++) {
        var tr = elem('tr');

        var currTrip = trips[j];
        var startTimestamp = currTrip.startTime
        var date = moment.unix(startTimestamp);
        var duration = moment.duration(currTrip.totalTime, "seconds");

        var td1 = textNode(elem('td'), date.format("LT"));
        var td2 = textNode(elem('td'), currTrip.distance);
        var td3 = textNode(elem('td'), formatDuration(duration));

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tBody.appendChild(tr);
    }
    table.appendChild(tBody);

    return table;
}

function outputLatestDaysTrips(latestDays) {
    var latestDaysDiv = document.getElementById('latest_days_div');

    var table = elem('table');
    table.className = "table";

    // Table Header
    var tHead = elem('thead');
    var trHead = elem('tr');
    var th1 = textNode(elem('th'), 'Date');
    var th2 = textNode(elem('th'), 'Distance (miles)');
    var th3 = textNode(elem('th'), 'Trips');
    trHead.appendChild(th1);
    trHead.appendChild(th2);
    trHead.appendChild(th3);
    tHead.appendChild(trHead);
    table.appendChild(tHead);

    // Table body
    var tBody = elem('tBody');
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
        tBody.appendChild(tr);
    }
    table.appendChild(tBody);

    latestDaysDiv.innerHTML = "";
    latestDaysDiv.appendChild(table);
}
