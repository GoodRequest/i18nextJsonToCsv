#!/usr/bin/env ts-node
// import convertTranslationsFromJSONToCSV from './scripts/translationsJSONToCSV'
// import convertTranslationsFromCSVToJSON from './scripts/translationsCSVToJSON'

// load config file
const configFile = require(`${ process.cwd() }${ process.env.CONFIGPATH ? process.env.CONFIGPATH : './config.json' }`)

if(process.env.JSONToCSV) {
    // convertTranslationsFromJSONToCSV(configFile)
}

if (process.env.CSVToJSON) {
   // convertTranslationsFromCSVToJSON(configFile)
}
