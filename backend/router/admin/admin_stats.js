const express = require('express')
const router = express.Router()

const {getStats} = require('../../router_handler/admin/admin_stats')

router.get('/stats', getStats)

module.exports = router