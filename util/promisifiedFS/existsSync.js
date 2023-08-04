const fs = require('fs');

module.exports = (path) => new Promise(async (res, rej) => {
    fs.stat(path, (err, stat) => {
        if(err) {
            res(false)
        } else {
            res({
                exists: true,
                type: stat.isDirectory() ? `directory` : `file`,
            })
        }
    })
})