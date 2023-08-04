const fs = require(`fs`);

const modes = fs.readdirSync(`./server/`).filter(f => fs.statSync(`./server/${f}`).isDirectory());

const mode = process.argv[2];

if(!mode) {
    console.log(`No mode specified (modes: ${modes.join(`, `)}); exiting...`);
    process.exit(1);
} else if(!modes.includes(mode)) {
    console.log(`Mode ${mode} not found (modes: ${modes.join(`, `)}); exiting...`);
    process.exit(1);
} else {
    console.log(`Mode ${mode} found; starting...`);
    require(`./server/${mode}/index.js`);
}