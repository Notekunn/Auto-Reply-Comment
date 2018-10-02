request = require('request-promise');
var logIDs = new Array();
let delay = 800;
var recentStatus;
const ACCESS_TOKEN = 'EAACW5Fg5N2IBALWZBOpP0goyXQUuuVZB8y9oJcmeUb27UmfHkhTVu9sok4gRlHS2qJseK60FZA2RmvSvPr84QcYRvdmKimYrZAZB0ysfgdBlDkL3ZBm9E8MYoOWJKohHRl3xd7o0MIi1pfAdkZAAd7LgvavkAhWEG1WqAXErFObQ3vMFZBRAJMtpT94v9FHTMwQZD'
var cronjob = setInterval(() => {
    request({
        url: 'https://api.facebook.com/method/fql.query',
        qs: {
            access_token: ACCESS_TOKEN,
            format: 'json',
            query: 'SELECT text, fromid, time, object_id, id FROM comment WHERE fromid != me() AND object_id IN (SELECT status_id FROM status WHERE uid = "100009859624773" limit 1)  AND text != "" order by time desc LIMIT 2'
        },
        json: true
    })
        .then(result => {
            if (result.error_code || result.error_msg) return console.log('Lỗi cmnr! ', result.error_msg) && clearInterval(cronjob) && process.exit(1)
            //console.log(result);


            let i = 0
            let ObjectID = result[0] && result[0].object_id;
            if (recentStatus != ObjectID) {
                console.log('Đang quét cmt của id', ObjectID);
                recentStatus = ObjectID
            }
            while (i < result.length) {

                let j = i;
                let idCmt = result[j].id;
                let idUserCmt = result[j].fromid;
                let contentComment = result[j].text;
                if (logIDs.includes(idCmt)) break;
                logIDs.push(idCmt)
                if (!contentComment) continue;
                getsimi(contentComment)
                    .then(replysimsimi =>
                        request({
                            url: `https://graph.facebook.com/${ObjectID}/comments`,
                            qs: {
                                access_token: ACCESS_TOKEN,
                                message: `@[${idUserCmt}:0] ${replysimsimi || 'Hông biết nói gì'}`,
                                method: 'POST'

                            }
                        })
                    ).then(
                        a => console.log(a)
                    )
                    .catch(error => {
                        console.log('' + error)
                    })


                i++;
            }

        })
        .catch(e => console.log('Lỗi ' + e))
}, delay)
function getsimi(text) {

    return request({
        url: 'http://api.simsimi.com/request.p',
        qs: {
            key: '3bce68aa-c962-4140-b1b3-c9e599712ab5',
            text,
            lc: 'vn',
            ft: '0.0'
        },
        // resolveWithFullResponse: true
        json: true
    })
        .then(resultRequest => (resultRequest && resultRequest.response) || 'hi')

}
