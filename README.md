## About 

This is the port of https://github.com/kristjanjansen/environmental_notices_old to Node.js

## Installing

This script assumes you have ```node```, ```npm``` and ```volo``` installed.

```
git clone https://github.com/kristjanjansen/environmental_notices
cd environmental_notices
npm install
volo add
```

## Config

1. Download [table template](https://raw.github.com/gist/3736497/dddb4ade9a6bba9275ba59066ae2ababaa00cf3d/en_table_template.csv)
2. Create new Fusion Table by uploading that table template, note down the Table ID
3. Click on "Share" button and set "Who has access" to "Public on the web"
4. Create Google Fusion API key at https://developers.google.com/fusiontables/docs/v1/using#APIKey, note down your API key
5. Create Geonames account http://www.geonames.org/login, note down account name
6. Enable "Enable Geonames free webservice" setting
7. Create /config directory under your project
8. Create /config/development.json file with following contents (replace "" with your values):

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

