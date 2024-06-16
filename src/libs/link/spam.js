const searchVideo = async () => {
    // Tạo một chỉ mục tìm kiếm full-text trong RediSearch
    // await client.ft.create(
    //     'idx:highlights',
    //     {
    //         title: {
    //             type: SchemaFieldTypes.TEXT,
    //             SORTABLE: true,
    //         },
    //         start: {
    //             type: SchemaFieldTypes.NUMERIC,
    //             SORTABLE: true,
    //         },
    //         videoId: SchemaFieldTypes.TEXT
    //     },
    //     {
    //         ON: 'HASH',
    //         PREFIX: 'list:',
    //     }
    // )

    // // Lấy tất cả các document từ MongoDB và thêm chúng vào RediSearch
    // const hls = await _HighLight.find().lean()
    // for (let idx = 0; idx < hls.length; idx++) {
    //     const doc = hls[idx]
    //     let key = 'list:' + idx
    //     try {
    //         await client.hSet(key, { title: doc.title, start: doc.publishedAt })
    //     } catch (error) {
    //         console.error(error)
    //     }
    // }

    // Thực hiện tìm kiếm
    const lg = await _Leagues.findOne({ id: league })
    const matches = await _Matches.find({ highlight: { $exists: false }, league_id: lg._id })

    // return matches
    let t = 0
    for (let match of matches) {
        // const t = ` @start:[${convertTime(match.startTime)}]`
        // const str = convertStrRedisearch(match.slug) + t

        // let v1 = await client.ft.search('idx:highlights', str)
        try {
            const { data } = await axios.get(getUrl(match.slug, match.startTime))

            if (data && data.items.length > 0) {
                const result = data.items.filter((item) => item.snippet.channelId === linkLeague[nation].channelId)
                if (result.length) {
                    try {
                        const vdid = await _HighLight.findOne({ videoId: result[0].id.videoId })
                        if (vdid) {
                            match.highlight = vdid._id
                            await match.save()
                        }
                    } catch (e) {
                        console.error('Error when saving match highlight:', e)
                    }
                }
            }
        } catch (e) {
            console.error('Error when fetching data:', e)
        }
        // specs[idx].highlight =

        // console.log(v1.documents[0].value.videoId)
        // if (v1.total == 0) {
        //     const vdid = await _HighLight.findOne({ videoId: v1.documents[0].value.videoId })
        //     if (vdid) {
        //         console.log(match.slug, vdid.videoId)
        //         match.highlight = vdid._id
        //         await match.save()
        //     }
        // }
    }
    return 1
    // const t = ` @start:[${convertTime(1691841600)}]`
    // const str = convertStrRedisearch('abcdef-adkjf') + t

    // let v1 = await client.ft.search('idx:highlights', str)
    // if (v1.total === 0) {
    //     const tmi = new Date(1691841600 * 1000).toISOString()
    //     const v2 = await getVideoFromYTB('abcdef-adkjf', tmi, linkLeague[nation].channelId)
    //     // specs[idx].highlight =
    //     // {
    //     //     "kind": "youtube#searchResult",
    //     //     "etag": "EHNXFZ-qzqNMD74o93PiPw290js",
    //     //     "id": {
    //     //       "kind": "youtube#video",
    //     //       "videoId": "_ruOaJ82O9U"
    //     //     },
    //     //     "snippet": {
    //     //       "publishedAt": "2024-01-30T21:56:51Z",
    //     //       "channelId": "UC9xeuekJd88ku9LDcmGdUOA",
    //     //       "title": "NOTTINGHAM - ARSENAL | PHÁO THỦ TIẾP TỤC BÁM  ĐUỔI NHÓM DẪN ĐẦU | NGOẠI HẠNG ANH 23/24",
    //     //       "description": "NOTTINGHAM - ARSENAL | PHÁO THỦ TIẾP TỤC BÁM ĐUỔI NHÓM DẪN ĐẦU | NGOẠI HẠNG ANH 23/24 #NgoaiHangAnh ...",
    //     //       "thumbnails": {
    //     //       },
    //     //       "channelTitle": "Kplus Sports",
    //     //       "liveBroadcastContent": "none",
    //     //       "publishTime": "2024-01-30T21:56:51Z"
    //     //     }
    //     //   }
    //     // console.log('get from youtube')
    //     return v2
    // }
    // // {
    // //     "total": 1,
    // //     "documents": [
    // //       {
    // //         "id": "list:2109",
    // //         "value": {
    // //           "start": "1691857785000",
    // //           "title": "EVERTON - FULHAM | MẢI MIẾT TẤN CÔNG, BẤT NGỜ SỤP ĐỔ | NGOẠI HẠNG ANH 23/24"
    // //         }
    // //       }
    // //     ]
    // //   }
    // return v1
}

const createTeamsC1 = async (league, season) => {
    const link = linkLeague.c1.standings
    const data = await axios.get(link).then((res) => res.data)
    const groups = data.standings
    const leagueInfo = await _Leagues.findOne({ id: linkLeague[league].id })

    for (let { rows, tournament, name, id } of groups) {
        let groups = []
        for (let row of rows) {
            // console.log(team.id)

            const teamId = await _Teams.getTeamId(row.team.id)
            // console.log(teamExist)
            // console.log(row.team)
            if (!teamId) {
                console.log(row.team.id)
                const newTeam = await createATeam(row, leagueInfo._id, season)
                groups.push(newTeam._id)
            } else {
                if (await _Specifics.isNotExistOnLeagueGroup(teamId, leagueInfo._id)) {
                    await createATeam(row, leagueInfo._id, season)
                }
                groups.push(teamId)
            }
        }
        //make a group
        const newGroup = await _Groups.create({
            name: name,
            id: id,
            league_id: leagueInfo._id,
            team_ids: groups,
            slug: tournament.slug,
        })
    }
    return 1
}

// const info = await axios.get(getRound(league, season)).then((res) => res.data)
// let max = 0
// for (let item of info.rounds) {
//     if (item.round > max) {
//         max = item.round
//     }
// }
// await _Rounds.create({
//     league_id: leagues._id,
//     season_id: seasons._id,
//     totalRound: 6,
//     currentRound: 6,
// })
// return 1
// const teams = await _Teams.find({})
// const seasons = await _Groups.find({})
// for (let season of seasons) {
//     season.rows = season.team_ids
//     // console.log(team.league_ids[0])
//     await season.save()
// }

// const league = await _Leagues.findOne({ id: 7 })

// const groups = await _Groups.find({ league_id: league._id })
// let arr = []
// for (let group of groups) {
//     const result = await Promise.all(
//         group.rows.map((item) => _Specifics.findOne({ team_id: item, league_id: league._id }))
//     ).then((res) => {
//         return res.map((item) => item._id)
//     })
//     group.rows = result
//     await group.save()
// }
// // await _Groups.updateMany({}, { $unset: { team_ids: 1 } })
// return arr

// const season = await _Seasons.findOne({ id })
// if (season) {
//     await _Matches.updateMany({ league_id: season.league_id }, { $set: { season_id: season._id } })
// }
// return true
// await YourModel.updateMany({}, { $set: { your_field: updatedValue } });

//update club info
// const clubs = await _Teams.find({})
// for (let club of clubs) {
//     const image = await axios.get(`http://localhost:7500/images/club/${club.id}`).then((res) => res.data)
//     if (image?.url) {
//         club.logo = image.url
//         await club.save()
//     }
// }
// const league = await _Leagues.findOne({ id: leauge })
// const seasons = await _Seasons.findOne({ id: season })
// // const spes = await _Specifics.find({ league_id: league._id })
// await _Groups.updateMany({ league_id: league._id }, { $set: { season: seasons._id } })
// return 1
// const league = await _Leagues.findOne({ id: leauge })
// const specs = await _Specifics.find({ league_id: league._id }).sort({ position: 1 })
// const data = await axios.get(linkLeague[nation].standings).then((res) => res.data)
// const { rows } = data.standings[0]
// // return specs
// for (let spec of specs) {
//     // console.log(rows[spec.position - 1].scoresFor, rows[spec.position - 1].scoresAgainst)
//     spec.scoresFor = rows[spec.position - 1].scoresFor
//     spec.scoresAgainst = rows[spec.position - 1].scoresAgainst
//     await spec.save()
// }
// return 1

const updateSeasonAndTeam = async (league, season, nation) => {
    // const leagues = await _Leagues.findOne({ id: league })
    // const seasons = await _Seasons.findOne({ id: season })

    const hls = await _HighLight.find({})

    for (let hl of hls) {
        let date = new Date(hl.publishedAt)
        if (!isNaN(date)) {
            // Kiểm tra xem date có phải là một ngày hợp lệ
            hl.publishedAt = date.getTime()
            await hl.save()
        } else {
            console.log(hl.videoId)
            console.error(`Invalid date: ${hl.publishedAt}`)
        }
    }

    return 1
}
const addRows = async (leagueId) => {
    const link = linkLeague[leagueId]
    const { standings } = await axios.get(link.standings).then((res) => res.data)

    for (let { rows, id } of standings) {
        let groups = []
        for (let team of rows) {
            const teamId = await _Teams.getTeamId(team.team.id)
            const specs = await _Specifics.findOne({ team_id: teamId })
            groups.push(specs._id)
        }
        await _Groups.findOneAndUpdate({ id }, { $set: { rows: groups } })
    }

    return 1
}

const updateSeasonAndTeam2 = async (leagueId) => {
    const league = await _Leagues.findOne({ id: leagueId })
    const seasons = await _Seasons.findOne({ league_id: league._id })
    await _Groups.updateMany({ league_id: league._id }, { $set: { season: seasons._id } })
    return 1
}

// searchVideo: async (league, nation) => {
//     const lg = await _Leagues.findOne({ id: league })
//     const matches = await _Matches
//         .find({ highlight: { $exists: false }, league_id: lg._id })
//         .populate(['home_team_id', 'away_team_id'])
//     let t = 0
//     for (let match of matches) {
//         ++t
//         const q1 = await client.ft.search(
//             'idx:highlights',
//             `${match.home_team_id.shortName} @start:[${match.startTime * 1000} ${
//                 match.startTime * 1000 + 3 * 24 * 60 * 60 * 1000
//             }]`
//         )
//         const q2 = await client.ft.search(
//             'idx:highlights',
//             `${match.away_team_id.shortName} @start:[${match.startTime * 1000} ${
//                 match.startTime * 1000 + 3 * 24 * 60 * 60 * 1000
//             }]`
//         )
//         let common = findCommonElements(q1.documents, q2.documents)
//         if (!common.length) {
//             if (q1.documents.length === 1) common = q1.documents
//             if (q2.documents.length === 1) common = q2.documents
//         }
//         // console.log(JSON.stringify(common, null, 2))

//         if (common.length) {
//             console.log(t, match.slug)
//             const hls = await _HighLight.findOne({ videoId: common[0].value.videoId })
//             match.highlight = hls._id
//             await match.save()
//         }
//     }
//     return 1
// },

const convertStrRedisearch = (str) =>
    str
        .split('-')
        .map((word) => `@title:${word}`)
        .join(' ')

function findCommonElements(arr1, arr2) {
    return arr1.filter((element1) =>
        arr2.some((element2) => element2.id === element1.id && element2.value.videoId === element1.value.videoId)
    )
}
