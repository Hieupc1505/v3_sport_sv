const fs = require('fs')
const axios = require('axios')
const { linkLeague, linkRound, result } = require('../../libs/link/link.league')

const { _Teams, _Specifics, _Leagues, _Matches, _Groups, _Seasons, _Rounds, _HighLight } = require('../models/sport')
const catchAsync = require('../../utils/catch-async')
const { removeLastThreeDigits, convertFiveMatch } = require('../../utils/sports')
// const client = require('../../loaders/redisLoader')
const { SchemaFieldTypes } = require('redis')
const { match } = require('assert')
const env = require('../../configs/env')
// const { populate } = require('../models/task.model')

var that = (module.exports = {
    standings: async (id, season) => {
        const league = await _Leagues.findOne({ id })
        const ss = await _Seasons.findOne({ id: season })

        const groups = await _Groups
            .find({ league_id: league._id, season: ss._id })
            .populate({
                path: 'rows',
                model: 'specifics',
                populate: {
                    path: 'team_id',
                    model: 'teams',
                },
            })
            .lean()

        // Sắp xếp sau khi đã populate
        let fiveMatch = {}
        for (let group of groups) {
            group.rows.sort((a, b) => {
                if (a.position === b.position) {
                    return b.points - a.points
                }
                return a.position - b.position
            })
        }

        let time = removeLastThreeDigits(new Date().getTime())

        for (let group of groups) {
            for (let row of group.rows) {
                let items = await _Matches
                    .find({
                        league_id: league._id,
                        startTime: { $lte: time },
                        $or: [{ home_team_id: row.team_id._id }, { away_team_id: row.team_id._id }],
                    })
                    .sort({ startTime: -1 })
                    .limit(5)
                const result = convertFiveMatch(items, row.team_id._id)
                fiveMatch = {
                    ...fiveMatch,

                    [row.team_id._id.toString()]: result,
                }
            }
        }
        return { groups, fiveMatch }

        // if (leagues.isGroup !== true) {
        //     const result = await _Specifics.find({ league_id: leagues._id }).sort({ position: 1 }).populate('team_id')

        //     return {
        //         stadings: [{ rows: result }],
        //     }
        // }
        // const groups = await _Groups.find({ league_id: leagues._id }).populate('team_ids')
    },
    matches: async (id, season, round) => {
        const league = await _Leagues.findOne({ id })
        const result = await _Seasons.findOne({ id: season })
        return await _Matches
            .find({
                league_id: league._id,
                round: round,
                season: result._id,
            })
            .populate(['home_team_id', 'away_team_id', 'season_id', 'highlight'])
            .sort({ startTime: 1 })
    },
    teams: async () => {},
    leagues: async (id, season = null) => {
        const league = await _Leagues.findOne({ id }).lean()
        const seasons = await _Seasons.find({ league_id: league._id }).lean()

        let rounds = await _Rounds.findOne({ league_id: league._id })

        if (season) {
            rounds = await _Rounds.find({ league_id: league._id, season_id: season })
        }

        return { seasons, rounds }
    },
    inforAllLeague: async () => {
        return _Leagues.find({}).lean()
    },

    getVideo: async (league, query, t, matchid, day = -1) => {
        let time = new Date(t * 1000 + day * 24 * 60 * 60 * 1000).toISOString()
        const lg = await _Leagues.findOne({ id: league })
        if (!lg.channelId) return null
        try {
            const result = await getVideoFromYTB(query, time, lg.channelId)

            if (result) {
                let hl = await _HighLight.findOne({ videoId: result.id.videoId })
                if (!hl) {
                    hl = await _HighLight.create({
                        league: lg._id,
                        title: result.snippet.title,
                        videoId: result.id.videoId,
                        publishedAt: new Date(result.snippet.publishedAt).getTime(),
                    })
                }
                console.log(hl._id, matchid)
                await _Matches.findOneAndUpdate(
                    {
                        id: matchid,
                    },
                    {
                        $set: {
                            highlight: hl._id,
                        },
                    }
                )
                return result.id.videoId
            }
            return null
        } catch (e) {
            return null
        }
    },

    updateResult: async (league, name) => {
        const lg = await _Leagues.findOne({ id: league })
        const finishMatch = '100',
            notStart = '0'
        const specs = await _Matches.find({
            league_id: lg._id,
            startTime: {
                $lte: convertTime(0.25),
            },
            status: notStart,
        })
        const { data } = await axios.get(linkLeague[name].standings)
        for (let item of specs) {
            const { data: data2 } = await axios.get(result(item.id))
            if (data2 && data2.event.status.code === 100) {
                let event = data2.event
                item.status = finishMatch
                item.home_team_score = event.homeScore.current
                item.away_team_score = event.awayScore.current
                item.winnerCode = event.winnerCode
                await item.save()
            }
        }

        for (let { rows } of data.standings) {
            for (let { position, matches, wins, losses, scoresFor, scoresAgainst, draws, points, id } of rows) {
                await _Specifics.findOneAndUpdate(
                    { id: id },
                    {
                        $set: {
                            position: position,
                            matches: matches,
                            wins: wins,
                            losses: losses,
                            scoresFor: scoresFor,
                            scoresAgainst: scoresAgainst,
                            draws: draws,
                            points: points,
                        },
                    }
                )
            }
        }
    },
})
const getString = (tt) => {
    let tar = tt.split(' - ')

    return `\"${tar[0]}\" ${tar[1]}\"`
}

const convertTime = (day) => {
    return Math.floor((new Date().getTime() + day * 24 * 60 * 60 * 1000) / 1000)
}
const getVideoFromYTB = async (q, t, channel) => {
    const { data } = await axios({
        method: 'GET',
        url: env.yt_v3.LINK_SEARCH,
        params: {
            part: 'snippet',
            maxResults: '4',
            key: env.yt_v3.KEY_API,
            q,
            publishedAfter: t,
            publishedBefore: new Date(new Date(t).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            regionCode: 'VN',
        },
    })

    const result = data.items.filter((item) => item.snippet.channelId === channel)
    return result.length ? result[0] : null
}

function getUrl(q, t) {
    var mykey = env.yt_v3.KEY_API,
        URL = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=4&publishedAfter=${new Date(
            t * 1000
        ).toISOString()}&publishedBefore=${new Date(
            t * 1000 + 5 * 24 * 60 * 60 * 1000
        ).toISOString()}&q=${q}&regionCode=VN&key=${mykey}`

    return URL
}
