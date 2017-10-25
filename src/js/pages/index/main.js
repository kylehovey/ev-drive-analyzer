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
  $("#upload-json").on("click", (e) => { });
});
