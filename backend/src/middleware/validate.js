const { error } = require('../utils/response');

const validate = (schema) => {
  return (req, res, next) => {
    const { error: validationError } = schema.validate(req.body);
    if (validationError) {
      return error(
        res,
        'Validation error',
        400,
        validationError.details.map((d) => d.message)
      );
    }
    next();
  };
};

module.exports = { validate };
