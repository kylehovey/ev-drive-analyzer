var results1 = null;
var results2 = null;
var latestDaysTrips1 = null;
var latestDaysTrips2 = null;

function updateUI(fromFile = false) {
    if (results1 == null || results2 == null) {
        if (!fromFile) {
            alert("Need to upload both files first!");
        }
        return;
    }

    var spinner = getSpinner();

    setTimeout(function() {
        outputLatestDaysTrips(latestDaysTrips1, latestDaysTrips2);

        document.getElementById("all_output").style.visibility = "visible";
        spinner.stop();
    }, 0);
}

function parseFile(e, isFirst) {
    try {
        // Strip whitespace
        var contents = e.target.result.replace(/\s+/g,"").replace(/(\r\n|\n|\r)/gm,"");
        var parsedContents = JSON.parse(contents);
    } catch (SyntaxError) {
        alert("Error: File is either >256MB or not valid. If the file is >256MB, try using Safari or Edge instead.")
    }

    var results0 = processLocationHistory(parsedContents);
    var latestDaysTrips0 = getLatestDaysTripsFromResults(results0, PREVIOUS_DAYS);

    console.log(results0);
    console.log(latestDaysTrips0);
    if (isFirst) {
        results1 = results0;
        latestDaysTrips1 = latestDaysTrips0;
    } else {
        results2 = results0;
        latestDaysTrips2 = latestDaysTrips0;
    }

    updateUI(true);
}

document.getElementById('selectFiles').onchange = function() {
    var files = document.getElementById('selectFiles').files;
    if (files.length <= 0) {
        return false;
    }

    document.getElementById('selectFilesText').value = files.item(0).name

    var spinner = getSpinner();

    var fr = new FileReader();
    fr.onload = function(e) { 
        parseFile(e, true);
        spinner.stop();
    }
    fr.readAsText(files.item(0));
}

document.getElementById('selectFiles2').onchange = function() {
    var files = document.getElementById('selectFiles2').files;
    if (files.length <= 0) {
        return false;
    }

    document.getElementById('selectFilesText2').value = files.item(0).name

    var spinner = getSpinner();

    var fr = new FileReader();
    fr.onload = function(e) {
        parseFile(e, false);
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
        latestDaysTrips1 = getLatestDaysTripsFromResults(results1, PREVIOUS_DAYS);
        latestDaysTrips2 = getLatestDaysTripsFromResults(results2, PREVIOUS_DAYS);
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