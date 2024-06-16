const express = require('express')
const router = express.Router()

const {
    initData,
    addTeam,
    updateTeams,
    createLeague,
    createMatches,
    createTeamsC1,
    updateGroupIdWithNationCup,
    addSeasons,
    updateLeague,
    addPlaylist,
    addAFullLeague,
} = require('../../controllers/init.ctrl')

// router.get('/write', initData)
// router.get('/add/teams', addTeam)
router.post('/add/all', addAFullLeague)
router.get('/create/league', createLeague)
router.get('/create/matches', createMatches)
router.get('/update/teams', updateTeams)
// router.get('/create/teams/c1', createTeamsC1)
router.get('/update/group', updateGroupIdWithNationCup)
// router.get('/create/seasons', addSeasons)
router.post('/update/league/:league', updateLeague)
router.get('/create/list', addPlaylist)

module.exports = router
