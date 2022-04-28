#!/usr/bin/env node

const convertTranslationsFromJSONToCSV = require(`${process.cwd()}/scripts/translationsJSONToCSV`)
const convertTranslationsFromCSVToJSON = require(`${process.cwd()}/scripts/translationsCSVToJSON`)

// load config file
const configFile = require(`${process.cwd()}${process.env.CONFIGPATH ? process.env.CONFIGPATH : '/config.json'}`)

if (process.env.JSONToCSV) {
    convertTranslationsFromJSONToCSV(configFile)
}

if (process.env.CSVToJSON) {
    convertTranslationsFromCSVToJSON(configFile)
}
