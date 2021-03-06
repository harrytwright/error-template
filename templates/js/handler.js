'use strict';

const _ = require('statuses');
const Status = require('http-status-codes');

const { UnprocessableEntity, InternalServerError, Conflict } = require('./errors');

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function breakdownErrorToObject(error) {
  if (isProduction() && error.name === 'MongoError') {
    return {
      message: error.message
    };
  }

  if (error.name === 'MongoValidationError') {
    return {
      property: error.property,
      message: error.message,
      meta: {
        value: error.value
      }
    };
  }

  if (error.name === 'CastError' && error.model) {
    return {
      property: error.path,
      message: error.message,
      meta: {
        value: error.value,
        kind: error.kind,
        model: error.model.collection.collectionName
      }
    };
  } else if (error.name === 'CastError') {
    return {
      property: error.path,
      message: error.message,
      meta: {
        value: error.stringValue || error.value,
        kind: error.kind,
      }
    };
  }

  if (Array.isArray(error)) {
    return error.map((el) => breakdownErrorToObject(el));
  }

  return {
    message: error.message,
    name: error.name || Status.getStatusText(error.status || 500),
    code: error.code
  };
}

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  if (_.empty[err.status]) {
    return res.status(err.status).end();
  }

  if (_.redirect[err.status]) {
    return res.status(err.status).redirect(err.redirectURL);
  }

  if (err.name === 'CastError' && err.model) {
    err = new UnprocessableEntity('Malformed Request Body', err);
  } else if (err.name === 'CastError') {
    err = new InternalServerError('Cast Error', err);
  }

  const message = 'The request could not be completed due to a conflict with the current state of the target resource.';
  if (err.name === 'MongoError') {
    switch (err.code) {
      case 11000:
        // eslint-disable-next-line max-len
        err = new Conflict(message, err);
        break;
      default:
        break;
    }
  }

  if (err.name === 'ValidationError') {
    if (err.errors) {
      const underlyingError = [];
      for (const key in err.errors) {
        const _error = err.errors[key];
        const error = new Error(_error.message);
        error.name = 'MongoValidationError';
        error.property = _error.path;
        error.value = _error.value;

        underlyingError.push(error);
      }
      err = new UnprocessableEntity('The request could not be completed due to an invalid body', underlyingError);
    } else {
      err = new InternalServerError('Validation Failed', err);
    }
  }

  const errorObject = breakdownErrorToObject(err);
  if (err.underlyingError) {
    errorObject.underlyingError = breakdownErrorToObject(err.underlyingError);
  }

  if (err.name === 'TypeError') {
    errorObject.stack = err.stack;
  }

  return res.status(err.status || 500).json({
    error: errorObject,
    status: err.status || 500
  });
};
