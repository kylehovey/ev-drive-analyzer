var results = null;
var latestDaysTrips = null;

function updateUI() {
    if (results == null) {
        alert("Need to upload a file first!");
        return;
    }

    var spinner = getSpinner();

    setTimeout(function() {
        outputChartSummary(results);
        outputLatestDaysTrips(latestDaysTrips);

        document.getElementById("all_output").style.visibility = "visible";
        spinner.stop();
    }, 0);
}

document.getElementById('selectFiles').onchange = function() {
    var files = document.getElementById('selectFiles').files;
    if (files.length <= 0) {
        return false;
    }

    var spinner = getSpinner();

    var fr = new FileReader();
    fr.onload = function(e) { 
        try {
            // Strip whitespace
            var contents = e.target.result.replace(/\s+/g,"").replace(/(\r\n|\n|\r)/gm,"");
            var parsedContents = JSON.parse(contents);
        } catch (SyntaxError) {
            alert("Error: File is either >256MB or not valid. If the file is >256MB, try using Safari or Edge instead.")
        }

        results = processLocationHistory(parsedContents);
        console.log(results);
        latestDaysTrips = getLatestDaysTripsFromResults(results, PREVIOUS_DAYS);
        console.log(latestDaysTrips);

        updateUI();

        spinner.stop();
    }
    fr.readAsText(files.item(0));
}

document.getElementById('select-car').onchange = function() {
    updateUI();
}

document.getElementById('previous-days').oninput = function(event) {
    var prevDaysString = event.target.value;
    var prevDays = parseInt(prevDaysString);
    if (Number.isInteger(prevDays)) {
        setPreviousDays(parseInt(prevDaysString))
        latestDaysTrips = getLatestDaysTripsFromResults(results, PREVIOUS_DAYS);
        console.log(latestDaysTrips);
        updateUI();
    }
}

document.getElementById('only-problem-days').onchange = function() {
    updateUI();
}

document.getElementById('stations-to-use').onchange = function() {
    updateUI();
}

document.getElementById('use-log-scale').onchange = function(event) {
    if (event.target.checked) {
        defaultBarChartOptions.vAxis.scaleType = 'log'
    } else {
        defaultBarChartOptions.vAxis.scaleType = 'linear'
    }
    updateUI();
}