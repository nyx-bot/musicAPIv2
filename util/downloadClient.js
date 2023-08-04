const fs = require('fs');
const pfs = require('./promisifiedFS');
const Stream = require('stream');

module.exports = ({version, url, size, downloadPath}) => new Promise(async (res, rej) => {
    try {
        const parsedPath = require(`path`).parse(downloadPath);
    
        const folder = parsedPath.dir;
        const file = parsedPath.base;

        if(await pfs.existsSync(downloadPath)) {
            console.log(`[downloadClient]: Download path already exists! Deleting...`);
            await pfs.unlinkSync(downloadPath, { recursive: true });
        }
    
        console.log(`[downloadClient]: Downloading version str ${version} at "${url}" to ${downloadPath}\n- name: ${file}\n- in: ${folder}`);
    
        await pfs.mkdirSync(folder, { recursive: true });
    
        const writeStream = fs.createWriteStream(downloadPath, { flags: `w` });
    
        const req = require('superagent').get(url).set(`User-Agent`, `node`);
    
        if(process.env["GITHUB_TOKEN"]) {
            console.log(`[TESTRUN] GITHUB_TOKEN found in environment! Authorizing this release request`)
            req.set(`Authorization`, process.env["GITHUB_TOKEN"])
        }
        
        const pt = new Stream.PassThrough();
        
        let totalData = 0;
    
        /*pt.on(`data`, d => {
            const progress = (totalData += Buffer.byteLength(d)) / size;
            console.log(`[downloadClient]: Downloading ${(progress*100).toFixed(2)}% (${totalData} / ${size})`);
        })*/

        //writeStream.on(`close`, () => res());
    
        writeStream.on(`finish`, () => res());
    
        //pt.pipe(writeStream);
        //req.pipe(pt);
        req.pipe(writeStream);
    } catch(e) {
        console.error(e)
        rej(e);
    }
})