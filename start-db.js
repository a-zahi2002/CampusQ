const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Found paths on this system
const pgCtlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_ctl.exe';
const pgDataPath = 'C:\\Program Files\\PostgreSQL\\18\\data';

function checkAndStartPostgres() {
    console.log('Checking PostgreSQL status...');

    if (!fs.existsSync(pgCtlPath)) {
        console.error(`PostgreSQL binary not found at ${pgCtlPath}`);
        return;
    }

    if (!fs.existsSync(pgDataPath)) {
        console.error(`PostgreSQL data directory not found at ${pgDataPath}`);
        return;
    }

    try {
        // Check status
        const status = execSync(`"${pgCtlPath}" status -D "${pgDataPath}"`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
        if (status.includes('server is running')) {
            console.log('PostgreSQL is already running.');
            return;
        }
    } catch (e) {
        // status command returns exit code 1 if not running
    }

    console.log('PostgreSQL is stopped. Starting now...');
    try {
        // Start server
        // Using 'start' to run it in the background if needed, but pg_ctl start usually handles it
        execSync(`"${pgCtlPath}" start -D "${pgDataPath}"`, { stdio: 'inherit' });
        console.log('PostgreSQL started successfully.');
    } catch (err) {
        console.error('Failed to start PostgreSQL. Please check the logs in the data directory.');
        // We don't exit(1) here to let the server try to connect anyway, maybe it just took a bit longer
    }
}

checkAndStartPostgres();
