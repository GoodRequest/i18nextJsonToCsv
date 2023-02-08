#!/usr/bin/env node
import fs from 'fs'
import prettier from 'prettier'

import { forEach, includes, isEmpty } from 'lodash'

// load config file
const config = require(process.env.CONFIG_PATH ? `${process.cwd()}${process.env.CONFIG_PATH}` : (fs.existsSync(`${process.cwd()}/i18JsonToCsv.config.json`)) ? `${process.cwd()}/i18JsonToCsv.config.json` : '../config.json')

const readFile: any = fs.readFileSync
const writeFile: any = fs.writeFileSync

const convertTranslationsFromCSVToJSON = (configFile: any) => {
	const pathToDirectoryForLocales: string = `${process.cwd()}${configFile?.pathToDirectoryForLocales ? configFile?.pathToDirectoryForLocales : '/public/locales'}`
	const filePath: string = `${process.cwd()}${configFile?.filePathForGeneratedCSV ? configFile?.filePathForGeneratedCSV : '/public/translations.csv'}`
	console.log('Script ran with this configuration =>', configFile, '\n')
	if (fs.existsSync(filePath)) {
		const csvDelimiter: string = configFile?.csvDelimiter || ';'
		const supportedLanguages: string[] | null = configFile?.supportedLanguages || null
		const includeFiles: string[] | null = configFile?.includeFiles || null
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
						if (lanIndex > 0 && !isEmpty(language.trim())) {
							languages.push(language.trim())
						}
					})
				} else {
					// check if is new file "--<<fileName>>--"
					const fileName = text.match(/(?<=--)(.*?)(?=--)/gm)?.[0]
					if (fileName && !isEmpty(fileName)) {
						files.push(fileName)
						// save actual file name
						actualFile = fileName
					} else {
						const locKey = text.split(csvDelimiter)?.[0]?.trim()
						// skip first column with locKey and empty columns in row
						const rowWithoutKey: string[] = text.split(csvDelimiter)?.splice(1, languages.length)
						// go through table columns and get text for specific language
						forEach(rowWithoutKey, (columnText: string, index: number) => {
							// get variables for translation key
							const locKeyVariables = locKey.match(/{{[^{}]*}}/g);
							// get variables for translation value
							const columnTextVariables = columnText.match(/{{[^{}]*}}/g);
							if (locKeyVariables && locKeyVariables.length > 0 && !columnTextVariables) {
								console.log(`\x1B[33mWarning! \x1B[36m${locKeyVariables} \x1B[0mvariables is missing in translation for key: \x1B[36m"${locKey}" \x1B[0mand \x1B[36m"${languages[index]}" \x1B[0mlanguage`)
							} else if(locKeyVariables && columnTextVariables) {
								// checking if variables is same as in key
								forEach(locKeyVariables, (variable: string) => {
									if (!columnTextVariables.includes(variable)) {
										console.log(`\x1B[33mWarning! \x1B[36m${variable} \x1B[0mvariable is missing in translation for key: \x1B[36m"${locKey}" \x1B[0mand \x1B[36m"${languages[index]}" \x1B[0mlanguage`)
									}
								})
							}
							// check if language and file is selected in config
							if ((includes(supportedLanguages, languages[index]) || !supportedLanguages) && (includes(includeFiles, actualFile) || !includeFiles) && !isEmpty(locKey)  && languages[index]) {
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
					if (!fs.existsSync(`${pathToDirectoryForLocales}/${languagesKey}`)){
						// create directory if not exist
						fs.mkdirSync(`${pathToDirectoryForLocales}/${languagesKey}`)
					}
					// write parsed data to file
					const fileContent: string = prettier.format(JSON.stringify(result[languagesKey][fileKey]),{ semi: true, parser: 'json' })
					writeFile(`${pathToDirectoryForLocales}/${languagesKey}/${fileKey}.json`, fileContent,'utf8')
				})
			})
			console.log('\n', 'Detected languages: ', languages, ' | ', 'Detected files: ', files, '\n')
			console.log('\x1B[32mData parsed into files successfully!')
		} catch (error: any) {
			console.error(error)
		}
	} else {
		console.log(`\x1B[31mError when loading file! No such file or directory, trying open '${filePath}'.`)
	}
}

convertTranslationsFromCSVToJSON(config)
