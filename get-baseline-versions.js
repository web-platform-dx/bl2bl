const bcd = require('@mdn/browser-compat-data');

// https://github.com/web-platform-dx/web-features/blob/main/docs/baseline.md#core-browser-set
// This maps the name of the browser in MDN to the name of the browser in browserslist
const browsers = {
  "chrome": "Chrome",
  "chrome_android": "ChromeAndroid",
  "edge": "Edge",
  "firefox": "Firefox",
  "firefox_android": "FirefoxAndroid",
  "safari": "Safari",
  "safari_ios": "iOS",
};

function getBaselineVersions(config) {
  var startEpoch = config == "widely available"
    ? Math.floor(new Date().setMonth(new Date().getMonth() - 30) / 1000)
    : Math.floor(new Date(`${parseInt(config) + 1}.01.01`).getTime() / 1000);

  var finalArrayOfVersions = new Array();

  Object.keys(browsers).forEach(browser => {

    var arrayOfVersions = new Array();

    Object.entries(bcd.browsers[browser].releases)
      .forEach(([version, data],index,array) => {
        if (data.release_date != undefined) {
          arrayOfVersions.push({
            version: version,
            release_date: data.release_date,
            browserslist_string: `${browsers[browser]} >= ${version}`,
            status: data.status
          });
        }
      }, 0);

    let sortedVersions = arrayOfVersions.sort((a, b) => Date.parse(a.release_date) - Date.parse(b.release_date));

    let versionSelected = false

    sortedVersions.forEach((version, index, arr)=>{
      if (Date.parse(version.release_date)/1000 > startEpoch && versionSelected == false) {
        // finalArrayOfVersions.push([arr[index - 1].browserslist_string, arr[index - 1].release_date]);
        finalArrayOfVersions.push(arr[index - 1].browserslist_string);
        versionSelected = true;
      }
    });

  });
  return finalArrayOfVersions;
}

module.exports = {getBaselineVersions}