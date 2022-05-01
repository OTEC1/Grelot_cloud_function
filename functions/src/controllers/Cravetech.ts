import * as functions from 'firebase-functions'
import {db} from '../config/firebase' 
import axios from "axios";
require('dotenv').config()




type QuestionObj = {
    sessionID :string,
    email:string,
    IMEI:string,
    user_id:string,
    category:string,
    section:number
}


type RegUser = {
    email:string,
    IMEI:string,
    user_id:string,
}




export const AuthUserSession = functions.https.onRequest(async (req,res) => {
    let data: QuestionObj = req.body;
    let category = data.category;
    let id: number;
      if(data.category == "Sports")
            id = 21;
        else if(data.category == "Music")
            id = 12;
        else if(data.category == "General")
                id = 9;
        else if(data.category == "Fashion")
                id = 9;
        else if(data.category == "Politics")
                id = 24;
        else if (data.category == "History")
                id = 23;
        else if(data.category == "Science")
                id = 18;
        else if(data.category == "Religion")
                id = 9;

      if(await Isvalid(data)){
         let list: any[] = [];
            if(data.section == 1){
                    axios.get(process.env.REACT_APP_TABLE1!,{headers:{'X-RapidAPI-Host': process.env.REACT_APP_HOSTS!,'X-RapidAPI-Key': process.env.REACT_APP_API_AUTH!}
                           }).then(responseQ => {  
                                    axios.get(`https://opentdb.com/api.php?amount=50&category=${id}&difficulty=hard&type=multiple`)
                                        .then(response => {
                                                     if(category == "Music")
                                                        return res.json({ message: response.data.results})
                                                       else if(category == "General"){
                                                                    for(let y=0; y < 50; y++){
                                                                        //console.log(response.data.results[y].incorrect_answers[0], responseQ.data[y])
                                                                        const Qs:any = {
                                                                                Q:{
                                                                                    Category: responseQ.data[y].Category,
                                                                                    question: responseQ.data[y].Question,
                                                                                    a1: responseQ.data[y].Answer,
                                                                                    a2: response.data.results[y].incorrect_answers[0],
                                                                                    a3: response.data.results[y].incorrect_answers[1],
                                                                                    a4: response.data.results[y].incorrect_answers[2],  
                                                                                }
                                                                            }
                                                                        list.push(Qs)
                                                                    }
                                                                    return res.json({ message: list})
                                                        }


                                                        }).catch(err => {
                                                         res.json({
                                                            message : err as Error
                                                     })
                                                })
                                            })
                                    } else
                                        Trivia();
                                       }
                                         else  
                                          res.json({
                                                message:"Unauthorized Request ! "
                                            })
})


async function Isvalid (body: QuestionObj) {
    return true;

    // let docs = db.collection(process.env.REACT_APP_USER_TABLE!).doc(body.user_id);
    //  if((await docs.get()).exists){
    //     let X = (await docs.get()).data();
    //     const map  = new Map(Object.entries(X!));
    //         const data = Object.fromEntries(map);
    //             if(body.user_id === data.user_id && body.IMEI === data.IMEI && body.email === data.email)
    //                   return true
    //                else
    //                    return false
    //  }else
    //         return false

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






function Trivia() {
    throw new Error('Function not implemented.');
}

function format(url:string){
   return url.substring(url.indexOf(":")+1,url.length).trim();
}

