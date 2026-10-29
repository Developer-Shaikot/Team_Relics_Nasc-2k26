const fs = require('fs');
let js = fs.readFileSync('src/main.js', 'utf8');

js = js.replace(/if\s*\(planet !== 'deepspace'\)\s*\{[\s\S]*?\}\s*else\s*\{[\s\S]*?guideBotEscort\.setVisible\(false\);\s*\}/,
`if (planet !== 'deepspace') {
      roverController.setPlanet(planet, activeGetTerrainHeight, activeRoverGroup, activeWheels);
      questManager.setPlanet(planet);
      coinsManager.spawnCoinsForPlanet(planet, activeGetTerrainHeight);
      guideBotEscort.setVisible(true);
      astronautCommander.setVisible(true);
    } else {
      coinsManager.clearCoins();
      guideBotEscort.setVisible(false);
      astronautCommander.setVisible(false);
    }`);

fs.writeFileSync('src/main.js', js, 'utf8');
console.log('src/main.js deepspace cleaned successfully');

