var PREVIOUS_DAYS = 30;

var cars = {
    "none": {
        "range": 0
    },
    "model-s": {
        "range": 294
    },
    "model-x": {
        "range": 157
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
