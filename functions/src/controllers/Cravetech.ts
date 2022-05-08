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
    section:number,
    id:number
}


type RegUser = {
    email:string,
    IMEI:string,
    user_id:string,
}


type Qs = {
    Q:{
        Category: string,
        question: string,
        a1:  string,
        a2:  string,
        a3:  string,
        a4: string,  
        id:number
    }
}



let n = 0;
export const AuthUserSession = functions.https.onRequest(async (req,res) => {
    let data: QuestionObj = req.body;
    let category = data.category;
    let list: any[] = [];
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
                id = 17;
        else if(data.category == "Religion")
                id = 9;

      if(await Isvalid(data)){
            if(data.section == 1){
                    axios.get(process.env.REACT_APP_TABLE1!,{headers:{'X-RapidAPI-Host': process.env.REACT_APP_HOSTS!,'X-RapidAPI-Key': process.env.REACT_APP_API_AUTH!}
                           }).then(responseQ => { 
                                    axios.get(   
                                         id === 17 ?
                                         `https://opentdb.com/api.php?amount=50&category=17`
                                         :
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
                                                     if(category == "Music"){
                                                            n = 0;
                                                            addToList(Pack(response.data.results,2,list),"Music")
                                                            return res.json({ message:  list.length})
                                                     }else  
                                                        if(category == "Vehicles"){
                                                            n = 0; 
                                                            addToList(Pack(response.data.results,2,list), "Vehicles")
                                                            return res.json({message:  list.length})
                                                    }else 
                                                        if(category == "Politics"){
                                                            n = 0;
                                                            addToList(Pack(response.data.results,2,list),"Politics")
                                                            return res.json({message: list.length})
                                                    }else 
                                                          if(category == "History"){
                                                                 n = 0;
                                                                 addToList(Pack(response.data.results,2,list),"History")
                                                                return res.json({message:  list.length})
                                                    }else 
                                                        if(category == "Science"){
                                                            for(let y=0; y < response.data.results.length; y++)
                                                                    list.push(response.data.results[y])
                                                               Q1(res,list);
                                                       }                                                            
                                                        else
                                                           if(category == "General"){
                                                                n = 0;
                                                                for(let y=0; y < responseQ.data.length; y++)
                                                                    Model(responseQ.data[y], response.data.results[getRandom(response.data.results.length)],"General",list,1)
                                                                    addToList(list,"General")
                                                                    return res.json({ message: list.length})
                                                          }else 
                                                             if(category == "Sports"){  
                                                                 n = 0;  
                                                                 for(let y=0; y < response.data.results.length; y++)
                                                                     Model("",response.data.results[y],"Sports",list,2)
                                                                 for(let s= 0; s < responseQ.data.length; s++)
                                                                      if(formatAnd(responseQ.data[s].Category) === "Sports")
                                                                           Model(responseQ.data[s], response.data.results[getRandom(response.data.results.length)],"Sports",list,3)
                                                             addToList(list,"Sports")
                                                             return res.json({message: list.length}) 
                                                          }    
                                                            else
                                                                 if(category == "Religion"){
                                                                    n = 0;
                                                                    for(let y=0; y < responseQ.data.length; y++)
                                                                         Model(responseQ.data[y], response.data.results[getRandom(response.data.results.length)],"Religion",list,3)
                                                                    addToList(list,"Religion")
                                                                    res.json({message: list.length})
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
                            else  {
                                    list.push({error: "Unauthorized Request ! "});
                                    res.json({message: list});
                            }
})





export const AuthUserRequest = functions.https.onRequest(async (req,res) => {

    let data: QuestionObj = req.body;
    let raw_data:Qs [] = [];
    let list:any = [];
    if(await Isvalid(data)){
        let docs = await db.collection("CreavatechQ_"+data.category).doc(data.category).collection("CreavatechQ_"+data.category).where("Q.id","==",data.id).get();
        docs.forEach((doc: any) => raw_data.push(doc.data()));   
            res.json({
                message : raw_data
            })
    }
    else  {
        list.push({error: "Unauthorized Request ! "});
        res.json({message: list});
}
})




async function Isvalid (body: QuestionObj) {
    
    let docs = db.collection(process.env.REACT_APP_USER_TABLE!).doc(body.user_id);
     if((await docs.get()).exists){
        let X = (await docs.get()).data();
        const map  = new Map(Object.entries(X!));
            const data = Object.fromEntries(map);
                if(body.user_id === data.user_id && body.IMEI === data.IMEI && body.email === data.email)
                      return true
                   else
                       return false
     }else
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


function getRandom(length: any):number {
   return Math.floor(Math.random() * length)
}


function Trivia() {
    throw new Error('Function not implemented.');
}



function formatAnd(url:string){
    return url.substring(0,url.indexOf("&")).trim();
 }




function Model(model:any,model2:any,arg1:string,list:any[],i:number) {
  
      if(i === 1){
                QuestionModel(model,model2,list,i);
        }else 
           if(i === 3){
              if(formatAnd(model.Category) === arg1)
                 QuestionModel(model,model2,list,i);
            }else
                 if(i === 2)
                    QuestionModel(model,model2,list,i);    
                 
}



function QuestionModel(model: any, model2: any, list: any[],i:number) {
          n++;
            if(i === 1 || i === 3){
                        const Qs:any = {
                            Q:{
                                Category: model.Category,
                                question: model.Question,
                                a1:  model.Answer,
                                a2:  model2.incorrect_answers[0],
                                a3:  model2.incorrect_answers[1],
                                a4:  model2.incorrect_answers[2],  
                                id:n
                            }
                        }
                        list.push(Qs);
                }
                else  
                    if(i === 2){
                        console.log(model2.incorrect_answers.length)
                        if(model2.incorrect_answers.length === 3){

                                const Qs:any = {
                                        Q:{
                                            Category: model2.category,
                                            question: model2.question,
                                            a1:  model2.correct_answer,
                                            a2:  model2.incorrect_answers[0],
                                            a3:  model2.incorrect_answers[1],
                                            a4:  model2.incorrect_answers[2],  
                                            id:n
                                        }
                                }
                                list.push(Qs);

                            }
                            else {
                                const Qs:any = {
                                    Q:{
                                        Category: model2.category,
                                        question: model2.question,
                                        a1:  model2.correct_answer,
                                        a2:  model2.incorrect_answers[0],
                                        id:n
                                    }
                             }
                             list.push(Qs);
                            }
                       
         }
}







function Pack(results: any, arg1: number, list: any[]):any[] {
    for(let y=0; y < results.length; y++)
           Model("",results[y],"",list,arg1)
    return list;
}



function Q1(resP: functions.Response<any>, list:any[]){
            axios.get(`https://opentdb.com/api.php?amount=50&category=18`)
               .then(res => {
                    for(let i = 0; i <res.data.results.length; i++)
                         list.push(res.data.results[i])
                      Q2(resP,list)
                 }).catch(err => {
                    resP.json({
                        message: err as Error
                   })
                 })
}

function Q2(res: functions.Response<any>,list:any[]){
    axios.get(`https://opentdb.com/api.php?amount=50&category=19`)
        .then(resP => {
            for(let i = 0; i <resP.data.results.length; i++)
                list.push(resP.data.results[i])
            Q3(res,list)
           }).catch(err => {
             res.json({
                message: err as Error
            })
    })
}

function Q3(res: functions.Response<any>, list:any[]) {
    let pack: any[] = []
    axios.get(`https://opentdb.com/api.php?amount=10&category=30`)
               .then(resP => {
                    for(let i = 0; i <resP.data.results.length; i++)
                          list.push(resP.data.results[i])
    
                           for(let y = 0; y < list.length; y++)
                                 {

                                    if(list[y].incorrect_answers.length === 3){
                                        const Qs:any = {
                                                Q:{
                                                    Category: list[y].category,
                                                    question: list[y].question,
                                                    a1:  list[y].correct_answer,
                                                    a2:  list[y].incorrect_answers[0],
                                                    a3:  list[y].incorrect_answers[1],
                                                    a4:  list[y].incorrect_answers[2],  
                                                    id:y+1
                                                }
                                        }
                                        pack.push(Qs);
        
                                    }
                                    else {
                                        const Qs:any = {
                                            Q:{
                                                Category: list[y].category,
                                                question: list[y].question,
                                                a1:  list[y].correct_answer,
                                                a2:  list[y].incorrect_answers[0],
                                                id:y+1
                                            }
                                     }
                                     pack.push(Qs);
                                    }
                                } 
                           addToList(pack,"Science")
                          return res.json({message: pack.length})
                 }).catch(err => {
                    res.json({
                        message: err as Error
                  })
              })
       
}



function addToList(arg0: any[], arg1: string) {
    let table = "CreavatechQ_"+arg1;
    for(let m = 0; m < arg0.length; m++){
        let doc = db.collection(table).doc(arg1).collection(table).doc()
         doc.set(arg0[m]);
    }
}

