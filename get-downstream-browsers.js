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
const browsersListNamesMapping = {
    "webview_android": "android",
    "samsunginternet_android": "Samsung",
    "opera_android": "op_mob",
    "opera": "opera"
};

function getDownstreamBrowsers(baselineVersions) {
    const downstreamBrowsers = [];

    browsers.forEach(([downstream, upstream, browserslistKey]) => {
        const upstreamVersion = baselineVersions.find(version => version.includes(upstream));
        if (upstreamVersion) {
            const upstreamVersionNumber = parseInt(upstreamVersion.split('>=')[1].trim());
            const downstreamReleases = bcd.browsers[downstream].releases;

            let minVersion = null;

            Object.entries(downstreamReleases).forEach(([version, data]) => {
                if (data.engine === 'Blink' && parseInt(data.engine_version) >= upstreamVersionNumber) {
                    if (!minVersion || parseInt(version) < parseInt(minVersion)) {
                        minVersion = version;
                    }
                }
            });

            if (minVersion) {
                downstreamBrowsers.push(`${browsListNamesMapping[downstream]} >= ${minVersion}`);
            }
        }
    });

    return downstreamBrowsers;
}

module.exports = { getDownstreamBrowsers }
