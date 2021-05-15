const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const db = {}

db.mongoose = mongoose

db.user = require('./user.model')
db.role = require('./role.model')
db.gif = require('./gif.model')


db.ROLES = ['user', 'admin', 'superadmin']

module.exports = db;