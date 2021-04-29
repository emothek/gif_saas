const { checkSchema, validationResult } = require("express-validator")

const signinValidationRules = () => {
    return checkSchema({
        email:{
            errorMessage: 'Please enter a valid email address',
            isEmail : true,
            trim: true,
        },
        password:{
            isLength: {
            errorMessage: 'Password should be at least 6 chars long',
            // Multiple options would be expressed as an array
            options: { min: 6 }
            }
        },
        role:{
            isString: true,
            in: ['admin', 'superadmin', 'user'],
            errorMessage: 'Role is required'
        },
    })
};

const signinValidate = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))
  
    return res.status(422).json({
      errors: extractedErrors,
    })
  }

module.exports = {
    signinValidationRules,
    signinValidate
}