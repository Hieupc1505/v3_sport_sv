var that = (module.exports = {
    linkLeague: {
        spain: {
            standings: 'https://www.sofascore.com/api/v1/unique-tournament/8/season/52376/standings/total',
            id: 8,
            // list: 'PLe7emRNTL6brFsTUsqgcPYaRY_Kiy81fu',
            list: 'PLiE3b_TsH9wvhmbKn48L1nLPyEkA7ZIW7',
            channelId: 'UCUF-y50XKhKMDETOcC3VI8A',
        },
        england: {
            standings: 'https://www.sofascore.com/api/v1/unique-tournament/17/season/52186/standings/total',
            id: 17,
            // "list": "PLiaWrX4zmrTl06dABoXI1jRSYXnGeXYUV",
            channelId: 'UC9xeuekJd88ku9LDcmGdUOA',
            list: 'PLiaWrX4zmrTnSMsGla0nGP9EViv-7fr_j',
        },

        italy: {
            standings: 'https://www.sofascore.com/api/v1/unique-tournament/23/season/52760/standings/total',
            id: 23,
            // "list": "PLRNODuy48D6wwfoCnG6e8VIsDeQ2AoVxP",
            list: 'PLRNODuy48D6waZq_TqeN8kra_RyXk1RkU',
            channelId: 'UCPt9pwiEtp-8lTAM_ol2VTQ',
        },
        france: {
            standings: 'https://www.sofascore.com/api/v1/unique-tournament/34/season/52571/standings/total',
            id: 34,
            // "list": "PLJ3FvQeXoiOvWq63Bhy4QOgXIi132aotI",
            list: 'PLJ3FvQeXoiOtfcfHjIPUaoGhL98HRYFUf',
            channelId: 'UCbdlxg0t8O7WGPrFsVcz6Gg',
        },
        germany: {
            standings: 'https://www.sofascore.com/api/v1/unique-tournament/35/season/52608/standings/total',
            id: 35,
            // "list2": "PL0fNrAOa7mzCfnJcb7Zc5SxOsWvWkno2V",
            // "list": "PLxbDrTU0IHWc5ViR9ge39-mJbEuIWpcQo",
            list: 'PLe7emRNTL6brYAqpJp3RDbZRbK6p_PSza',
            // channelId: 'UCoqrrrfDpWOgdqw1vRoiG_A',
            channelId: 'UCSMODB99o6jRMcgldoyH3dw',
        },
        c1: {
            standings: 'https://www.sofascore.com/api/v1/unique-tournament/7/season/52162/standings/total',
            id: 7,
            // "list": "PLP6mKLBWAJWJd0lcAAeVLf8gPsLXFjKJg",
            list: 'PLP6mKLBWAJWIvb6B-BMX6DZkdnj62zxfE',
            channelId: 'UC4LvrpNXujjbGOS4RDvr41g',
        },
        euro: {
            standings: 'https://www.sofascore.com/api/v1/unique-tournament/1/season/56953/standings/total',
            id: 1,
            // list: 'PLP6mKLBWAJWJd0lcAAeVLf8gPsLXFjKJg',
            // changnelId: 'UC4LvrpNXujjbGOS4RDvr41g',
        },
        copa: {
            standings: `https://www.sofascore.com/api/v1/unique-tournament/133/season/57114/standings/total`,
            id: 133,
        },
    },
    linkRound: (league, season, round) =>
        `https://www.sofascore.com/api/v1/unique-tournament/${league}/season/${season}/events/round/${round}`,
    getRound: (league, season) => {
        return `https://www.sofascore.com/api/v1/unique-tournament/${league}/season/${season}/rounds`
    },
    knockOut: (league, season) => `https://www.sofascore.com/api/v1/unique-tournament/${league}/season/${season}/cuptrees`,
    result: (id) => `https://www.sofascore.com/api/v1/event/${id}`,
})
