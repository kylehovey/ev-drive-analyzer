$(() => {
  /* ===== Initialization Section ===== */
  // Create the application
  window.app = new App();

  // Initialize fullpage
  $("#fullpage").fullpage();

  Promise
    .resolve($.getJSON("/data/vehicleData.json"))
    .then(vehicles => {
      const vehicleSelect = $("#vehicle-select");

      vehicles
        .map(opts => new Vehicle(opts))
        .forEach(vehicle => {
          // Add vehicle to dealership
          app.dealership.addVehicle(vehicle);

          // Add vehicle to select menu
          vehicleSelect.append(
            `<option value=${vehicle.key}>${vehicle.title}</option>`
          );
        });

      // Update stats on vehicle select
      const [ firstVehicle ] = app.dealership.getVehicles();
      app.vehicleStats.setVehicle(firstVehicle);
      app.analyser.setVehicle(firstVehicle);
    });

  // Disable scrolling
  $.fn.fullpage.setAllowScrolling(false, "down, up");

  // ===== Listeners =====
  $("#upload-json").on("click", (e) => {
    $("#upload-json-input").trigger("click");
  });

  $("#upload-json-input").on("change", (e) => {
    // Start loading animation
    const upload = $("#upload-json");
    upload.button("loading");

    // Get the file
    const [ fileInput ] = $(e.target);
    const [ file ] = fileInput.files;

    // Create a file reader
    const reader = new FileReader();
    reader.onload = async (e) => {
      // Get raw data
      const data = JSON.parse(e.target.result);

      // Set data of trip analyser
      app.analyser.setData(data);

      // Add trip data to map
      app.map.addLayer({
        id : "trips",
        type : "line",
        source : {
          type : "geojson",
          data : app.analyser.getEdgeCollection()
        },
        layout : {
          "line-join" : "round",
          "line-cap" : "round"
        },
        paint : {
          "line-color" : "rgba(183, 42, 111, 1)",
          "line-width" : 1
        }
      });

      // Add endpoints to map
      app.map.addLayer({
        id : "endPoints",
        type : "symbol",
        source : {
          type : "geojson",
          data : app.analyser.getNodeCollection()
        },
        layout: {
          "icon-image": "circle-15",
          "icon-allow-overlap" : true
        },
        paint: { }
      });

      // Auto-zoom map
      app.map.fitBounds(app.analyser.getBounds());

      // Reset loader view
      await upload.fadeOut().promise();

      // Done!
      await $("#upload-done")
        .hide()
        .removeClass("hidden")
        .fadeIn()
        .promise();

      // Scroll down
      setTimeout(() => {
        $.fn.fullpage.moveSectionDown();
      }, 500);
    }

    // Read the file
    reader.readAsText(file);
  });

  $("#vehicle-select-accept").on("click", (e) => {
    $(e.target).text("Nice Choice!");
    $.fn.fullpage.moveSectionDown();
  });

  $("#vehicle-select").on("change", (e) => {
    const vehicle = app.dealership.getVehicle($(e.target).val());
    app.vehicleStats.setVehicle(vehicle);
    app.analyser.setVehicle(vehicle);
  });
});
