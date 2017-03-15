// Inspired by https://github.com/Scarygami/location-history-json-converter
//   and https://github.com/kyleai/Google-Location-History-Total-Distance-Travelled

function processLocationHistory(locationJSON) {
    var locations = locationJSON.locations;

    locations.sort(function(a,b) {
        return a.timestampMs - b.timestampMs;
    });

    var trips = [], days = [], summary = {totalDistance: 0};
    var prevTs = 0, prevLat = 0, prevLong = 0;
    var currDate = "";
    var currDayDistance = 0;
    var currTrip = createTripObject();
    for (var i = 0; i < locations.length; i++) {
        var loc = locations[i];
        var ts = parseInt(loc.timestampMs);
        var lat = loc.latitudeE7 * Math.pow(10, -7);
        var long = loc.longitudeE7 * Math.pow(10, -7);
        var newDate = timestampToDate(loc.timestampMs);
        if (prevLat != 0) {
            timeDelta = Math.abs((ts - prevTs) / 1000.0 / 60.0);
            distanceDelta = Math.abs(distance(lat, long, prevLat, prevLong));
            
            // Process trips, create new one if large gap in time or distance
            if (timeDelta > 10 || distanceDelta > 40) {
                if (isValidTrip(currTrip)) {
                    trips.push(currTrip);
                }
                currTrip = createTripObject();
            }
            currTrip = addLocationToTrip(loc, distanceDelta, currTrip);

            // Process days
            if (newDate != currDate) {
                if (isValidDay(currDate, currDayDistance)) {
                    days.push({date: currDate, distance: currDayDistance})
                }
                currDate = newDate;
                currDayDistance = 0;
            } else if (distanceDelta < 200) {
                currDayDistance += distanceDelta;
            }

            summary.totalDistance += distanceDelta;
        }
        prevTs = ts;
        prevLat = lat;
        prevLong = long;
    }
    if (isValidTrip(currTrip)) {
        trips.push(currTrip);
    }
    if (isValidDay(currDate, currDayDistance)) {
        days.push({date: currDate, distance: currDayDistance})
    }

    summary.totalTrips = trips.length;
    summary.totalDays = days.length;
    summary.avgDistancePerDay = summary.totalDistance / summary.totalDays;
    var results = {trips: trips, days: days, summary: summary};
    console.log(results);
    return results;
}

function createTripObject() {
    return {distance: 0, totalTime: 0, startTime: 0, startDatetime: ""};
}

function addLocationToTrip(loc, distanceDelta, trip) {
    if (trip.startDatetime.length == 0) {
        trip.startTime = parseInt(loc.timestampMs) * Math.pow(10, -4);
        trip.startDatetime = timestampToDatetime(loc.timestampMs);
    } else {
        trip.distance += distanceDelta
        trip.totalTime = parseInt(loc.timestampMs) * Math.pow(10, -4) - trip.startTime;
    }

    return trip;
}

function isValidTrip(trip) {
    return trip.distance > 5;
}

// Only add day if distance isn't greater than 500 (probably flew in a plane)
function isValidDay(currDate, currDayDistance) {
    return currDate.length > 0 && currDayDistance < 500;
}

// "Fri, 10 Mar 2017 00:21:32 GMT"
function timestampToDatetime(timestamp) {
    return (new Date(parseInt(timestamp))).toUTCString();
}

// "Tue Mar 14 2017"
function timestampToDate(timestamp) {
    return (new Date(parseInt(timestamp))).toDateString();
}

// http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
// In miles
function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  var km = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  return km * 0.621371;
}