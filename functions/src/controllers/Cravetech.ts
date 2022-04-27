import axios from 'axios'
import * as functions from 'firebase-functions'
import {db} from '../config/firebase' 



type QuestionObj = {
    sessionID :string,
    email:string,
    imel_no:string
}





export const AuthUserSession = functions.https.onRequest(async (req,res) => {
    let data = req.body;
    if(Isvalid(data)){
        let option:any = {

        }
        const request = await axios.options(option)
    }  

})


function Isvalid (body:any){
            db.collection("")
    return true
}


export const RegisterNewUser = functions.https.onRequest(async (req,res) => {

    try{
      let doc =   db.collection(process.env.REACT_APP_USER_TABLE!).doc();
      doc.set(req.body);
    
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