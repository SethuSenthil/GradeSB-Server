const puppeteer = require('puppeteer');
const express = require('express')
const app = express();
const port = process.env.PORT || 3220;

var admin = require("firebase-admin");

var serviceAccount = require("firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gpapps.firebaseio.com"
});

let browser, sessionID , studentID;

(async () => {
   sessionID = '762C927DCCEC46C7EC8BE4F47375B57A'
    studentID = '10023088'
await puppeteer.launch({headless: false});
})()
app.get('/directLogin/:info', (req, res) => {
  let info = req.params.info.split('*')
  studentID = info[0]
  sessionID = info[1]


  (async () => {
    /*let sessionID = '762C927DCCEC46C7EC8BE4F47375B57A',
        studentID = '10023088';*/
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    const blockedResourceTypes = [
      'image',
      'media',
      'ico',
      'font',
      'texttrack',
      'object',
      'beacon',
      'csp_report',
      'imageset',
      'stylesheet',
    ];

    const skippedResources = [
      'quantserve',
      'adzerk',
      'doubleclick',
      'adition',
      'exelator',
      'sharethrough',
      'cdn.api.twitter',
      'google-analytics',
      'googletagmanager',
      'google',
      'fontawesome',
      'facebook',
      'analytics',
      'optimizely',
      'clicktale',
      'mixpanel',
      'zedo',
      'clicksor',
      'tiqcdn',
    ];
    page.on('request', (req) => {
      const requestUrl = req._url.split('?')[0].split('#')[0];
      if (
        blockedResourceTypes.indexOf(req.resourceType()) !== -1 ||
        skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)
      ) {
        req.abort();
      } else {
        req.continue();
    }
    });
    console.log(new Date())
    await page.goto('https://students.sbschools.org/genesis/sis/view?gohome=true');
    const wipe =   await  page.evaluate(() => document.title);
    console.log(wipe)
    await page.deleteCookie({name: 'JSESSIONID'})
    await page.setCookie({name: 'JSESSIONID', value: sessionID,httpOnly:true,secure:true})

    await page.goto(`https://students.sbschools.org/genesis/parents?tab1=studentdata&tab2=studentsummary&studentid=${studentID}&action=form`)
    await page.goto(`https://students.sbschools.org/genesis/parents?tab1=studentdata&tab2=gradebook&tab3=weeklysummary&action=form&studentid=${studentID}`)
    await page.evaluate(() => eval(`
    let classList = document.getElementsByTagName("font"),
        classArr = [],
        gradesArr = [];
    for (let i = 0; i < classList.length; i++) {
        let className = classList[i].innerText;
        classArr.push(className)
        let grade = document.querySelectorAll('[style="text-decoration: underline"]')[5 + i].innerText
        gradesArr.push(grade)
        console.log(className + ' : ' + grade)
    }
    document.cookie = "grades="+ gradesArr
    document.cookie = "class="+ classArr
    `));
    let cok = await page.cookies();
    console.log(cok)
    let classes = cok[1].value
    let grades = cok[2].value
    grades = grades.split(',')
    classes = classes.split(',')

  //convert to int and remove %
  for (let i = 0; i < grades.length; i++) {
      let elem = grades[i];
      grades[i] = parseInt(elem.substring(0, elem.length - 1))
  }

    console.log(classes)
    console.log(grades)
    //compare scores
      //send pushnotif accordingly
      firebaseadmin
  })();
})


app.listen(port, () => {
  console.log(`listening on port ${ port }`);
});