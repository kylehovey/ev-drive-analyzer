$(() => {
  // Create the application
  window.app = new App();

  // Initialize data
  window.app.init();

  // Initialize fullpage
  $("#fullpage").fullpage();

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
});
