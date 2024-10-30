#!/usr/bin/env node

const packageJSON = require(process.cwd() + '/package.json');
const fs = require('node:fs');

const getBaselineVersions = require(process.cwd() + '/node_modules/bl2bl/get-baseline-versions.js').getBaselineVersions;

console.log(packageJSON.bl2bl);

let baselineVersions;

const bl2blConfig = packageJSON.bl2bl;

if (
    bl2blConfig.baselineThreshold === "widely available" ||
    (
        parseInt(bl2blConfig.baselineThreshold) >= 2016
        &&
        parseInt(bl2blConfig.baselineThreshold) <= (new Date().getFullYear() - 1)
    )
) {
    baselineVersions = getBaselineVersions(bl2blConfig.baselineThreshold);
    console.log(packageJSON)
} else {
    console.warn("there's a problem with your bl2bl config.\nPlease fix it before proceeding.")
    process.exit();
}

if (bl2blConfig.downstreamBrowsers === true) {
    const getDownstreamBrowsers = require(process.cwd() + '/node_modules/bl2bl/get-downstream-browsers.js').getDownstreamBrowsers;
}

console.log(packageJSON);

// Behaviour varies depending on whether userBrowserslistrc=true or false
if (!bl2blConfig.useBrowserslistrc) {
    // if false, add baselineVersions to packageJSON object for later
    packageJSON['browserslist'] = baselineVersions;
    // and delete any existing .browserslistrc files to avoid conflict
    fs.unlink(process.cwd() + '/.browserslistrc',(err)=>{
        if (err) throw err;
        console.log('.browserslistrc');      
    });

} else {

    // if true, open .browserslistrc for writing
    let outputFile = fs.createWriteStream(process.cwd() + '/.browserslistrc');
    outputFile.on('error', function(err) { /* error handling */ });
    // write a header comment so it's clear where the config comes from
    outputFile.write("# This file was created by bl2bl2. \n# Learn more at https://github.com/tonypconway/bl2bl\n");
    // then write each min browser version to the output file
    baselineVersions.forEach(
        function(v) { 
            outputFile.write(v + '\n');
        }
    );
    // and close the file
    outputFile.end();

    // then remove browserslist from packageJSON if it exists to avoid conflicts/errors
    if (packageJSON.browserslist) {
        delete packageJSON.browserslist;
    }
}

console.log(packageJSON);

// Whatever happens, update package.json 
fs.writeFile(process.cwd() + '/package.json', JSON.stringify(packageJSON, null, 2), err => {
    if (err) {
        console.error(err);
    } else {
        // file written successfully
        // process.exit();
    }
});