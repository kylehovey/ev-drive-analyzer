// Takes Google Location History JSON as input and produces a summarized output with trips and days
// JSON from processLocationHistory() looks like:
// {
//     "trips": [{"distance": 1000, "avgMph": 30, "totalTime": 1000, "startDatetime": "2017-03-14 03:30:00", startTime: 14123123}],
//     "days": [{"date": "2017-03-14", "distance": 1000}],
//     "summary": ["totalDistance": 1000000, "avgDistancePerDay": 100, "totalDays": 100, "totalTrips": 100]
// }
// Inspired by https://github.com/Scarygami/location-history-json-converter
//   and https://github.com/kyleai/Google-Location-History-Total-Distance-Travelled

function processLocationHistory(locationJSON) {
    var locations = locationJSON.locations;

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
                    addTrip(currTrip, trips);
                }
                currTrip = createTripObject();
            }
            currTrip = addLocationToTrip(loc, distanceDelta, currTrip);

            // Process days
            if (newDate != currDate) {
                if (isValidDay(currDate, currDayDistance)) {
                    days.push({date: currDate, distance: round(currDayDistance, 1)})
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
        addTrip(currTrip, trips);
    }
    if (isValidDay(currDate, currDayDistance)) {
        days.push({date: currDate, distance: round(currDayDistance, 1)})
    }

    summary.totalTrips = trips.length;
    summary.totalDays = days.length;
    summary.avgDistancePerDay = summary.totalDistance / summary.totalDays;
    var results = {trips: trips, days: days, summary: summary};
    return results;
}

function addTrip(trip, trips) {
    trip.startTime = round(trip.startTime, 0);
    trip.totalTime = round(trip.totalTime, 0);
    trip.distance = round(trip.distance, 1);
    trips.push(trip);
}

function createTripObject() {
    return {distance: 0, totalTime: 0, startTime: 0, startDatetime: ""};
}

function addLocationToTrip(loc, distanceDelta, trip) {
    if (trip.startDatetime.length == 0) {
        trip.startTime = parseInt(loc.timestampMs) * Math.pow(10, -3);
        trip.startDatetime = timestampToDatetime(loc.timestampMs);
    } else {
        trip.distance += distanceDelta
        trip.totalTime = Math.abs(parseInt(loc.timestampMs) * Math.pow(10, -3) - trip.startTime);
    }
    return trip;
}

function isValidTrip(trip) {
    return trip.distance > 1;
}

// Only add day if distance isn't greater than 500 (probably flew in a plane)
function isValidDay(currDate, currDayDistance) {
    return currDate.length > 0 && currDayDistance < 500;
}

// Moment auto formatted
// 9/4/1986 8:30 PM
function timestampToDatetime(timestamp) {
    return timestampToDate(timestamp) + " " + moment(parseInt(timestamp)).format("LT");
}

// Moment auto formatted
// 9/4/1986
function timestampToDate(timestamp) {
    return moment(parseInt(timestamp)).format("l");
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

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}