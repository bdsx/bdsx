
import fs = require('fs');
import path = require('path');

try {
    // remove old files
    fs.unlinkSync(`${__dirname}${path.sep}installer.js`);
    fs.unlinkSync(`${__dirname}${path.sep}installer.js.map`);
} catch (err) {
}

import './installer';
