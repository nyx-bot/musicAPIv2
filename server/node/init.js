const fs = require(`../../util/promisifiedFS`);

module.exports = new Promise(async res => {
    const scripts = (await fs.readdirSync(`./server/node/init`)).filter(f => f.endsWith(`.js`))

    console.log(`Initializing ${scripts.length} scripts...`);

    const promises = {};

    for(const file of scripts) {
        const name = file.split(`.js`)[0];

        try {
            const module = require(`./init/${file}`);

            console.log(`Initializing ${name}...`);

            const m = module();

            if(m.then) {
                promises[name] = m;
            } else {
                promises[name] = Promise.resolve(m);
            }
        } catch(e) {
            console.log(`Error initializing ${name}: ${e}`);
        }
    };
    
    const keys = Object.keys(promises);

    const results = Object.entries(await Promise.all(Object.values(promises))).map(([k, v]) => [keys[k], v]).reduce((a, [k, v]) => ({...a, [k]: v}), {})

    console.log(`Initialized ${keys.length} scripts`, results);

    res(results);
});