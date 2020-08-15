'use strict'

var express = require("express")
var UsrController = require('../controllers/userController')
var md_auth = require('../middleware/authenticated')

var api = express.Router()
api.post('/commands',md_auth.ensureAuth,UsrController.commands)

module.exports = api;