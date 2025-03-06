#!/usr/bin/env node
import("baseline-browser-mapping").then((bbm) => {
  // This list represents browsers that are supported in baseline-browser-mapping AND browserslist
  const browsers = {
    chrome: "Chrome",
    chrome_android: "ChromeAndroid",
    edge: "Edge",
    firefox: "Firefox",
    firefox_android: "FirefoxAndroid",
    safari: "Safari",
    safari_ios: "iOS",
    webview_android: "Android",
    samsunginternet_android: "Samsung",
    opera_android: "op_mob",
    opera: "Opera",
    qq_android: "and_qq",
    uc_android: "and_uc",
  };

  const packageJSON = require(process.cwd() + "/package.json");

  const fs = require("node:fs");

  let incomingConfig = packageJSON.bl2bl ?? {};
  const bl2blConfig = {
    baselineThreshold: incomingConfig.baselineThreshold ?? "widely available",
    useBrowserslistrc: incomingConfig.useBrowserslistrc ?? false,
    downstreamBrowsers: incomingConfig.downstreamBrowsers ?? false,
    savePrevious: incomingConfig.savePrevious ?? true,
  };

  packageJSON.bl2bl = bl2blConfig;

  if (bl2blConfig.savePrevious === true) {
    let backupMessage =
      "# backup file created by bl2bl at " + new Date().toLocaleString() + "\n";

    // Check if .browserslistrc exists
    if (fs.existsSync(process.cwd() + "/.browserslistrc")) {
      // Read the contents of .browserslistrc
      let browserslistrcData = fs.readFileSync(
        process.cwd() + "/.browserslistrc",
        { encoding: "utf8" },
      );
      // And write it to a backupfile
      fs.writeFileSync(
        process.cwd() + "/.browserslistrc_backup",
        backupMessage + browserslistrcData,
        { encoding: "utf8" },
      );
    } else {
      // Check if packageJSON.browserslist exists
      if (packageJSON.browserslist) {
        // Write each item of the array on a new line in .browserslistrc_backup
        const backupData = packageJSON.browserslist.join("\n");
        fs.writeFileSync(
          process.cwd() + "/.browserslistrc_backup",
          backupMessage + backupData,
          { encoding: "utf8" },
        );
      } else {
        console.log("No existing browserslist configuration, skipping backup.");
      }
    }
  }

  let baselineVersions;
  let browserslistOutput = new Array();

  // If the user wants Baseline Widely Available
  if (bl2blConfig.baselineThreshold === "widely available") {
    // Get the minimum Baseline widely available versions
    baselineVersions = bbm.getMinimumWidelyAvailable(
      bl2blConfig.downstreamBrowsers,
    );
  } else if (
    // If they've passed a valid year, i.e. after BL starts and not the current or future years
    parseInt(bl2blConfig.baselineThreshold) >= 2016 &&
    parseInt(bl2blConfig.baselineThreshold) <= new Date().getFullYear() - 1
  ) {
    // Get the versions that correspond to those years
    baselineVersions = bbm.getMinimumByYear(
      bl2blConfig.baselineThreshold,
      bl2blConfig.downstreamBrowsers,
    );
  } else {
    // If the baselineThreshold doesn't meet any of those criteria, there's a problem.  Time to bounce.
    console.warn(
      "there's a problem with your bl2bl config.\nPlease fix it before proceeding.",
    );
    process.exit();
  }

  // Loop through returned minimum browser versions
  baselineVersions.forEach((browser) => {
    // Check if that browser is supported by Browserslist
    if (Object.keys(browsers).includes(browser.browser)) {
      // And add it to the list of versions to be written
      browserslistOutput.push(
        `${browsers[browser.browser]} >= ${browser.version}`,
      );
    }
  });

  // Behaviour varies depending on whether userBrowserslistrc=true or false
  if (!bl2blConfig.useBrowserslistrc) {
    // if false, add baselineVersions to packageJSON object for later
    packageJSON["browserslist"] = browserslistOutput;
    // and delete any existing .browserslistrc files to avoid conflict
    fs.access(process.cwd() + "/.browserslistrc", (err) => {
      if (!err) {
        fs.unlink(process.cwd() + "/.browserslistrc", (err) => {
          if (err) throw err;
        });
      }
    });
  } else {
    // if true, open .browserslistrc for writing
    let outputFile = fs.createWriteStream(process.cwd() + "/.browserslistrc");
    outputFile.on("error", function (err) {
      /* error handling */
    });
    // write a header comment so it's clear where the config comes from
    outputFile.write(
      "# This file was created by bl2bl2. \n# Learn more at https://github.com/web-platform-dx/bl2bl\n",
    );
    // then write each min browser version to the output file
    browserslistOutput.forEach(function (v) {
      outputFile.write(v + "\n");
    });
    // and close the file
    outputFile.end();

    // then remove browserslist from packageJSON if it exists to avoid conflicts/errors
    if (packageJSON.browserslist) {
      delete packageJSON.browserslist;
    }
  }

  // Whatever happens, update package.json as long as the packageJSON object isn't null
  if (packageJSON != null) {
    fs.writeFileSync(
      process.cwd() + "/package.json",
      JSON.stringify(packageJSON, null, 2),
      { encoding: "utf8" },
    );
  }
});
