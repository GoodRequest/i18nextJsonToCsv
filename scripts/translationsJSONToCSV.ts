#!/usr/bin/env cross-env ts-node
import fs from 'fs'

import { forEach, includes } from 'lodash'

// load config file
const config = require(process.env.CONFIGPATH ? `${process.cwd()}${process.env.CONFIGPATH}` : '../config.json')

const readFile: any = fs.readFileSync
const writeFile: any = fs.writeFileSync

const convertTranslationsFromJSONToCSV = (configFile: any) => {
	const filePaths: any = fs.readdirSync(`${process.cwd()}${ configFile?.pathToDirectoryForLocales ? configFile?.pathToDirectoryForLocales : '/public/locales'}`)
	const csvDelimiter: string = configFile?.csvDelimiter || ';'
	const languages: string[] | null = configFile?.supportedLanguages || null
	const fileTypes: string[] | null = configFile?.filesTypes || null
	console.log('Script ran with this configuration =>', configFile)
	try {
		let languageDirs: string[] = []
		let locKeys: any = {}
		let locText: any = {}
		let files: string[] = []
		// going through all language mutations folders
		forEach(filePaths, (languageMutation: string, index: number) => {
			// load directory for specific language and check if is
			if (includes(languages, languageMutation) || !languages) {
				const dir: any = fs.readdirSync(`${process.cwd()}/public/locales/${languageMutation}`)
				// add language mutation to array
				languageDirs.push(languageMutation)
				forEach(dir, (fileName: string) => {
					const name: string = fileName?.split('.')?.[0]
					// going through all files inside specific language directory
					if (includes(fileTypes, name) || !fileTypes) {
						// load json file content
						const fileContent: string = readFile(`${process.cwd()}/public/locales/${languageMutation}/${fileName}`, 'utf-8')
						// get all keys for translations
						const json: any = JSON.parse(fileContent)
						// prepare loc text
						locText = {
							...locText,
							[languageMutation]: {
								...locText[languageMutation],
								[name]: json
							}
						}
						// init all available loc keys and file names
						if (index === 0) {
							const keys: string[] = Object.keys(json)
							locKeys = {
								...locKeys,
								[name]: keys
							}
							if (keys && keys.length > 0) {
								files.push(name)
							}
						}
					}
				})
			}
		})
		// init buffer
		let buffer: string = `Keys${csvDelimiter}`
		// create csv header with columns
		forEach(languageDirs, (languageMutation: string, index: number) => {
			// skip adding csv separator to last column
			buffer = `${buffer} ${languageMutation} ${(index !== languageDirs.length - 1) ? csvDelimiter : ''}`
		})
		// add new line
		buffer = `${buffer}\n`
		forEach(files, (fileName: string) => {
			// if json file is empty
			if (locKeys?.[fileName] && locKeys?.[fileName].length > 0) {
				buffer = `${buffer}--${fileName}--`
				// add rows to csv file
				forEach(locKeys?.[fileName], (key: string) => {
					buffer = `${buffer}\n ${key}`
					// each loc key add translation to column for specific language mutation
					forEach(languageDirs, (languageMutation: string) => {
						// create row for specific language mutation, file and key
						buffer = `${buffer}${csvDelimiter} ${locText?.[languageMutation]?.[fileName]?.[key]}`
					})
				})
				// new line for specific file
				buffer = `${buffer}\n`
			}
		})
		// write data into csv buffer
		writeFile(`${process.cwd()}${ configFile?.filePathForGeneratedCSV ? configFile?.filePathForGeneratedCSV : '/public/translations.csv'}`, buffer)
		console.log('Data generated into csv file successfully!')
	} catch (error: any) {
		console.error(error)
	}
}

convertTranslationsFromJSONToCSV(config)
