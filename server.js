/* Copyright (C) Sethu Narayan Senthil - All Rights Reserved
 * MIT license
 * https://sethusenthil.com
 * March 2020
 * GradeSB-Server ALPHA
 */
const cheerio = require("cheerio");
const curl = new (require("curl-request"))();
const express = require("express");
const { exec } = require("child_process");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser);

const port = process.env.PORT || 3220;

app.post("/createSession", function(req, res) {
  console.dir(req.body);
  let idNum = req.body.username;
  let password = req.body.password;
  let createdSessionID = createSession(idNum, password);
  res.json(createdSessionID);
});

app.post("/grades", function(req, res) {
  console.dir(req.body);
  let idNum = req.body.username;
  let sID = req.body.session;
  let grades = getGrades(sID, idNum);
  res.json(grades);
});

app.post("/extra", function(req, res) {
  console.dir(req.body);
  let idNum = req.body.username;
  let sID = req.body.session;
  let extra = extraInfo(sID, idNum);
  res.json(extra);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

function createSession(studentID, password) {
  //curl 'https://students.sbschools.org/genesis/sis/view?gohome=true' -H 'Connection: keep-alive' -H 'Cache-Control: max-age=0' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36' -H 'Sec-Fetch-User: ?1' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-Mode: navigate' -H 'Referer: https://students.sbschools.org/genesis/sis/view?gohome=true' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: en-US,en;q=0.9' --compressed
  let sessionID = "";
  let headers = [
    "Host: students.sbschools.org",
    "Connection: keep-alive",
    "Cache-Control: max-age=0",
    "Upgrade-Insecure-Requests: 1",
    "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
    "Sec-Fetch-User: ?1",
    "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Sec-Fetch-Site: same-origin",
    "Sec-Fetch-Mode: navigate",
    "Referer: https://students.sbschools.org/genesis/sis/view?gohome=true",
    "Accept-Encoding: gzip, deflate, br",
    "Accept-Language: en-US,en;q=0.9"
  ];
  const curly = new (require("curl-request"))();

  curly
    .setHeaders(headers)
    .get(`https://students.sbschools.org/genesis/sis/view?gohome=true`)
    .then(({ statusCode, body, headers }) => {
      sessionID = headers["set-cookie"][0].split("=")[1].split(";")[0];
      console.log(sessionID);
      return auth(studentID, password, sessionID);
    })
    .catch(e => {
      console.log(e);
    });
}

function auth(studentID, password, sessionID) {
  exec(
    `curl 'https://students.sbschools.org/genesis/sis/j_security_check' -H 'Connection: keep-alive' -H 'Cache-Control: max-age=0' -H 'Origin: https://students.sbschools.org' -H 'Upgrade-Insecure-Requests: 1' -H 'Content-Type: application/x-www-form-urlencoded' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36' -H 'Sec-Fetch-User: ?1' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-Mode: navigate' -H 'Referer: https://students.sbschools.org/genesis/sis/view?gohome=true' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: en-US,en;q=0.9' -H 'Cookie: lastvisit=non; JSESSIONID=${sessionID}' --data 'j_username=${studentID}%40sbstudents.org&j_password=${encodeURI(
      password
    )}' --compressed`,
    (error, stdout, stderr) => {
      console.log("rub");
      getGrades(sessionID, studentID);
      let json = {
        sessionID: sessionID
      };

      return json;
    }
  );
}

function checkSession(body) {
  if (body.indexOf(`document.getElementById('j_username').focus();`) == -1)
    return true;
  return false;
}

function extraInfo(studentID, sessionID) {
  let headers = [
    "Host: students.sbschools.org",
    "Connection: keep-alive",
    "Cache-Control: max-age=0",
    "Upgrade-Insecure-Requests: 1",
    "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
    "Sec-Fetch-User: ?1",
    "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
    "Sec-Fetch-Site: none",
    "Sec-Fetch-Mode: navigate",
    "Accept-Encoding: gzip, deflate, br",
    "Accept-Language: en-US,en;q=0.9",
    `Cookie: lastvisit=sethusenthil.com; JSESSIONID=${sessionID}; _ga=GA1.2.515536524.1573357073`
  ];

  const hurl = new (require("curl-request"))();

  hurl
    .setHeaders(headers)
    .get(
      `https://students.sbschools.org/genesis/parents?tab1=studentdata&tab2=studentsummary&studentid=${studentID}&action=form`
    )
    .then(({ statusCode, body, headers }) => {
      if (checkSession(body)) {

        const $ = cheerio.load(body);
        let cash = $('td[nowrap=""]')[7].children[0].data;
        console.log(cash);
        let grade = $('span[style="font-size: 2em;"]')[0].children[0].data;
        console.log(grade);
        let busSelector = $('td.cellCenter')
        let bus = [busSelector[busSelector.length - 2].text , busSelector[busSelector.length - 6].text]
        let json = {
          "session" : true,
          "gradeLevel": grade,
          "cash" : cash,
          "bus" : bus
        };
        return json;
      } else {
           let json = {
        "session" : false,
      }
      return json
      }
    })
    .catch(e => {
      console.log(e);
    });
}

function getGrades(sessionID, studentID) {
  let headers = [
    "Host: students.sbschools.org",
    "Connection: keep-alive",
    "Cache-Control: max-age=0",
    "Upgrade-Insecure-Requests: 1",
    "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
    "Sec-Fetch-User: ?1",
    "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
    "Sec-Fetch-Site: none",
    "Sec-Fetch-Mode: navigate",
    "Accept-Encoding: gzip, deflate, br",
    "Accept-Language: en-US,en;q=0.9",
    `Cookie: lastvisit=sethusenthil.com; JSESSIONID=${sessionID}; _ga=GA1.2.515536524.1573357073`
  ];

  //scrape grades

  const murl = new (require("curl-request"))();

  murl
    .setHeaders(headers)
    .get(
      `https://students.sbschools.org/genesis/parents?tab1=studentdata&tab2=gradebook&tab3=weeklysummary&action=form&studentid=${studentID}`
    )
    .then(({ statusCode, body, headers }) => {
      if (checkSession(body)) {
      let mp = body.split(`var dateRange = '`)[1].substring(0, 3);
      console.log(statusCode, body, headers);
        const $ = cheerio.load(body);
        console.log($.html());
        //res.send($.html())
        let gradeSelector = $('td[title="View Course Summary"]'),
          classSelector = $('font[color="#0000ff"]'),
          classes = [],
          grades = [];

        for (let i = 0; i < gradeSelector.length; i++) {
          const thisClass = classSelector[i].children[0].children[0].data
            .substr(132)
            .split(
              " \n                                        \n                                            "
            )[0]
            .split(
              " \r\n                                        \r\n                                            "
            )[0]
            .substring(3);
          const thisGrade = gradeSelector[i].children[1].children[0].data
            .split("\n")[1]
            .substr(68)
            .split("%")[0];

          classes.push(thisClass);
          grades.push(thisGrade);
        }

        //class clicks start after sub 5
        let classInfo = [];
        let clickSelector = $("td[onclick]");
        for (let i = 5; i < clickSelector.length; i++) {
          let split = clickSelector[i].attribs.onclick.split(`'`);
          let courseCode = split[1];
          let courseSection = split[3];
          //let tempUrl = 'https://students.sbschools.org/genesis/parents?tab1=studentdata&tab2=gradebook&tab3=coursesummary&studentid=10023088&action=form&courseCode=' + courseCode + '&courseSection=' + courseSection + '&mp=MP3';
          classInfo.push([courseCode, courseSection]);
        }

        console.log(classes);
        console.log(grades);
        console.log(mp);
        //console.log(classUrls)

        let json = {
          session: true,
          classes: classes,
          grades: grades,
          classInfo: classInfo
        };
        return json;
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
      } else {
        let json = {
          session: false
        };
        return json;
      }
    })
    .catch(e => {
      console.log(e);
    });
  const purl = new (require("curl-request"))();

  //scrape assignments
  purl
    .setHeaders(headers)
    .get(
      `https://students.sbschools.org/genesis/parents?tab1=studentdata&tab2=gradebook&tab3=listassignments&studentid=${studentID}&action=form&date=12/15/2019&dateRange=allMP&courseAndSection=&status=GRADED`
    )
    .then(({ statusCode, body, headers }) => {
      if (checkSession(body)) {
        //console.log(statusCode, body, headers)
        const $ = cheerio.load(body);
        // console.log($.html())
        //res.send($.html())
        let ass = $(
          'div[style="display:none;background-color: white;border:1px ridge #dcdcdc;position:absolute; width:400px;min-height:100px;overflow: hidden;"]'
        );
        console.log(ass.length);

        //START: database concept actions//

        //END: database concept actions//
      } else {
        return false;
      }
    })
    .catch(e => {
      console.log(e);
    });
}

//curl 'https://students.sbschools.org/genesis/sis/j_security_check' -H 'Connection: keep-alive' -H 'Cache-Control: max-age=0' -H 'Origin: https://students.sbschools.org' -H 'Upgrade-Insecure-Requests: 1' -H 'Content-Type: application/x-www-form-urlencoded' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36' -H 'Sec-Fetch-User: ?1' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-Mode: navigate' -H 'Referer: https://students.sbschools.org/genesis/sis/view?gohome=true' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: en-US,en;q=0.9' -H 'Cookie: lastvisit=FA4FD90B3D7446B6AE6B97AA3D9D1880; lastvisit=non; JSESSIONID=A80C030C46F841A5A9CB55D123547239' --data 'j_username=10023088%40sbstudents.org&j_password=Hill%40197' --compressed

//curl 'https://students.sbschools.org/genesis/sis/j_security_check' -H 'Connection: keep-alive' -H 'Cache-Control: max-age=0' -H 'Origin: https://students.sbschools.org' -H 'Upgrade-Insecure-Requests: 1' -H 'Content-Type: application/x-www-form-urlencoded' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36' -H 'Sec-Fetch-User: ?1' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-Mode: navigate' -H 'Referer: https://students.sbschools.org/genesis/sis/view?gohome=true' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: en-US,en;q=0.9' -H 'Cookie: lastvisit=nan; JSESSIONID=sethuENV; _ga=GA1.2.515536524.1573357073' --data 'j_username=10023088%40sbstudents.org&j_password=Hill%40197' --compressed
