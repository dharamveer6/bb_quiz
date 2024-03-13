const moment = require('moment-timezone');
const serverTimezone = 'Asia/Kolkata';

// Set the server's timezone globally
moment.tz.setDefault(serverTimezone);

// Now you can use `moment` with the configured timezone
module.exports={moment}
 