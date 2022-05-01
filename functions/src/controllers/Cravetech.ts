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
        else if(data.category == "Vehicles")
                id = 28;
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
                                    axios.get(
                                         id === 24 ? 
                                            `https://opentdb.com/api.php?amount=50&category=24` 
                                         :
                                         id === 23 ?
                                            `https://opentdb.com/api.php?amount=50&category=23`
                                        : 
                                         id === 28 ?
                                            `https://opentdb.com/api.php?amount=50&category=28`
                                        : 
                                         id === 21 ? 
                                            `https://opentdb.com/api.php?amount=50&category=21&type=multiple` 
                                        :
                                           `https://opentdb.com/api.php?amount=50&category=${id}&difficulty=hard&type=multiple`

                                        )
                                        .then(response => {
                                                     if(category == "Music")
                                                            return res.json({ message:  Pack(response.data.results,2,list)})
                                                    else  
                                                        if(category == "Vehicles")
                                                                return res.json({message:  Pack(response.data.results,2,list)})
                                                    else 
                                                        if(category == "Politics")
                                                                return res.json({message:  Pack(response.data.results,2,list)})
                                                    else 
                                                          if(category == "History")
                                                                  return res.json({message:  Pack(response.data.results,2,list)})
                                                    else 
                                                        if(category == "Science"){
                                                            for(let y=0; y < response.data.results.length; y++)
                                                                console.log(list.length)
                                                                return res.json({message: list})
                                                            }
                                                        else
                                                           if(category == "General"){
                                                                for(let y=0; y < responseQ.data.length; y++)
                                                                    Model(responseQ.data[y], response.data.results[getRandom(response.data.results.length)],"General",list,1)
                                                                    return res.json({ message: list})
                                                          }else 
                                                             if(category == "Sports"){   
                                                                 for(let y=0; y < response.data.results.length; y++)
                                                                    Model(responseQ.data,response.data.results[y],"Sports",list,2)
                                                                    console.log(list.length)
                                                                    return res.json({message: list})             
                                                        } 

                                                        }).catch(err => {
                                                            res.json({
                                                                message : err as Error
                                                           })
                                                      })
                                                })
                }
                else 
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


function getRandom(length: any):number {
   return Math.floor(Math.random() * length)
}


function Trivia() {
    throw new Error('Function not implemented.');
}

function format(url:string){
   return url.substring(url.indexOf(":")+1,url.length).trim();
}


function Model(model:any,model2:any,arg1:string,list:any[],i:number) {
      if(i === 1){
         if(format(model.Category) === arg1)
                QuestionModel(model,model2,list,i);
       }else 
            if(i === 2)
              QuestionModel(model,model2,list,i);    
}



function QuestionModel(model: any, model2: any, list: any[],i:number) {
    if(i === 1){
            const Qs:any = {
                Q:{
                    Category: model.Category,
                    question: model.Question,
                    a1:  model.Answer,
                    a2:  model2.incorrect_answers[0],
                    a3:  model2.incorrect_answers[1],
                    a4:  model2.incorrect_answers[2],  
                }
            }
            list.push(Qs);
    }
    else  
        if(i === 2){
            const Qs:any = {
                    Q:{
                        Category: model2.category,
                        question: model2.question,
                        a1:  model2.correct_answer,
                        a2:  model2.incorrect_answers[0],
                        a3:  model2.incorrect_answers[1],
                        a4:  model2.incorrect_answers[2],  
                    }
               }
            list.push(Qs);
        }
}




function Pack(results: any, arg1: number, list: any[]):any[] {
    for(let y=0; y < results.length; y++)
    Model("",results[y],"",list,arg1)
    console.log(list.length)
    return list;
}

