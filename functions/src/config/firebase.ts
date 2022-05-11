import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
require('dotenv').config()

const secondary = ({
    credential: admin.credential.cert({
        privateKey: process.env.REACT_APP_PRKEY!.replace(/\\n/g, '\n'),
        projectId: process.env.REACT_APP_PROD_ID,
        clientEmail: process.env.REACT_APP_CLIENT_EMAIL
    }),
    databaseURL: process.env.REACT_APP_DB_SEC
});


admin.initializeApp({
    credential: admin.credential.cert({
        privateKey: functions.config().private.key.replace(/\\n/g, '\n'),
        projectId: functions.config().project.id,
        clientEmail: functions.config().client.email
    }),
     databaseURL: process.env.REACT_APP_DB
});

const sec = admin.initializeApp(secondary,'secondary');


const db = admin.firestore();
const db_sec = admin.firestore(sec);
db.settings( { timestampsInSnapshots: true })
db_sec.settings( { timestampsInSnapshots: true })
export { admin , db, db_sec};

