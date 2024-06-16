const catchAsync = require('../../utils/catch-async')
const {
    initData,
    addteamService,
    createLeague,
    createMatches,
    updateSeasonAndTeam,
    createTeamsC1,
    updateGroupIdWithNationCup,
    addSeasons,
    updateLeague,
    insertVideo,
    addOneSeason,
    createRounds,
} = require('../services/init.service')
const { linkLeague } = require('../../libs/link/link.league')
const axios = require('axios')

var that = (module.exports = {
    initData: catchAsync(async (req, res) => {
        const fs = require('fs')
        initData(fs)
        return res.status(200).json({
            success: true,
        })
    }),

    addTeam: catchAsync(async (req, res) => {
        // const teams = require('../../../data.json')
        const { league, season } = req.query

        await addteamService(league, season)
        res.status(200).json({
            success: true,
            meta: {
                league,
                season,
            },
        })
    }),
    createLeague: catchAsync(async (req, res) => {
        const { league } = req.query
        let isGroup = false
        if (league.id === 7) isGroup = true
        const newLeague = await createLeague(league, isGroup)
        return res.status(200).json({
            success: true,
            data: newLeague,
        })
    }),
    createMatches: catchAsync(async (req, res) => {
        const { length, league, season } = req.query
        const matches = await createMatches(league, season, length)
        return res.status(200).json({
            success: true,
            data: matches,
            meta: {
                length,
                league,
                season,
            },
        })
    }),
    updateTeams: catchAsync(async (req, res) => {
        const { league } = req.query
        const data = await updateSeasonAndTeam(league)
        return res.status(200).json({
            success: true,
            data,
        })
    }),
    createTeamsC1: catchAsync(async (req, res) => {
        const { league, season } = req.query
        const table = await createTeamsC1(league, season)
        return res.status(200).json({
            success: true,
            data: table,
        })
    }),
    updateGroupIdWithNationCup: catchAsync(async (req, res) => {
        const { league } = req.query
        const data = await updateGroupIdWithNationCup(league)
        return res.status(200).json({
            success: true,
            data,
        })
    }),
    addSeasons: catchAsync(async (req, res) => {
        const { league } = req.query
        await addSeasons()
        return res.status(200).json({
            success: true,
        })
    }),
    updateLeague: catchAsync(async (req, res) => {
        const { league } = req.params
        const { data } = req.body

        await updateLeague(league, data)
        return res.status(200).json({
            success: true,
        })
    }),
    addPlaylist: catchAsync(async (req, res) => {
        const { nation, league, season, limit } = req.query

        const result = await insertVideo(league, season, nation, limit)
        return res.status(200).json({
            success: true,
            data: result,
        })
    }),
    addAFullLeague: catchAsync(async (req, res) => {
        const { leagueId, img, channelId, name, season, year, lengthRound } = req.body //euro
        const link = linkLeague[leagueId]
        const { standings } = await axios.get(link.standings).then((res) => res.data)
        const newLeague = await createLeague(standings, img, channelId)
        const newSeason = await addOneSeason(newLeague._id, name, season, year)

        await createRounds(newLeague._id, newSeason._id, lengthRound)

        const teams = await createTeamsC1(newLeague, standings, newSeason)

        res.status(200).json({
            success: true,
            newLeague,
            newSeason,
            length: teams,
        })
    }),
})
