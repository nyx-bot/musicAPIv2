const fs = require('fs');
const unzipper = require('unzipper');

const githubReleases = require(`../../../util/githubReleases`);
const downloadClient = require(`../../../util/downloadClient`);

const filename = `bridge-${process.platform}`

const destinationDir = `./etc/yt-dlp`
const zipPath = destinationDir + `.zip`;
const fileLocation = destinationDir + `/${filename + (process.platform == `win32` ? `.exe` : ``)}`

module.exports = () => new Promise(async resolve => {
    const res = (obj) => {
        if(fs.existsSync(fileLocation)) {
            console.log(`yt-dlp already exists!`);
            obj.success = true;
            obj.path = fileLocation;
            resolve(obj);
        } else {
            console.log(`yt-dlp does not exist!`);
            obj.success = false;
            resolve(obj);
        }
    }

    githubReleases(`sylviiu`, `ytdlp-pybridge`).then(({ version, assets }) => {
        if(version && assets && assets.length > 0) {
            console.log(`yt-dlp latest release: ${version}\nlooking for: ${filename}`);

            const asset = assets.find(a => a.name == filename + `.zip`);

            if(asset && asset.url) {
                console.log(`yt-dlp latest release: ${asset.name} (${asset.url})`);

                downloadClient({
                    version,
                    url: asset.url,
                    size: asset.size,
                    downloadPath: zipPath
                }).then(() => {
                    console.log(`yt-dlp downloaded! Extracting...`);

                    const extractor = unzipper.Extract({ path: destinationDir });

                    extractor.once(`close`, () => {
                        console.log(`yt-dlp extracted!`);

                        if(fs.existsSync(zipPath)) {
                            fs.unlinkSync(zipPath);
                            console.log(`yt-dlp zip deleted!`);
                        } else console.log(`yt-dlp zip not found!`);

                        res({
                            success: true,
                            message: `yt-dlp extracted!`
                        });
                    });

                    fs.createReadStream(zipPath).pipe(extractor);
                })
            } else res({
                success: false,
                message: `No assets found`
            });
        } else res({
            success: false,
            message: `No version info found`
        });
    });
})