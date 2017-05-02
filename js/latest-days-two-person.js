
// Combine both people's data into one array, starting with the first person's first day
// Use a simple algorithm to decide who gets gas or EV car, return an array of those as well
function assignVehiclesAndCombine(results1, results2, numberOfDays) {
    var combinedDays = [];
    var evOnlyResults = {days: [], trips: []};

    var latestDays1 = results1.days.slice(); //results1.days.slice(Math.max(results1.days.length-numberOfDays, 1));
    var latestDays2 = results2.days.slice(); // results2.days.slice(Math.max(results2.days.length-numberOfDays, 1));
    latestDays1.reverse();
    latestDays2.reverse();

    var range = getCarRange();
    for (var i = 0; i < latestDays1.length; i++) {
        var day1 = latestDays1[i];
        var day2 = null;
        for (var j = 0; j < latestDays2.length; j++) {
            if (latestDays2[j].date == day1.date) {
                day2 = latestDays2[j];
                break;
            }
        }
        if (day2 == null) {
            day2 = {distance: 0, trips: []}
        }

        var day1Color = getColorForValue(day1.distance, range);
        var day2Color = getColorForValue(day2.distance, range);
        var gasForFirst = false;
        if (day1Color != "red" || day2Color != "red") {
            // At least one of the cars was within the EV range
            if (day1Color == "red") {
                // car is out of range so take gas
                gasForFirst = true;
            } else if (day2Color == "red") {
                // NOP
            } else if (day1.distance == 0) {
                // car didn't travel so give gas
                gasForFirst = true;
            } else if (day2.distance == 0) {
                // NOP
            } else if (day2.distance > day1.distance) {
                // car 1 travelled less, give it gas car
                gasForFirst = true;
            }
        } else {
            // If both travelled too far, pick whichever drove less for EV to reduce fillups
            if (day1.distance <= day2.distance) {
                // NOP
            } else {
                gasForFirst = true;
            }
        }

        day1.car = gasForFirst? "Gas" : "EV";
        day2.car = gasForFirst? "EV" : "Gas";
        if (day1.car == "EV") {
            evOnlyResults.days.push(day1);
            evOnlyResults.trips.push(...day1.trips);
        } else {
            evOnlyResults.days.push(day2);
            evOnlyResults.trips.push(...day2.trips);
        }

        if (i < numberOfDays) {
            combinedDays.push({
                date: day1.date,
                person1: day1,
                person2: day2
            });
        }
    }
    // Reverse so it matches the normal trip output
    evOnlyResults.trips.reverse();
    return {
        latestDays: combinedDays,
        evOnlyResults: evOnlyResults
    };
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
        if (day.car == "EV") {
            td2.className = getClassForValue(currTrip.distance, getCarRange());
        }
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
        if (currDay.car == "EV") {
            distanceCell.className = getClassForValue(currDay.distance, getCarRange());
        }
        tripCell.appendChild(tableForTrips(currDay));
    }
}

function outputLatestDaysTrips(combinedLatestDays) {
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
    var th5 = textNode(elem('th'), ' ');
    var th6 = textNode(elem('th'), 'Distance 2 (miles)');
    var th7 = textNode(elem('th'), 'Trips 2');
    var th8 = textNode(elem('th'), 'Car 2');
    trHead.appendChild(th1);
    trHead.appendChild(th2);
    trHead.appendChild(th3);
    trHead.appendChild(th4);
    trHead.appendChild(th5);
    trHead.appendChild(th6);
    trHead.appendChild(th7);
    trHead.appendChild(th8);
    tHead.appendChild(trHead);
    table.appendChild(tHead);

    // Table body
    var tBody = elem('tBody');

    var postedDays = 0;

    // swap this to use combined array of days instead
    for (var i = 0; i < combinedLatestDays.length; i++) {
        var currDay1 = combinedLatestDays[i].person1;
        var currDay2 = combinedLatestDays[i].person2;

        if (!shouldShowDay(currDay1) || currDay1.car == "Gas"
            && !shouldShowDay(currDay2) || currDay2.car == "Gas") {
            continue;
        }

        var tr = elem('tr');

        var td1 = elem('td');
        td1 = textNode(td1, combinedLatestDays[i].date);

        var td2 = elem('td');
        var td3 = elem('td');
        var td4 = elem('td');
        var td5 = elem('td');
        var td6 = elem('td');
        var td7 = elem('td');
        var td8 = elem('td');

        // populate rows
        createCellsForDay(td2, td3, currDay1);
        createCellsForDay(td6, td7, currDay2);
        textNode(td4, currDay1.car);
        textNode(td8, currDay2.car);

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
        tr.appendChild(td8);
        tBody.appendChild(tr);
    }
    table.appendChild(tBody);

    latestDaysDiv.innerHTML = "";
    latestDaysDiv.appendChild(table);
}
