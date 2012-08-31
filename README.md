## About 

This is the port of https://github.com/kristjanjansen/environmental_notices_old to Node.js

## Installing

This script assumes you have ```node``` and ```npm``` installed.

```
git clone https://github.com/kristjanjansen/environmental_notices
cd environmental_notices
npm install
```

## Config

1. Create /config directory
2. Create /config/development.json file with following contents (replace "" with your values):

```
{
  "googleFusionTableID": "",
  "googleFusionTableApikey": "",
  "googleUsername": "",
  "googlePassword": "",
  "geonamesUsername": "",
  "httpPort": 8888,
  "updateRate": 10
}
```

## Running

```
node worker.js
```

## Running in production

1. Install [Forever](https://github.com/nodejitsu/forever) (optional but highly reccommended).
1. Create /config/production.json and fill with proper configuration.
2. Run

```
NODE_ENV=production forever node worker.js
```

