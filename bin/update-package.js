#!/usr/bin/env node

const packageJSON = require(process.cwd() + '/package.json');

const getBaselineVersions = require(process.cwd() + '/node_modules/bl2bl/get-baseline-versions.js').getBaselineVersions;

console.log(packageJSON.bl2bl);

const bl2blConfig = packageJSON.bl2bl

if (bl2blConfig === "widely available" || (parseInt(bl2blConfig) >= 2016 && parseInt(bl2blConfig) <= (new Date().getFullYear() + 1))) {
    packageJSON['browserslist'] = getBaselineVersions(bl2blConfig);
    console.log(packageJSON)

    const fs = require('node:fs');

    fs.writeFile(process.cwd() + '/package.json', JSON.stringify(packageJSON, null, 2), err => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
        }
    });
} else {
    console.warn("there's a problem with your bl2bl config.\nPlease fix it before proceeding.")
    process.exit();
}