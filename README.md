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

1. Create CartoDB account http://cartodb.com and note down account name
2. Navigate to Account > Your api keys > API key and note down API key
3. Create a new table from "I want to add some data from a URL", point it to [this link](https://raw.github.com/gist/3736497/dddb4ade9a6bba9275ba59066ae2ababaa00cf3d/en_table_template.csv)
4. Create /config directory under your project
5. Create /config/default.json file with following contents (replace it with your values):

```
{
  "cartoUser": "your_account_name",
  "cartoKey": "your_api_key",
  "cartoTable" : "en_table_template",
  "scrapeMinute": 1,
  "httpPort": 8888
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

