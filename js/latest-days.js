
function getLatestDaysTripsFromResults(results, numberOfDays) {
    var days = results.days;
    var lastXDays = days.slice(Math.max(days.length-numberOfDays, 1));
    lastXDays.reverse();
    return lastXDays;
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

function tableForTrips(day) {
    var table = elem('table');
    table.className = "table";
    var trips = day.trips;

    // Header row
    var tHead = elem('thead');
    var trHead = elem('tr');
    var th1 = textNode(elem('th'), 'Start time');
    var th2 = textNode(elem('th'), 'Distance (miles)');
    var th3 = textNode(elem('th'), 'Duration');
    var th4 = textNode(elem('th'), 'Possible charging station')
    trHead.appendChild(th1);
    trHead.appendChild(th2);
    trHead.appendChild(th3);
    trHead.appendChild(th4);
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
        var range = getCarRange();

        var td1 = textNode(elem('td'), date.format("LT"));
        var td2 = textNode(elem('td'), currTrip.distance);
        td2.className = getClassForValue(currTrip.distance, getCarRange());
        var td3 = textNode(elem('td'), formatDuration(duration));
        var td4 = elem('td');

        // Find nearest station if a charge is needed
        if (needsCharge(currTrip.distance, range)) {
            // Choose last point by default
            var locationToFind = currTrip.locations[currTrip.locations.length-1];
            // If has to have a charge, pick the midpoint to fillup
            if (getClassForValue(currTrip.distance, range) == "danger") {
                var midpointIndex = Math.floor(currTrip.locations.length/2.0);
                locationToFind = currTrip.locations[midpointIndex];
            }

            var nearest = nearestChargingStation(locationToFind, getStations());
            var outputString = nearest.name + " - " + nearest.city + ", " + nearest.state + " - " + nearest.distance + " miles";
            td4 = textNode(td4, outputString);
        } else if (j == trips.length - 1 && needsCharge(day.distance, range)) {
            // If entire day needs charge, add to last trips
            var locationToFind = currTrip.locations[currTrip.locations.length-1];
            var nearest = nearestChargingStation(locationToFind, getStations());
            var outputString = nearest.name + " - " + nearest.city + ", " + nearest.state + " - " + nearest.distance + " miles";
            td4 = textNode(td4, outputString);
        }
        // Used for testing to plot trip locations
        // td4 = textNode(td4, JSON.stringify(geoJsonFromLocations(currTrip.locations)));

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tBody.appendChild(tr);
    }
    table.appendChild(tBody);

    return table;
}

function outputLatestDaysTrips(latestDays) {
    var latestDaysDiv = document.getElementById('latest_days_div');

    var table = elem('table');
    table.className = "table table-striped table-bordered";

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
        var currDay = latestDays[i];
        if (!shouldShowDay(currDay)) {
            continue;
        }
        var tr = elem('tr');
        var currTrips = currDay.trips;

        var td1 = elem('td');
        td1 = textNode(td1, currDay.date);

        var td2 = elem('td');
        var td3 = elem('td');
        if (currTrips.length == 0) {
            textNode(td3, "No trips");
        } else {
            textNode(td2, currDay.distance);
            td2.className = getClassForValue(currDay.distance, getCarRange());
            td3.appendChild(tableForTrips(currDay));
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
