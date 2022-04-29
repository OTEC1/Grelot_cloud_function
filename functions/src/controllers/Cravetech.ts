import axios from 'axios'
import * as functions from 'firebase-functions'
import {db} from '../config/firebase' 



type QuestionObj = {
    sessionID :string,
    email:string,
    IMEI:string
    user_id:string,
    category:string
}


type RegUser = {
    email:string,
    IMEI:string
    user_id:string,
}




export const AuthUserSession = functions.https.onRequest(async (req,res) => {
    let data: QuestionObj = req.body;
    if(await Isvalid(data)){
        let option:any = {

        }

        // const request = await axios.options(option)

         let list = [];
            list.push(data.category);
                res.json({
                        message: list
                })

         }else
            res.json({
                message:"Authorized Request"
            })
})


async function Isvalid (body:QuestionObj) {

    let docs = db.collection(process.env.REACT_APP_USER_TABLE!).doc(body.user_id);
     let X = (await docs.get()).data();
       const map  = new Map(Object.entries(X!));
        const data = Object.fromEntries(map);
            if(body.user_id === data.user_id && body.IMEI === data.IMEI && body.email === data.email)
               return true
            else
               return false

}


export const RegisterNewUser = functions.https.onRequest(async (req,res) => {
    try{
      let user: RegUser = req.body
      let doc = db.collection(process.env.REACT_APP_USER_TABLE!).doc(user.user_id);
      doc.set(user);
      if(doc.id)
         res.json({
            message: "Account created"
         })
        }catch(err){
            res.json({
              message: err as Error
        })
    }
})