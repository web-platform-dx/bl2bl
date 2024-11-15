#!/usr/bin/env node

const packageJSON = require(process.cwd() + '/package.json');
const fs = require('node:fs');

if (packageJSON.bl2bl.savePrevious) {
    let backupMessage = "# backup file created by bl2bl at " + new Date().toLocaleString() + '\n';
    // Check if .browserslistrc exists
    // fs.readSync(process.cwd() + '/.browserslistrc', fs.constants.R_OK, (err, fd) => {

        if (fs.existsSync(process.cwd() + '/.browserslistrc')) {
            // Read the contents of .browserslistrc
            let browserslistrcData = fs.readFileSync(process.cwd() + '/.browserslistrc', {encoding: 'utf8'});
            // And write it to a backupfile
            fs.writeFileSync(process.cwd() + '/.browserslistrc_backup', (backupMessage+browserslistrcData), { encoding: 'utf8' });

        } else {
            // Check if packageJSON.browserslist exists
            if (packageJSON.browserslist) {
                // Write each item of the array on a new line in .browserslistrc_backup
                const backupData = packageJSON.browserslist.join('\n');
                fs.writeFileSync(process.cwd() + '/.browserslistrc_backup', (backupMessage+backupData), {encoding: 'utf8'});
            } else {
                console.log("No existing browserslist configuration, skipping backup.");
            }
        }
    // });

}

const getBaselineVersions = require(process.cwd() + '/node_modules/bl2bl/get-baseline-versions.js').getBaselineVersions;

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
} else {
    console.warn("there's a problem with your bl2bl config.\nPlease fix it before proceeding.")
    process.exit();
}

if (bl2blConfig.downstreamBrowsers == true) {
    const getDownstreamBrowsers = require(process.cwd() + '/node_modules/bl2bl/get-downstream-browsers.js').getDownstreamBrowsers;
    const downstreamVersions = getDownstreamBrowsers(baselineVersions);
    baselineVersions = baselineVersions.concat(downstreamVersions);
}

// Behaviour varies depending on whether userBrowserslistrc=true or false
if (!bl2blConfig.useBrowserslistrc) {
    // if false, add baselineVersions to packageJSON object for later
    packageJSON['browserslist'] = baselineVersions;
    // and delete any existing .browserslistrc files to avoid conflict
    fs.access(process.cwd() + '/.browserslistrc', err=>{
        if (!err) {
            fs.unlink(process.cwd() + '/.browserslistrc',(err)=>{
                if (err) throw err;
            });
        }
    })


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

// Whatever happens, update package.json as long as the packageJSON object isn't null
if (packageJSON != null) {
    fs.writeFile(process.cwd() + '/package.json', JSON.stringify(packageJSON, null, 2), err => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
            // process.exit();
        }
    });
}

