module.exports = {
    // Server info:
    host: 'localhost',
    port: '2302',
    password: '',

    steamAppsPath: 'D:\\SteamLibrary\\steamapps', // Where Arma3 and it's workshop content is
    clientCount: 1, // How many headless clients to spawn
    spawnDelay: 0, // How many miliseconds to wait between client spawns
    modFile: '', // Path to HTML file from which to read the mods, as exported from arma launcher
    logsPath: './example/logs', // Path to where to write logs, blank if you want it to write to stdio instead
};
