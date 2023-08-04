require(`./init`).then(init => {
    console.log(`node ready`)

    setTimeout(() => {
        console.log(`node exiting`)
        process.exit(0);
    }, 10000)
})