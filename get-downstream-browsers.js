const bcd = require(process.cwd() + '/node_modules/@mdn/browser-compat-data');

// https://github.com/web-platform-dx/web-features/blob/main/docs/baseline.md#core-browser-set
// This maps the name of the browser in MDN to the name of the browser in browserslist

const browsers = [
    // downstream browser bcd key, upstream browser bcd key, browserslist key
    ["webview_android",  "chrome_android", "android"],
    ["samsunginternet_android", "chrome_android", "Samsung"],
    ["opera_android", "chrome_android", "op_mob"],
    ["opera", "chrome", "opera"]
];

/*
TODO: we don't have a good mapping for QQ and UC browsers to Chromium.  
Where does that exist?  Where did Philip get his mappings from?
*/
const browsersListNamesMapping = {};

function getDownsteamBrowsers(baselineVersions) {

}

module.exports = { getDownsteamBrowsers }