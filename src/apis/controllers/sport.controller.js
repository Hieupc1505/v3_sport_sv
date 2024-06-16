const catchAsync = require('../../utils/catch-async')
const {
    matches,
    teams,
    leagues,
    standings,
    inforAllLeague,
    getVideo,

    updateResult,
} = require('../services/sport.service')
// const cloudinary = require('../../loaders/cloudinary')
var that = (module.exports = {
    standings: catchAsync(async (req, res) => {
        const { league, season } = req.params
        return res.status(200).json({
            success: true,
            data: await standings(league, season),
        })
    }),
    matches: catchAsync(async (req, res) => {
        const { round, league, season } = req.params
        return res.status(200).json({
            success: true,
            data: await matches(league, season, round),
        })
    }),
    teams: catchAsync(teams),
    leagues: catchAsync(async (req, res) => {
        const { id } = req.params
        const season = req.query?.season || null
        return res.status(200).json({
            success: true,
            data: await leagues(id, season),
        })
    }),
    infoAllLeague: catchAsync(async (req, res) => {
        return res.status(200).json({
            success: true,
            data: await inforAllLeague(),
        })
    }),
    searchVideo: catchAsync(async (req, res) => {
        const { q, pub, id } = req.body
        const { league } = req.params
        // console.log(nation, q, c, pub)
        return res.status(200).json({
            success: true,
            data: await getVideo(league, q, pub, id),
        })
    }),
    updateResult: catchAsync(async (req, res) => {
        const { league, name } = req.query
        return res.status(200).json({
            success: true,
            data: await updateResult(league, name),
        })
    }),
})
