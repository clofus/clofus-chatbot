function executeCommand(command, command_callback) {
    var Promise = require("bluebird");
    var cmd = require("node-cmd");
    const fs = require('fs');

    var getAsync = Promise.promisify(cmd.get, {
        multiArgs: true,
        context: cmd
    });

    getAsync(command)
    .then(data => {
        console.log('cmd data', data)
        // let filename = `./logs/successlogs/`
        // fs.writeFileSync(filename, data);
        command_callback();
    }).catch(err => {
        console.log('cmd err', err)
        var error = JSON.stringify(err)
        // command_callback();
    })
}

module.exports = {
    run : executeCommand
}