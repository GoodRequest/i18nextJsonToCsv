#!/usr/bin/env cross-env ts-node
import fs from 'fs'
import prettier from 'prettier'

import { forEach, startsWith, endsWith, includes } from 'lodash'

// load config file
const config = require(`${ process.env.CONFIGPATH ? process.env.CONFIGPATH : './config.json' }`)

const readFile: any = fs.readFileSync
const writeFile: any = fs.writeFileSync

const convertTranslationsFromCSVToJSON = (configFile: any) => {
	const filePath: string = `${process.cwd()}${configFile?.filePathForGeneratedCSV ? configFile?.filePathForGeneratedCSV : '/public/translations.csv'}`
	console.log('Script ran with this configuration =>', configFile)
	if (fs.existsSync(filePath)) {
		const csvDelimiter: string = configFile?.csvDelimiter || ';'
		const supportedLanguages: string[] | null = configFile?.supportedLanguages || null
		const filesTypes: string[] | null = configFile?.filesTypes || null
		try {
			const fileContent = readFile(filePath, 'utf-8')
			// read file by lines
			let languages: string[] = []
			let files: string[] = []
			let actualFile: string = ''
			let result: any = {}
			forEach(fileContent.split('\n'), (text: string, index: number) => {
				// first line get language mutations
				if (index === 0) {
					forEach(text.split(csvDelimiter), (language: string, lanIndex: number) => {
						if (lanIndex > 0) {
							languages.push(language.trim())
						}
					})
				} else {
					// check if is new file "--<<fileName>>--"
					if (startsWith(text, '--') && endsWith(text, '--')) {
						// replace identifier '--' for new file
						const fileName = text.replace(/--/gm, '')
						files.push(fileName)
						// save actual file name
						actualFile = fileName
					} else {
						const locKey = text.split(csvDelimiter)?.[0]?.trim()
						// skip first column in row with loc key
						const [firstColumn, ...rowWithoutKey]: string[] = text.split(csvDelimiter)
						// go through table columns and get text for specific language
						forEach(rowWithoutKey, (columnText: string, index: number) => {
							// check if language and file is selected in config
							if ((includes(supportedLanguages, languages[index]) || !languages) && (includes(filesTypes, actualFile) || !filesTypes)) {
								// add key and column for specific language and file
								result = {
									...result,
									// language mutation
									[languages[index]]: {
										...result?.[languages[index]],
										// file loc, paths atc...
										[actualFile]: {
											...result?.[languages[index]]?.[actualFile],
											// loc key with value for specific language
											[locKey]: columnText.trim()
										}
									}
								}
							}
						})
					}
				}
			})
			// get language keys
			forEach(Object.keys(result), (languagesKey: string) => {
				// write data into json files
				const fileKeys = Object.keys(result[languagesKey])
				forEach(fileKeys, (fileKey: string) => {
					// check if directory for language exist
					if (!fs.existsSync(`${process.cwd()}/public/locales/${languagesKey}`)){
						// create directory if not exist
						fs.mkdirSync(`${process.cwd()}/public/locales/${languagesKey}`)
					}
					// write parsed data to file
					const fileContent: string = prettier.format(JSON.stringify(result[languagesKey][fileKey]),{ semi: true, parser: 'json' })
					writeFile(`${process.cwd()}/public/locales/${languagesKey}/${fileKey}.json`, fileContent,'utf8')
				})
			})
			console.log('Detected languages: ', languages, ' | ', 'Detected files: ', files)
			console.log('Data parsed into files successfully!')
		} catch (error: any) {
			console.error(error)
		}
	} else {
		console.log(`Error when loading file! No such file or directory, trying open '${filePath}'.`)
	}
}

convertTranslationsFromCSVToJSON(config)
