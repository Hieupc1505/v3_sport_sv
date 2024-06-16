const express = require('express')
const router = express.Router()

const {
    standings,
    leagues,
    teams,
    matches,
    infoAllLeague,

    searchVideo,
    updateResult,
} = require('../../controllers/sport.controller')

router.get('/:league/standings/:season', standings)
router.get('/seasons/:id', leagues)
router.get('/update/match', updateResult)

router.post('/search/:league', searchVideo)
router.get('/:league/matches/:season/round/:round', matches)
router.get('/info', infoAllLeague)

module.exports = router
