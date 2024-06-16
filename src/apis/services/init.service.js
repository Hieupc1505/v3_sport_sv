const fs = require('fs')
const axios = require('axios')
const { linkLeague, linkRound, getRound } = require('../../libs/link/link.league')
const data = require('../../libs/league/league')
const { uploadImage, uploadImageLink } = require('../../utils/upload.image')
const { _Teams, _Specifics, _Leagues, _Matches, _Groups, _Seasons, _Rounds, _HighLight } = require('../models/sport')

const initData = async (fs) => {
    const axios = require('axios')
    axios
        .get(linkLeague['england'].standings)
        .then((response) => {
            // const data  = JSON.stringify(response.data, null, 2)
            const data = response.data.standings[0].rows
            const teams = JSON.stringify(data, null, 2)
            fs.writeFile('data.json', teams, (err) => {
                if (err) {
                    console.log('Error writing file:', err)
                } else {
                    console.log('Successfully wrote to file')
                }
            })
        })
        .catch((error) => {
            console.log('Error getting data from API:', error)
        })
}

const addteamService = async (league, season) => {
    const link = linkLeague[league].standings

    const data = await axios.get(link).then((res) => res.data)
    const teams = data.standings[0].rows
    teams.map(async (team) => {
        createATeam(team, linkLeague[league].id, season)
    })
}

const createLeague = async (standings, img, channelId) => {
    let isGroup = false
    if (standings.length > 1) isGroup = true
    const info = standings[0].tournament
    const logo = await uploadImage(info.uniqueTournament.id)
    const image = await uploadImageLink(img)

    const newleague = await _Leagues.create({
        id: info.uniqueTournament.id,
        name: info.uniqueTournament.name,
        country: info.category.name,
        slug: info.uniqueTournament.slug,
        isGroup: isGroup,
        logo,
        image: image,
        channelId: channelId ? channelId : undefined,
    })
    return newleague
}

const createMatches = async (league, season, length) => {
    for (let i = 1; i <= length; i++) {
        const roundlink = linkRound(league, season, i)
        const { events } = await axios.get(roundlink).then((res) => res.data)

        events.map(async (match, index) => {
            const homeTeam = await _Teams.findOne({ id: match.homeTeam.id })
            const awayTeam = await _Teams.findOne({ id: match.awayTeam.id })
            const league = await _Leagues.findOne({ id: match.tournament.uniqueTournament.id })
            const season = await _Specifics.findOne({ id: match.season.id })
            const newMatch = {
                id: match.id,
                round: i,
                home_team_id: homeTeam._id,
                away_team_id: awayTeam._id,
                home_team_score: match.homeScore.current,
                away_team_score: match.awayScore.current,
                league_id: league._id,
                season_id: season._id,
                status: match.status.code, //100 end, 60: postponed, 0: not start, 50: đoán cacnel
                startTime: match.startTimestamp,
                slug: match.slug,
                winnerCode: match.winnerCode,
            }
            await _Matches.create(newMatch)
        })
    }
    return 1
}

const updateSeasonAndTeam = async (leagueId) => {
    // const lg = await _Leagues.findOne({ id: leagueId })
    // const specs = await _Specifics.find({ league_id: lg._id }).populate('team_id')
    const { data } = await axios.get(linkLeague[leagueId].standings)
    for (let group of data.standings) {
        for (let { team, position, matches, wins, losses, scoresFor, scoresAgainst, draws, points, id } of group.rows) {
            const tm = await _Teams.findOne({ id: team.id })
            await _Specifics.findOneAndUpdate({ team_id: tm._id }, { $set: { id: id } })
        }
    }
    // return specs
}

const createTeamsC1 = async (leagueInfo, groups, season) => {
    // const link = linkLeague.c1.standings
    // const data = await axios.get(link).then((res) => res.data)
    // const groups = standings
    // const leagueInfo = await _Leagues.findOne({ id: linkLeague[league].id })
    let t = 0
    for (let { rows, tournament, name, id } of groups) {
        let groups = []
        for (let row of rows) {
            const teamId = await _Teams.getTeamId(row.team.id)

            if (!teamId) {
                const newSpecs = await createATeam(row, leagueInfo._id, season.id)
                groups.push(newSpecs._id)
            } else {
                if (await _Specifics.isNotExistOnLeagueGroup(teamId, leagueInfo._id)) {
                    await createATeam(row, leagueInfo._id, season.id)
                }
                groups.push(teamId)
            }
        }
        //make a group
        ++t
        const newGroup = await _Groups.create({
            name: name,
            id: id,
            league_id: leagueInfo._id,
            team_ids: groups,
            slug: tournament.slug,
            rows: groups,
            season: season._id,
        })
    }
    return t
}

const updateGroupIdWithNationCup = async (id, groups, leagueId, seasonId) => {
    // const link = linkLeague[league].standings
    // const data = await axios.get(link).then((res) => res.data)

    // const groups = data.standings
    for (let group of groups) {
    }

    const seasons = await _Specifics.find({ league_id: result._id })

    const newGroup = await _Groups.create({
        name: name,
        id: id,
        league_id: result._id,
        rows: seasons.map((item) => item._id),
        slug: tournament.slug,
    })

    // await _Specifics.updateMany({ league_id: league._id }, { $set: { group_id: groupId } })
    return newGroup
}

const addSeasons = async (season, year) => {
    const data = require('../../../data.json')

    let leagueName = ['england', 'spain', 'germany', 'france', 'italy', 'c1']
    for (let item of leagueName) {
        let league = data[item].seasons
        const link = linkLeague[item]

        const result = await _Leagues.findOne({ id: link.id })

        for (let i = 0; i <= 4; i++) {
            await _Seasons.create({
                ...league[i],
                league_id: result._id,
            })
        }
    }
}

const addOneSeason = async (leagueId, name, season, year) => {
    return await _Seasons.create({
        name,
        year,
        league_id: leagueId,
        id: season,
    })
}

const insertVideo = async (league, season, nation, limit) => {
    let result = []
    const lg = await _Leagues.findOne({ id: league })
    const ss = await _Seasons.findOne({ id: season })

    function getUrl(nation, pagetoken) {
        let pt = typeof pagetoken === 'undefined' ? '' : `&pageToken=${pagetoken}`,
            mykey = 'AIzaSyDoYRjOfbvlQi5YPS8HJEf5YLS75XgZFsc',
            playListID = linkLeague[nation].list,
            URL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playListID}&key=${mykey}${pt}`
        return URL
    }

    async function apiCall(nation, npt) {
        axios
            .get(getUrl(nation, npt))
            .then((response) => {
                return response.data
            })
            .then(async function (response) {
                if (response.error) {
                    console.log(response.error)
                } else {
                    responseHandler(nation, response)
                }
            })
    }
    async function updateDate(nation, result) {
        result.forEach(async (item, index) => {
            // const data = await _HighLight.find({
            //     videoId: item.videoId,
            // })

            // if (!data.length) {
            await _HighLight.create({
                nation: nation,
                league: lg._id,
                season: ss._id,
                ...item,
            })
            // }
        })
    }
    async function responseHandler(nation, resp) {
        if (resp.nextPageToken) apiCall(nation, resp.nextPageToken)

        const { items } = resp

        let newData = []
        for (let item of items) {
            const { snippet } = item
            if (limit && snippet.position > limit) return
            const time = new Date(snippet.publishedAt).getTime()

            newData.push({
                publishedAt: time,
                title: item.snippet.title,
                videoId: item.snippet.resourceId.videoId,
                createdAt: new Date(time).toISOString(),
            })
        }

        result = [...result, ...newData]
        if (!resp.nextPageToken) {
            updateDate(nation, result)
        }
    }
    apiCall(nation)
}

const createRounds = async (league, season, length) => {
    if (!length) return
    return await _Rounds.create({
        league_id: league,
        season_id: season,
        totalRound: length,
        currentRound: 1,
    })
}

//update liss, channelId, image, logo for League
const updateLeague = async (league, data) => {
    console.log(league, data)
    await _Leagues.findOneAndUpdate(
        { id: league },
        {
            $set: data,
        }
    )
    return 1
}

module.exports = {
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
}

const checkTeamExist = async (teams) => {
    return Promise.all(teams.map((teamId) => _Teams.teamIsExist(teamId)))
}

const createATeam = async (team, leagueId, season) => {
    const img = await uploadImage(team.team.id, 'team')

    const newTeam = {
        id: team.team.id,
        name: team.team.name,
        shortName: team.team.shortName,
        slug: team.team.slug,
        logo: img,
    }
    const club = await _Teams.create(newTeam)
    // }

    const newSeason = await _Specifics.create({
        position: team.position,
        matches: team.matches,
        wins: team.wins,
        losses: team.losses,
        points: team.points,
        draws: team.draws,
        team_id: club._id,
        id: season,
        league_id: leagueId, //cần thêm trường gruopId
        scoresAgainst: team.scoresAgainst,
        scoresFor: team.scoresFor,
    })

    return newSeason
}
