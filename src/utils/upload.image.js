const cloudinary = require('../loaders/cloudinary')
const createError = require('http-errors')
var that = (module.exports = {
    uploadImage: async (leagueId, type = 'league') => {
        if (!leagueId) createError(400, 'League ID is required')
        else {
            const links = {
                league: (l) => `https://api.sofascore.app/api/v1/unique-tournament/${l}/image/dark`,
                team: (t) => `https://api.sofascore.app/api/v1/team/${t}/image`,
            }
            try {
                const result = await cloudinary.uploader.upload(links[type](leagueId), {
                    folder: 'Sports/leagues',
                })
                return result.secure_url
            } catch (error) {
                return createError(500, 'Internal server error')
            }
        }
    },
    uploadImageLink: async (link) => {
        if (!link) createError(400, 'Link is required')
        else {
            try {
                const result = await cloudinary.uploader.upload(link, {
                    folder: 'Sports/leagues',
                })
                return result.secure_url
            } catch (error) {
                return createError(500, 'Internal server error')
            }
        }
    },
})
