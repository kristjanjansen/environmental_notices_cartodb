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

1. Download [table template](https://raw.github.com/gist/3736497/dddb4ade9a6bba9275ba59066ae2ababaa00cf3d/en_table_template.csv)
2. Create new Fusion Table by uploading that table template, note the Table ID
3. Create Google Fusion API key at https://developers.google.com/fusiontables/docs/v1/using#APIKey, note down API key
4. Create Geonames account http://www.geonames.org/login, note down account name
5. Create /config directory under your project
6. Create /config/default.json file with following contents (replace "" with your values):

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

## Run

```
node app.js
```

## Run in production

1. Install [Forever](https://github.com/nodejitsu/forever) (optional but highly reccommended).
1. Create /config/production.json and fill with proper configuration.
2. Run

```
NODE_ENV=production forever node app.js
```

