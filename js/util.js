var PREVIOUS_DAYS = 30;

var cars = {
    "none": {
        "range": 0
    },
    "model-s": {
        "range": 294
    },
    "model-x": {
        "range": 257
    },
    "model-3": {
        "range": 215
    },
    "i3": {
        "range": 114
    },
    "leaf": {
        "range": 107
    },
    "500e": {
        "range": 84
    }
};

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function elem(elementString) {
    return document.createElement(elementString);
}

function textNode(elem, string) {
    elem.appendChild(document.createTextNode(string));
    return elem;
}

function getColorForValue(value, carRange) {
    if (value < carRange * .75) {
        return 'green';
    } else if (value < carRange) {
        return 'yellow';
    } else {
        return 'red';
    }
}

function needsCharge(distance, carRange) {
    return distance > carRange * .75;
}

function getClassForValue(value, carRange) {
    if (value < carRange * .75) {
        return '';
    } else if (value < carRange) {
        return 'warning';
    } else {
        return 'danger';
    }
}

function getCarRange() {
    var car = getCar();
    return car.range;
}

function getCar() {
    var carId = document.getElementById('select-car').value;
    return cars[carId];
}

function getSpinner() {
    var target = document.getElementById("spinner");
    var spinner = new Spinner({}).spin(target);
    return spinner;
}

function setPreviousDays(prevDays) {
    PREVIOUS_DAYS = prevDays;
    document.getElementById('prev_days_span').innerHTML = PREVIOUS_DAYS;
}
setPreviousDays(PREVIOUS_DAYS);

function shouldShowDay(day) {
    return needsCharge(day.distance, getCarRange());
}

// TODO - have a dropdown menu to choose between all and open
function getStations() {
    return getAllStations();
}

function getOpenStations() {
    return charging_stations.open;
}

function getAllStations() {
    return charging_stations.open.concat(charging_stations.other);
}

// TODO - need to store trip locations along the way
function nearestChargingStation(location, stations) {
    var lat1 = location.lat;
    var long1 = location.long;
    
    var closestDist = 9999999;
    var closest = {};
    for (var i = 0; i < stations.length; i++) {
        var currStation = stations[i];
        var lat2 = currStation.lat;
        var long2 = currStation.long;

        var dist = distance(lat1, long1, lat2, long2);
        if (dist < closestDist) {
            closestDist = dist;
            closest = currStation;
        }
    }
    closest.distance = round(closestDist, 1);
    return closest;
}