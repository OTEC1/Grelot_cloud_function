import * as functions from 'firebase-functions'
import {db, db_sec, admin, sec_admin} from '../config/firebase' 
import axios from "axios";
require('dotenv').config()



type Register = {
    User:{
        IMEI:string, 
        email:string, 
        user_id:string,
        password:any,
        UserCategory:any, 
    },
    User_details:{
        bankSelected:string, 
        NameOnAccount:string, 
        bal:number,
        gas:number,
        bankAccountNo:string
     }
}





type QuestionObj = {
    sessionID :string,
    email:string,
    IMEI:string,
    user_id:string,
    category:string,
    section:number,
    id:number
}

type CheckUseerStat = {
    User:{
        sessionID :string,
        email:string,
        IMEI:string,
        user_id:string,
        category:string,
        section:number,
        id:number
    }
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





export const AuthUserRequestSize = functions.https.onRequest(async (req,res) => {
    let data:CheckUseerStat = req.body
    if(await Isvalid(data)){
            let table = "CreavatechQ_"+data.User.category;
            let doc = db.collection(table).doc(data.User.category).collection(table).listDocuments();
            let size = (await doc).length;
                    res.json({
                        message :size
                    })
            }
             else 
                res.json({message: "Unauthorized Request !"});
         
})



//Check user bal and gas 
export const AuthUserRequest = functions.https.onRequest(async (req,res) => {
    let data: CheckUseerStat = req.body;
    let raw_data:Qs [] = [];
    let list:any = [];
    if(await Isvalid(data.User)){
        let docs = await db.collection("CreavatechQ_"+data.User.category).doc(data.User.category).collection("CreavatechQ_"+data.User.category).where("Q.id","==",data.User.id).get();
        docs.forEach((doc: any) => raw_data.push(doc.data()));   
            res.json({
                message:raw_data
            })
    }
    else  {
        list.push({error: "Unauthorized Request !"});
        res.json({message: list});
    }
})




async function Isvalid (body: any) {
        let docs = db.collection(process.env.REACT_APP_USER_DB!).doc(body.user_id);
             if((await docs.get()).exists){
                     let data:any = CheckForNode((await docs.get()).data())
                             let res = await  sec_admin.getUser(body.user_id)
                                if(res.email){
                                     if(body.user_id === data.User.user_id && body.IMEI === data.User.IMEI && body.email === data.User.email)
                                            return true
                                 }else
                                      return false
                                    
                        }else
                           return false
}



export const Vault = functions.https.onRequest(async (req,res) => {
    let user: RegUser = req.body;
      sec_admin.getUser(user.user_id)
          .then((user) => {
            res.json({message: user.email})
          })
            .catch(err => {
                res.json({message: err})
        })
    
})


export const RegisterNewUser = functions.https.onRequest(async (req,res) => {
    try{
        if(req.headers['user-agent'] === process.env.REACT_APP_MACHINE){
            let user: Register = req.body
                      sec_admin.createUser({
                                    email: user.User.email,  
                                    emailVerified:false,
                                    password:user.User.password,
                                    disabled:false,
                                }).then(async (useRecord) => {
                                    user.User.password = "";
                                    user.User.user_id = useRecord.uid
                                    let doc = db.collection(process.env.REACT_APP_USER_DB!).doc(useRecord.uid);
                                    let doc_sec = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(useRecord.uid);
                                    doc.set(user);
                                    doc_sec.set(user);
                                        if(doc_sec.id && doc.id)
                                          return  res.json({message: "Account created"})
                                        else
                                           return res.json({message: "Account wasn't created ! "})

                                    }).catch((err => {
                                        return  res.json({message: err as Error })
                                }))
                         }
                           else
                               res.json({message: "Unauthorized Request !"})
                }catch(err){
                    res.json({ message: err as Error})
         }
})




export const UserFund = functions.https.onRequest(async (req,res) => {
    try{
         let user:CheckUseerStat = req.body
           if(await Isvalid(user.User)){
                let docs = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.user_id);
                   if((await docs.get()).exists){
                        const data:any = CheckForNode((await docs.get()).data());
                            if(data.User_details.gas > 100)
                                res.json({message: true})
                            else
                                res.json({message: false})
                        }
                        else 
                            res.json({message:"Account not found"})
                       }
                         else
                            res.json({message:"Unauthorized Request !"})
          }catch(err){
            res.json({message: err as Error})
      }
})


//Check user session ID and auth id on call
export const ManageUserAcct = functions.https.onRequest(async (req,res) => {
    try{
      let user: CheckUseerStat  = req.body;
      if(await Isvalid(user.User)){
        if(user.User.id === 1){
            let doc = db.collection(process.env.REACT_APP_USER_DB!).doc(user.User.user_id);
                    let admindoc = db_sec.collection(process.env.REACT_APP_ADMIN_DB!).doc(process.env.REACT_APP_USER_CREDIT!);
                    if((await doc.get()).exists){
                          let doc_sec = db_sec.collection(process.env.REACT_APP_USER_DB!).doc(user.User.user_id);
                            const data:any = CheckForNode((await doc.get()).data());
                            const adata:any = CheckForNode((await admindoc.get()).data());
                            let total = 0;  
                            if(user.User.section === 1) //stil needs more check 
                                  total = await Action(1,adata.credit,data.User_details.bal);
                            else
                                if(user.User.section  === 2 ) //stil needs more check   
                                        total = await Action(2,adata.debit,data.User_details.gas);
                                else
                                    res.json({message:"Insufficient funds"})
   
                                        let userData = {
                                            User:{
                                                    IMEI:data.User.IMEI, 
                                                    email:data.User.email, 
                                                    user_id:data.User.user_id,
                                                    UserCategory:data.User.UserCategory, 
                                                },  
                                            User_details:{
                                                    bank_selected:data.User_details.bank_selected, 
                                                    NameOnAccount:data.User_details.NameOnAccount, 
                                                    bal: user.User.section === 1 ?  total.toString().includes("-") ? parseInt(total.toString().replace("-","")) : parseInt(total.toString()) : data.User_details.bal,
                                                    gas: user.User.section === 2 ?  total.toString().includes("-") ? parseInt(total.toString().replace("-","")) : parseInt(total.toString()) : data.User_details.gas,
                                                    bankAccount_No:data.User_details.bankAccount_No
                                                }
                                            }
                                                doc_sec.update(userData);
                                                res.json({message: "Account balance updated"})
                                }else 
                                    res.json({message: "Account not found"})
              }else
                 Group_action(user.User,1,res);
        }else
           res.json({message: "Unauthorized Request !"})
                }catch(err){
                res.json({
                message: err as Error
            })
      }
})








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
      if(i === 1)
            QuestionModel(model,model2,list,i);
        else 
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
                                answers: Group(model.Answer+"r",model2.incorrect_answers[0],model2.incorrect_answers[1],model2.incorrect_answers[2],1), 
                                id:n
                            }
                        }
                        list.push(Qs);
                }
                else  
                    if(i === 2){
                        if(model2.incorrect_answers.length === 3){

                                const Qs:any = {
                                        Q:{
                                            Category: model2.category,
                                            question: model2.question,  
                                            answers: Group(model2.correct_answer+"r",model2.incorrect_answers[0],model2.incorrect_answers[1], model2.incorrect_answers[2],1),
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
                                        answers: Group(model2.correct_answer+"r",model2.incorrect_answers[0],"","",2),
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

function Group (a1:any,a2:any,a3:any,a4:any,i:number){
    let answer = [];
    if(i === 1){
        answer.push(a1);
        answer.push(a2);
        answer.push(a3);
        answer.push(a4);
     }else{
        answer.push(a1);
        answer.push(a2);
     }
    return answer;
}
function Q3(res: functions.Response<any>, list:any[]) {
    let pack: any[] = []
    
    axios.get(`https://opentdb.com/api.php?amount=10&category=30`)
               .then(resP => {
                    for(let i = 0; i <resP.data.results.length; i++)
                          list.push(resP.data.results[i]);
    
                           for(let y = 0; y < list.length; y++)
                                 {

                                    if(list[y].incorrect_answers.length === 3){
                                        const Qs:any = {
                                                Q:{
                                                    Category: list[y].category,
                                                    question: list[y].question,
                                                    answers: Group(list[y].correct_answer+"r",list[y].incorrect_answers[0],list[y].incorrect_answers[1],list[y].incorrect_answers[2],1),
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
                                                answers: Group(list[y].correct_answer+"r",list[y].incorrect_answers[0],"","",2),
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
        let doc = db.collection(table).doc(arg1).collection(table).doc();
         doc.set(arg0[m]);
    }
}





function CheckForNode(X:any) {
    const map  = new Map(Object.entries(X));
    const data = Object.fromEntries(map);
    return data;
}




async function Action(id:any,acct:any,bal:any):Promise<number> {
    let amount = 0;
    if(id === 1)
       amount = acct  + bal;
      else
          amount = acct - bal;
    return amount;
   
} 




function Group_action(User: { sessionID: string; email: string; IMEI: string; user_id: string; category: string; section: number; id: number; }, arg1: number, res: functions.Response<any>) {
   
    res.json({message: "OK"})
}

