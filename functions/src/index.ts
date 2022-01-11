import * as functions from "firebase-functions";
import * as corsModule from 'cors';
import * as encrpty from 'crypto-js';
import * as bycrypt from 'bcryptjs'
import { db } from "./config/firebase";
import { firestore } from "firebase-admin";
import * as cloudinary from 'cloudinary';
require("dotenv").config();
const cors = corsModule(({ origin: true }))
var Pushy = require('pushy');






type BaseUrl ={
    url:string,
    publicface:string,
}

//Image Resizer
export const ImgResize = functions.https.onRequest((request, respones)=>{

    cors(request,respones,()=>{
        
        let  e: BaseUrl = request.body;

        console.log(e.publicface, e.url);

        cloudinary.v2.config({
            cloud_name:process.env.REACT_APP_CLOUNDINARY_NAME,
            api_key:process.env.REACT_APP_CLOUDINARY_KEY,
            api_secret:process.env.REACT_APP_CLOUNDINARY_SECRET
        })

        cloudinary.v2.uploader.upload(e.url,
            {public_id:e.publicface},
            function(err,result){
                    console.log(err);

                    return respones.json({
                        message: result?.created_at
                    })
                 
                });

      

       

    });

});



//grelot function start
type member = {
    data:string,
}



type Payload ={
    User:{
        to:string
    }
    payload:{
        id: string,
        email:string,
        item:string,
        pic:string,
    },
     options: {
        notification: {
            badge: number,
            sound: string,
            id: string,
            email:string,
            item:string,
            pic:string,
            body:string,
        },
    };
}


type GetDatas = {
    Client: {
        doc_id:string,
        email:string,
    },
    ClientAction: {
        thumb: number,
        image: string,
    }
}



export const Grelot_lock = functions.https.onRequest(async (request,respones) => {

    cors(request,respones, async () => {
        
        let intake =  {"p1":process.env.REACT_APP_P1, "p2":process.env.REACT_APP_P2, "p3":process.env.REACT_APP_P4}

        return respones.json({
            message: intake
        })
    })
})


export  const records = functions.https.onRequest(async (request, response) => {

    cors(request,response, async () => {
       
            let e:member = request.body;
             const citiesRef =  db.collection('Vendor Posts').doc(e.data);
             const service =  (await citiesRef.get()).data();

            return response.json({
                message: service
            })
         })
})




export  const thumbs = functions.https.onRequest(async (request, response) => {

    cors(request,response, async () => {
       
            let e:GetDatas = request.body;
            const data =  db.collection('Vendor Posts').doc(e.Client.doc_id).collection("Vendor Rating").doc(e.Client.doc_id); 
             if(!(await data.get()).exists)
                 data.set(e);
            else
                data.update("ClientAction.thumb", firestore.FieldValue.increment(e.ClientAction.thumb))

             return  response.json({
                message: e.ClientAction.thumb
            })
         })
})




export const listofproducts = functions.https.onRequest(async (request, response) => {
    cors(request,response, async () => {
        let list = ['Ad Category','Damax', 'Canvas material', 'Cutain for shirt', 'Cutain for House', 'Bridal satin', 
                    'Douches', 'for material', 'Zucuba', 'Lycrea', 'Vevelt', 'Crepe','Chiffon',' stretching  Slik', 'Stretching tafeta'];
                     
        return response.json({
            message:list
        })
    })
})




export const listofUserAgeGrade = functions.https.onRequest(async (request, response) => {
    cors(request,response, async () => {

        let list = ['Target audience','All', 'male',  'female','Both male and female', 'Elderly female','Elderly male','Both Elderly male and female','male kids','female kid','Both kids male and female'];

        return response.json({
            message:list
        })
    })
})



var PUSHYAPI = new Pushy(process.env.PUSHY_GRELOT_KEY);

export const Notificationpush = functions.https.onRequest(async (request, response) => {
    cors(request, response, async () => {
     let e:Payload = request.body   
     PUSHYAPI.sendPushNotification(e.payload, e.User.to, e.options,function (err: any, id:any){
     if(err){
        return response.json({
            message: "Error Occurred "+err
        })
     }
     return response.json({
        message: "Sent  Succesfully  to "+id
        })
      })
    })
})





export  const  pushyapi = functions.https.onRequest(async (request, respones) => {
    cors(request,respones, async () =>{
       let e: member = request.body;
       let res;
       if(e.data  === "1")
           res = process.env.PUSHY_GRELOT_KEY;
        return respones.json({
            message: res
        })
    })
})
//grelot function End












//Start of Webdealit functions

type RegisterUser = {

    User:{
        email:string,
        password:string,
        doc_id:string
    }
}


type RequestBody = {

    User:{
        username: string,
        user_img: string,
        useremail:string,
    },
    UserPost:{
    image: string,
    video: string,
    title: string,
    writeup: string,
    doc_id_a:string,
    doc_id_b: string,
    youtubeLink: string,
    timestamp: number,
    date_time:string,
    cloudinaryPub: string,
    orientations:string,
    exifData:number,
    views: number,
    likes:number,
    approved: boolean,
    }
}


export const  webdealitAddPost = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       

        
         try{
            let e: RequestBody = req.body;
            let a = db.collection("WebdealitPostAd").doc();
            let b = db.collection("WebdealitPostAd").doc("1A").collection(e.User.useremail).doc();
            e.UserPost.doc_id_a = a.id;
            e.UserPost.doc_id_b = b.id;
            a.set(e);
            b.set(e);
           
               return res.json({
                   message: "Ok 200"
               })

             }
        catch (err) { 
            return res.json({
                message: err as Error
            })
        }
   
    })
})





export const  webdealitGetAllPost = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
      
        try{
          const raw_data: RequestBody[] = [];
          let data = await db.collection("WebdealitPostAd").get();
          data.forEach((doc: any) => raw_data.push(doc.data()))   
        
          return res.json({
            message: raw_data
        })

         }
          catch (err) { 
            return res.json({
                message: err as Error
            })
        }
        
    })
})






export const  webdealitGetSignlePost = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
        try{
        let e: RequestBody = req.body;   
        let data = db.collection("WebdealitPostAd").doc("1A").collection(e.User.useremail).doc(e.UserPost.doc_id_b);
        const service =   (await data.get()).data();

        return res.json({
            message: service
        })
        }
        catch (err) { 

            return res.json({
                message: err as Error
            })
        }
      
    })
})





export const  webdealit_thumbsUp_and_views = functions.https.onRequest( async (request, respones) => {

cors(request,respones, async () => {
    let a : RequestBody = request.body

    try{

        if(a.UserPost.likes !== 0){
            db.collection("WebdealitPostAd").doc(a.UserPost.doc_id_a)
            .update("UserPost.likes", firestore.FieldValue.increment(a.UserPost.likes));
                db.collection("WebdealitPostAd").doc("1A").collection(a.User.useremail)
                .doc(a.UserPost.doc_id_b).update("UserPost.likes",firestore.FieldValue.increment(a.UserPost.likes));
            }else{
                db.collection("WebdealitPostAd").doc(a.UserPost.doc_id_a)
                .update("UserPost.views",firestore.FieldValue.increment(a.UserPost.views));
                    db.collection("WebdealitPostAd").doc("1A").collection(a.User.useremail)
                    .doc(a.UserPost.doc_id_b).update("UserPost.views",firestore.FieldValue.increment(a.UserPost.views));

            }


        return respones.json({
            message: "Ok"
        })

            }catch(err){

                return respones.json({
                    message: err as Error
                })
            }   
         

       

    })
})


export const  webdealit_RegisterUser = functions.https.onRequest(async (request,respones) => {
    cors(request,respones, async () => {

        try{

         let confirm;
         let e : RegisterUser = request.body
         let data = db.collection("WebdealitRegisterUser").doc(e.User.email);
         e.User.doc_id = data.id;

         if(!(await data.get()).exists){
             data.set(e);
             confirm = "New User account Registerd" 
         }
          else
             confirm = "This email Already has an account with Us"


         return  respones.json({
             message: confirm
         })
         
        }catch(err) {

            return  respones.json({
                message: err as Error
            })
        }

    })
})






export const  webdealitSignInUser = functions.https.onRequest(async (request,respones) => {
    cors(request,respones, async () => {
      
        try{   
            let e : RegisterUser = request.body
            var bytes  = encrpty.AES.decrypt(e.User.password, process.env.REACT_APP_KEYS!);
            var text = bytes.toString(encrpty.enc.Utf8);

             let data = db.collection("WebdealitRegisterUser").doc(e.User.email);

             if((await data.get()).exists){
                    const Userservice =   (await data.get()).data();

                    e.User.doc_id = Userservice?.User.doc_id;
                    e.User.email = Userservice?.User.email;
                    e.User.password = "";

                    if(await bycrypt.compare(text, Userservice?.User.password))
                        return respones.json({
                            message: e
                        })  
                    else
                        return respones.json({
                            message: "Email or password combination not correct !"
                        }) 
                    
            }else
                    return respones.json({
                        message: "Account not found !"
                    }) 

            }catch(err) {
    
                return  respones.json({
                    message: err as Error
                })
            }

         })

});




export const webdealit_Movie_categories = functions.https.onRequest(async (request,respones) => {

    cors(request,respones, async () =>{
        const list = ['Select Categories', 'Romantic', 'Action', 'Horror', 'Telenovelas','funny', "MCU's",'Comic',"Nigerian","Ghanain","foreign"];
        return respones.json({
            message: list
        })
    })
})










export const webdealit_lock = functions.https.onRequest(async (request,respones) => {

    cors(request,respones, async () => {
        
        let intake =  {"p1":process.env.REACT_APP_P1, "p2":process.env.REACT_APP_P2, "p3":process.env.REACT_APP_P3}

        return respones.json({
            message: intake
        })
    })
})






type  MovieBody = {
    Mtitle:string,
    year:number,
    categories:string,
    writeUp:string, 
    fileName:string,
    likes:number,
    thumbnail_orentation:number,
    spin:number,
    doc_id:string,
}



export const  webdealitAddMovie= functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
         try{
            let e: MovieBody = req.body;
            let a = db.collection("WebdealitMovies").doc();
             e.doc_id = a.id;
             a.set(e);

               return res.json({
                   message: "Movie Added "
               })

             }
        catch (err) { 
            return res.json({
                message: err as Error
            })
        }
   
    })
})







export const  webdealitGetMovie= functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
         try{
       
            const raw_data: MovieBody[] = [];
            let data = await db.collection("WebdealitMovies").get();
            data.forEach((doc: any) => raw_data.push(doc.data()))  

               return res.json({
                   message: raw_data
               })

             }
        catch (err) { 
            return res.json({
                message: err as Error
            })
        }
   
    })
})




type MusicBody = {
    User:{
        name:string,
        email:string
        doc_id:string,
    }
    AdminMusic:{
        title:string,
        remarks:string,
        
    }
    UserMusic:{
        title:string,
        remarks:string,
    }
 }

export const  webdealitAddMusic = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
         try{
            let e: MusicBody = req.body;
            let a = db.collection("WebdealitMusic").doc();
             e.User.doc_id = a.id;
             a.set(e);

               return res.json({
                   message: "Music Added "
               })

             }
        catch (err) { 
            return res.json({
                message: err as Error
            })
        }
   
    })
})



export const  webdealitGetMusic= functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
         try{
       
            const raw_data: MusicBody[] = [];
            let data = await db.collection("WebdealitMusic").get();
            data.forEach((doc: any) => raw_data.push(doc.data()))  

               return res.json({
                   message: raw_data
               })

             }
        catch (err) { 
            return res.json({
                message: err as Error
            })
        }
   
    })
})

//End of Webdealit functions