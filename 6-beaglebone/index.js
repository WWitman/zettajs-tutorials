var zetta = require('zetta');
var BeagleBoneLedScout = require('./scout.js');
var BeagleBoneLedApp = require('./app.js');

  zetta()
    .name('BeagleBone LED')
    // construct the object with the listed arguments
    .use(BeagleBoneLedScout, 'P9_12', 'P9_11')
    .listen(1337, function(){
       console.log('Zetta is running at http://127.0.0.1:1337');
  });
