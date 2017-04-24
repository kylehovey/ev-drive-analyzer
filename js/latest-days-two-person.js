
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
        // td2.className = getClassForValue(currTrip.distance, getCarRange());
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

function createCellsForDay(distanceCell, tripCell, currDay) {
    if (currDay.trips.length == 0) {
        textNode(tripCell, "No trips");
    } else {
        textNode(distanceCell, currDay.distance);
        // distanceCell.className = getClassForValue(currDay.distance, getCarRange());
        tripCell.appendChild(tableForTrips(currDay));
    }
}

// TODO - pick EV for greatest distance if < car range, otherwise flip
function determineCarToDrive(cell1, cell2, day1, day2) {
    if (day1.distance == 0) {
        textNode(cell1, "Gas");
        textNode(cell2, "EV");
    } else if (day2.distance == 0) {
        textNode(cell1, "EV");
        textNode(cell2, "Gas");
    } else if (day1.distance <= day2.distance) {
        textNode(cell1, "EV");
        textNode(cell2, "Gas");
    } else {
        textNode(cell1, "Gas");
        textNode(cell2, "EV");
    }
}

function outputLatestDaysTrips(latestDays1, latestDays2) {
    var latestDaysDiv = document.getElementById('latest_days_div');

    var table = elem('table');
    table.className = "table table-striped table-bordered";

    // Table Header
    var tHead = elem('thead');
    var trHead = elem('tr');
    var th1 = textNode(elem('th'), 'Date');
    var th2 = textNode(elem('th'), 'Distance 1 (miles)');
    var th3 = textNode(elem('th'), 'Trips 1');
    var th4 = textNode(elem('th'), 'Car 1');
    var th5 = textNode(elem('th'), 'Distance 2 (miles)');
    var th6 = textNode(elem('th'), 'Trips 2');
    var th7 = textNode(elem('th'), 'Car 2');
    trHead.appendChild(th1);
    trHead.appendChild(th2);
    trHead.appendChild(th3);
    trHead.appendChild(th4);
    trHead.appendChild(th5);
    trHead.appendChild(th6);
    trHead.appendChild(th7);
    tHead.appendChild(trHead);
    table.appendChild(tHead);

    // Table body
    var tBody = elem('tBody');

    var postedDays = 0;

    for (var i = 0; i < latestDays1.length; i++) {
        var currDay1 = latestDays1[i];
        var currDay2 = null;
        for (var j = 0; j < latestDays2.length; j++) {
            if (latestDays2[j].date == currDay1.date) {
                currDay2 = latestDays2[j];
                break;
            }
        }
        if (currDay2 == null) {
            currDay2 = {distance: 0, trips: []}
        }
        if (!shouldShowDay(currDay1) && !shouldShowDay(currDay2)) {
            continue;
        }

        var tr = elem('tr');

        var td1 = elem('td');
        td1 = textNode(td1, currDay1.date);

        var td2 = elem('td');
        var td3 = elem('td');
        var td4 = elem('td');
        var td5 = elem('td');
        var td6 = elem('td');
        var td7 = elem('td');

        // populate rows
        createCellsForDay(td2, td3, currDay1);
        createCellsForDay(td5, td6, currDay2);
        determineCarToDrive(td4, td7, currDay1, currDay2);

        // Based on range for each driver's days, determine if they are potential problem days if both would need fill up w/EV
        var range = getCarRange();
        if (getClassForValue(currDay1.distance, range) != "" && getClassForValue(currDay2.distance, range) != "") {
            var worst = "warning";
            if (getClassForValue(currDay1.distance, range) == "danger" && getClassForValue(currDay2.distance, range) == "danger") {
                worst = "danger";
            }
            tr.className = worst;
        }

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
        tr.appendChild(td6);
        tr.appendChild(td7);
        tBody.appendChild(tr);
    }
    table.appendChild(tBody);

    latestDaysDiv.innerHTML = "";
    latestDaysDiv.appendChild(table);
}
