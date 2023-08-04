module.exports = (creator, repo) => new Promise(async (res, rej) => {
    const ghRequest = require(`superagent`).get(`https://api.github.com/repos/${creator}/${repo}/releases?page=1&per_page=1`).set(`User-Agent`, `node`);

    if(process.env["GITHUB_TOKEN"]) {
        console.log(`[TESTRUN] GITHUB_TOKEN found in environment! Authorizing this release request`)
        ghRequest.set(`Authorization`, process.env["GITHUB_TOKEN"])
    }

    ghRequest.then(r => r.body).then(r => {
        return res({
            version: r[0].tag_name,
            assets: r[0].assets.map(d => {
                return {
                    name: d.name,
                    url: d.browser_download_url,
                    size: d.size
                }
            }),
            url: r[0].html_url,
            response: r[0]
        })
    }).catch(e => {
        console.error(`GH request: ${e} @ ${e.stack}`);
        res({error: e.message || e});
    })
})