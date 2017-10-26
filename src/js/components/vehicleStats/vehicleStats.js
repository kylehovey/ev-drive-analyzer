/**
 * View component that shows vehicle statistics
 */
class VehicleStats {
  /**
   * Construct a stats view for vehicles
   * @param {String} options.id Id of element to place stats in
   */
  constructor(options) {
    /**
     * @type {Object}
     */
    this._opts = Object.assign({
      id : null,
      vehicle : new Vehicle
    }, options);

    if (this._opts.id === null) {
      throw new Error("Must provide id for stats.");
    }

    /**
     * @type {Object}
     */
    this._container = $(`#${this._opts.id}`);

    this._container.append(`
      <ul class="fa-ul">
        <li>
          <i class="fa-li fa fa-battery-full"></i>
          <span id="${this._opts.id}-capacity"></span>
        </li>
        <li>
          <i class="fa-li fa fa-tachometer"></i>
          <span id="${this._opts.id}-economy"></span>
        </li>
        <li>
          <i class="fa-li fa fa-road"></i>
          <span id="${this._opts.id}-range"></span>
        </li>
        <li>
          <i class="fa-li fa fa-money"></i>
          <span id="${this._opts.id}-cost"></span>
        </li>
      </ul>
    `);

    this._render();
  }

  /**
   * Render the stats
   */
  _render() {
    $(`#${this._opts.id}-capacity`).text(`${this._opts.vehicle.capacity} kWh`);
    $(`#${this._opts.id}-economy`).text(`${this._opts.vehicle.economy} miles / kWh`);
    $(`#${this._opts.id}-range`).text(`${Math.round(this._opts.vehicle.getRange())} miles`);
    $(`#${this._opts.id}-cost`).text(`$${this._opts.vehicle.cost.toLocaleString()}`);
  }

  /**
   * Set the vehicle whose stats are displayed
   * @param {Vehicle} vehicle The vehicle wanted
   */
  setVehicle(vehicle) {
    this._opts.vehicle = vehicle; 
    this._render();
  }
}
