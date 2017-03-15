// Takes Google Location History JSON as input and produced a summarized output with trips and days
// JSON from processLocationHistory() looks like:
// {
//     "trips": [{"distance": 1000, "avgMph": 30, "totalTime": 1000, "startTime": "2017-03-14"}],
//     "days": [{"date": "2017-03-14", "distance": 1000}],
//     "summary": ["totalDistance": 1000000, "avgDistancePerDay": 100, "totalDays": 100, "totalTrips": 100]
// }
// Inspired by https://github.com/Scarygami/location-history-json-converter
//   and https://github.com/kyleai/Google-Location-History-Total-Distance-Travelled

function processLocationHistory(locationJSON) {
    var locations = locationJSON.locations;
    locations.sort(function(a,b) {
        return a.timestampMs - b.timestampMs;
    });

    var trips = [], days = [], summary = {totalDistance: 0};
    var prevTs = 0, prevLat = 0, prevLong = 0; // previous location's values
    var currTrip = createTripObject();
    var currDate = "";
    var currDayDistance = 0;
    for (var i = 0; i < locations.length; i++) {
        var loc = locations[i];
        var ts = parseInt(loc.timestampMs);
        var lat = loc.latitudeE7 * Math.pow(10, -7);
        var long = loc.longitudeE7 * Math.pow(10, -7);
        var newDate = timestampToDate(loc.timestampMs);
        if (prevTs != 0) {
            var timeDelta = Math.abs((ts - prevTs) / 1000.0 / 60.0);
            var distanceDelta = Math.abs(distance(lat, long, prevLat, prevLong));
            summary.totalDistance += distanceDelta;
            
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
    return trip.distance > 2;
}

// Only add day if distance isn't greater than 500 (probably flew in a plane)
function isValidDay(currDate, currDayDistance) {
    return currDate.length > 0 && currDayDistance < 500;
}

// 2017-03-14 10:30 
function timestampToDatetime(timestamp) {
    return new Date(parseInt(timestamp)).toISOString().substr(0, 19).replace('T', ' ');
}

// 2017-03-14
function timestampToDate(timestamp) {
    return new Date(parseInt(timestamp)).toISOString().substr(0, 10);
}

// http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
// Returns distance in miles
function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  var km = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  return km * 0.621371; // convert to miles
}
