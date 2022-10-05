export interface IJsonToCsvConfig {
    csvDelimiter: string
    filePathForGeneratedCSV: string
    pathToDirectoryForLocales: string
    supportedLanguages?: string[]
    includeFiles?: string[]
}