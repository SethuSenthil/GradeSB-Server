/* Copyright (C) Sethu Narayan Senthil - All Rights Reserved
 * MIT license
 * https://sethusenthil.com
 * December 2019
 * GradeSB-Server ALPHA
 */
const cheerio = require('cheerio')
const curl = new (require( 'curl-request' ))();
const purl = new (require( 'curl-request' ))();
const express = require('express')
const app = express();
const port = process.env.PORT || 3220;

app.get('/auth/:info', (req, res) => {
    let info = req.params.info.split('*')
    studentID = info[0]
    sessionID = info[1]
    let headers = [
        'Host: students.sbschools.org',
        'Connection: keep-alive',
        'Cache-Control: max-age=0',
        'Upgrade-Insecure-Requests: 1',
        'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
        'Sec-Fetch-User: ?1',
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'Sec-Fetch-Site: none',
        'Sec-Fetch-Mode: navigate',
        'Accept-Encoding: gzip, deflate, br',
        'Accept-Language: en-US,en;q=0.9',
        `Cookie: lastvisit=sethusenthil.com; JSESSIONID=${sessionID}; _ga=GA1.2.515536524.1573357073`
        ]

//scrape grades
curl.setHeaders(headers)
.get(`https://students.sbschools.org/genesis/parents?tab1=studentdata&tab2=gradebook&tab3=weeklysummary&action=form&studentid=${studentID}`)
.then(({statusCode, body, headers}) => {
    console.log(statusCode, body, headers)
    const $ = cheerio.load(body)
    //console.log($.html())
    //res.send($.html())
    let gradeSelector = $('td[title="View Course Summary"]'),
        classSelector =  $('font[color="#0000ff"]'),
        classes = [],
        grades = [];

    for (let i = 0; i < gradeSelector.length; i++) {
        const thisClass = classSelector[i].children[0].children[0].data.substr(132).split(' \n                                        \n                                            ')[0]
        const thisGrade = gradeSelector[i].children[1].children[0].data.split('\n')[1].substr(68).split('%')[0]

        classes.push(thisClass)
        grades.push(thisGrade)
    }
    console.log(classes)
    console.log(grades)


    //START: database concept actions//
    /* for (let i = 0; i < grades.length; i++) {
        const thisGrade = grades[i];
        const thisClass = classes[i];
        if(thisGrade > lastGrade){
            //send push: "⬆️ you grade in ${thisClass} has jumped to a ${thisGrade}"
        }else if(thisGrade < lastGrade){
            //send push: "⬇️ you grade in ${thisClass} has dropped to a ${thisGrade}"
        }
        //send ${thisGrade} to database
    } */
    //END: database concept actions//

})
.catch((e) => {
    console.log(e);
});

//scrape assignments
purl.setHeaders(headers)
.get(`https://students.sbschools.org/genesis/parents?tab1=studentdata&tab2=gradebook&tab3=listassignments&studentid=${studentID}&action=form&date=12/15/2019&dateRange=allMP&courseAndSection=&status=GRADED`)
.then(({statusCode, body, headers}) => {
    console.log(statusCode, body, headers)
    const $ = cheerio.load(body)
    console.log($.html())
    //res.send($.html())
    let ass =  $('div[style="display:none;background-color: white;border:1px ridge #dcdcdc;position:absolute; width:400px;min-height:100px;overflow: hidden;"]')
    console.log(ass.length)

    //START: database concept actions//
     if(ass.length > lastAss){
         let diff = ass.length - lastAss
         //send push: "${diff} new grades have been posted"
     }
    //END: database concept actions//

})
.catch((e) => {
    console.log(e);
});
})

app.listen(port, () => {
  console.log(`listening on port ${ port }`);
});



