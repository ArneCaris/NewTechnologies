// Requires the admc/wd client library
// (npm install wd)
// Then paste this into a .js file and run with Node 7.6+

const wd = require('wd');
const driver = wd.promiseChainRemote("http://127.0.0.1:4723/wd/hub");
const caps = {"platformName":"Android","platformVersion":"10","deviceName":"OnePlus 7 Pro","automationName":"Appium","app":"C:\\Users\\gudenko\\Desktop\\Git\\SchoolProjects\\socket-version\\NewTechnologies\\android\\app\\build\\outputs\\apk\\debug\\app-debug.apk","autoGrantPermissions":true};

async function main () {
  await driver.init(caps);
  setTimeout(() => {
    console.log("why")
  }, 5000)

  let el1 = await driver.elementByAccessibilityId("loginInput");
  await el1.sendKeys("order66");
  let el2 = await driver.elementByXPath("//android.widget.Button[@content-desc=\"loginButton\"]/android.widget.TextView");
  await el2.click();
  await driver.quit();
}

main().catch(console.log);
