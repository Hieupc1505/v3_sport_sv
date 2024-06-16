function removeLastThreeDigits(num) {
    return Math.floor(num / 1000)
}
module.exports = {
    removeLastThreeDigits,
    convertFiveMatch: (matches, teamId) => {
        return matches.map((match) => {
            // console.log(match.winnerCode, match.home_team_id.toString() === teamId.toString())
            if (match.status !== '0') {
                if (match.winnerCode === 1 && match.home_team_id.toString() === teamId.toString()) {
                    return 1
                } else if (match.winnerCode === 1 && match.home_team_id.toString() !== teamId.toString()) {
                    return 0
                } else if (match.winnerCode === 2 && match.home_team_id.toString() === teamId.toString()) {
                    return 0
                } else if (match.winnerCode === 2 && match.home_team_id.toString() !== teamId.toString()) {
                    return 1
                } else {
                    return 2
                }
            } else return 3
        })
    },
}
