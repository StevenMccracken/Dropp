class DroppError extends Error {
  constructor(_details = {}, ..._params) {
    super(..._params);

    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.details = _details;
  }
}

module.exports = DroppError;
