const fs = require('fs');
const path = require('path');
const util = require('util');
const arma = require('arma-server');
const xml2js = require('xml2js');
const config = require('./config');

function getModsHtml(htmlFilePath) {
    return util.promisify(fs.readFile)(htmlFilePath, {encoding: 'utf8'});
}

function getModsXml(html) {
    return xml2js.parseStringPromise(html);
}

function getModIds(xml) {
    return xml.html.body[0].div[0].table[0].tr.map(tableRow => tableRow.td[2].a[0]._.slice('http://steamcommunity.com/sharedfiles/filedetails/?id='.length));
}

function getModPaths(modIds, modsPath) {
    return modIds.map(modId => path.join(modsPath, modId));
}

function startClient(identifier, options, logsPath) {
    const getLogPath = () => path.resolve(logsPath, `${identifier}.txt`);
    const writeLog = message => {
        if (logsPath) {
            util.promisify(fs.writeFile)(getLogPath(), `${(new Date()).toLocaleString()}:\t${message}\n`, { flag: 'a' });
        } else {
            console.log(`${identifier}:\t${message}`);
        }
    };

    writeLog(`Starting with options=${JSON.stringify(options, null, 2)}`);
    const client = new arma.Headless(options);
    const process = client.start();

    process.stdout.on('data', data => {
        writeLog(data.toString('utf8'));
    });
    process.stderr.on('data', data => {
        writeLog(data.toString('utf8'));
    });
    process.on('spawn', () => {
        writeLog('Spawned');
    });
    process.on('close', (code, signal) => {
        writeLog(`Closed with code=${code}, signal=${signal}`);
    });
    process.on('exit', (code, signal) => {
        writeLog(`Exited with code=${code}, signal=${signal}`);
    });
    process.on('error', error => {
        writeLog(error);
    });
}

(async()=>{
    const armaModsPath = path.join(config.steamAppsPath, 'workshop', 'content', '107410');
    const armaPath = path.join(config.steamAppsPath, 'common', 'Arma 3');
    if (config.logsPath) {
        await util.promisify(fs.mkdir)(config.logsPath, { recursive: true });
    }
    for (let i = 0; i < config.clientCount; ++i) {
        startClient(`client${i+1}`, {
            game: 'arma3',
            host: config.host,
            password: config.password,
            port: config.port,
            mods: config.modFile ? getModPaths(getModIds(await getModsXml(await getModsHtml(path.join(config.modFile)))), armaModsPath) : [],
            path: armaPath,
        }, config.logsPath);
    }
})();
