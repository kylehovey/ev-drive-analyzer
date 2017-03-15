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
        spinner.stop();
    }
    fr.readAsText(files.item(0));
};
