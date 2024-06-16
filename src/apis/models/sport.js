const { string } = require('joi')
const mongoose = require('mongoose')
const { Schema } = mongoose

const PlayersSchema = new Schema(
    {
        id: Number,
        name: String,
        position: String,
        team_id: { type: Schema.Types.ObjectId, ref: 'teams' },
    },
    {
        collection: 'players',
        timestamps: true,
    }
)

const MatchesSchema = new Schema(
    {
        id: Number,
        round: Number,
        home_team_id: { type: Schema.Types.ObjectId, ref: 'teams' },
        away_team_id: { type: Schema.Types.ObjectId, ref: 'teams' },
        home_team_score: Number,
        away_team_score: Number,
        league_id: { type: Schema.Types.ObjectId, ref: 'leagues' },
        //query sửa phải để ý vì nó đang là giá trị của specifics
        season_id: { type: Schema.Types.ObjectId, ref: 'seasons' },
        status: String,
        startTime: Number,
        slug: String,
        winnerCode: Number, //1 home, 2: away, 3 : hòa
        highlight: { type: Schema.Types.ObjectId, ref: 'highlights' },
    },
    {
        collection: 'matches',
        timestamps: true,
    }
)

const GroupsSchema = new Schema(
    {
        name: String,
        id: Number,
        league_id: { type: Schema.Types.ObjectId, ref: 'leagues' },
        // team_ids: [{ type: Schema.Types.ObjectId, ref: 'teams' }],
        slug: String,
        season: { type: Schema.Types.ObjectId, ref: 'seasons' },
        rows: [{ type: Schema.Types.ObjectId, ref: 'specifics' }],
    },
    {
        collection: 'groups',
        timestamps: true,
    }
)

const SpecificsSchema = new Schema(
    {
        position: Number,
        matches: Number,
        wins: Number,
        losses: Number,
        points: Number,
        draws: Number,
        team_id: { type: Schema.Types.ObjectId, ref: 'teams' },
        league_id: { type: Schema.Types.ObjectId, ref: 'leagues' },
        id: Number,
        group_id: { type: Schema.Types.ObjectId, ref: 'groups' },
        scoresFor: Number,
        scoresAgainst: Number,
    },
    {
        collection: 'specifics',
        timestamps: true,
    }
)

const TeamsSchema = new Schema(
    {
        id: Number,
        name: String,
        shortName: String,
        slug: String,
        logo: String,
        // league_ids: [{ type: Schema.Types.ObjectId, ref: 'leagues' }],
    },
    {
        collection: 'teams',
        timestamps: true,
    }
)
const LeaguesSchema = new Schema(
    {
        id: Number,
        name: String,
        country: String,
        image: String,
        slug: String,
        isGroup: {
            type: Boolean,
            default: false,
        },
        logo: String,
        list: String,
        list2: String,
        channelId: String,
    },
    {
        collection: 'leagues',
        timestamps: true,
    }
)

const RoundsSchema = new Schema(
    {
        currentRound: Number,
        totalRound: Number,
        season_id: { type: Schema.Types.ObjectId, ref: 'seasons' },
        league_id: { type: Schema.Types.ObjectId, ref: 'leagues' },
    },
    {
        collection: 'rounds',
        timestamps: true,
    }
)

const highlightSchema = new Schema(
    {
        nation: String,
        publishedAt: Number,
        title: String,
        videoId: String,
        season: { type: Schema.Types.ObjectId, ref: 'seasons' },
        league: { type: Schema.Types.ObjectId, ref: 'leagues' },
    },
    {
        collection: 'highlights',
        timestamps: true,
    }
)

const SeasonsSchema = new Schema(
    {
        name: String,
        year: String,
        id: Number,
        league_id: { type: Schema.Types.ObjectId, ref: 'leagues' },
    },
    {
        collection: 'seasons',
        timestamps: true,
    }
)

TeamsSchema.statics.teamIsExist = async function (teamId) {
    const query = await this.findOne({ id: teamId })
    // console.log(teamId)
    if (!query) return false
    return true
}

TeamsSchema.statics.getTeamId = async function (id) {
    const query = await this.findOne({ id })
    return query?._id
}

highlightSchema.statics.notExist = async function (videoId) {
    const query = await this.findOne({ videoId })
    if (query) return false
    return true
}

SpecificsSchema.statics.isNotExistOnLeagueGroup = async function (teamId, leagueId) {
    const query = await this.findOne({ team_id: teamId, league_id: leagueId })
    if (query) return false
    return true
}

const _Teams = mongoose.model('teams', TeamsSchema)
const _Players = mongoose.model('players', PlayersSchema)
const _Matches = mongoose.model('matches', MatchesSchema)
const _Leagues = mongoose.model('leagues', LeaguesSchema)
const _Rounds = mongoose.model('rounds', RoundsSchema)
const _Specifics = mongoose.model('specifics', SpecificsSchema)
const _Groups = mongoose.model('groups', GroupsSchema)
const _Seasons = mongoose.model('seasons', SeasonsSchema)
const _HighLight = mongoose.model('highlights', highlightSchema)

module.exports = {
    _Teams,
    _Players,
    _Matches,
    _Leagues,
    _Rounds,
    _Specifics,
    _Groups,
    _Seasons,
    _HighLight,
}
