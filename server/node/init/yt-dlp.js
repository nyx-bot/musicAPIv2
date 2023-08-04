const fs = require('fs');

const githubReleases = require(`../../../util/githubReleases`);
const downloadClient = require(`../../../util/downloadClient`);

const filename = `bridge-${process.platform}`

//const destinationDir = `./etc/yt-dlp`
const destinationDir = require(`path`).join(__dirname, `../../../etc/yt-dlp`)
const zipPath = destinationDir + `.zip`;
const fileLocation = destinationDir + `/${filename + (process.platform == `win32` ? `.exe` : ``)}`

module.exports = () => new Promise(async resolve => {
    const res = (obj) => {
        if(fs.existsSync(fileLocation)) {
            console.log(`yt-dlp already exists!`);

            obj.success = true;
            obj.path = fileLocation;

            if(!process.platform.toLowerCase().includes(`win32`)) {
                try {
                    require(`child_process`).execFileSync(`chmod`, [`+x`, fileLocation])
                    console.log(`yt-dlp chmodded!`)
                } catch(e) {
                    fs.chmodSync(fileLocation, 0o777)
                    console.log(`yt-dlp chmodded! [2]`)
                }
            };

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

                    const started = Date.now()

                    /*const extractor = require('unzipper').Extract({
                        path: destinationDir
                    });
                    
                    extractor.once(`close`, () => {
                        console.log(`yt-dlp extracted! (${destinationDir})`);

                        res({
                            success: true,
                            message: `yt-dlp extracted!`
                        });
                    });

                    extractor.write(fs.readFileSync(zipPath));*/

                    const zip = new require(`adm-zip`)(zipPath);

                    zip.extractAllTo(destinationDir, true);

                    console.log(`yt-dlp extracted! (${destinationDir}) (${Date.now() - started}ms)`);

                    res({
                        success: true,
                        message: `yt-dlp extracted!`
                    });
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