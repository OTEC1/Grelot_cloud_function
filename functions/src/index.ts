import * as functions from "firebase-functions";
import * as encrpty from 'crypto-js';
import * as bycrypt from 'bcryptjs'
import { admin, db } from "./config/firebase";
import { firestore } from "firebase-admin";
import * as cloudinary from 'cloudinary';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import * as corsModule from 'cors';
require("dotenv").config();
const cors = corsModule(({ origin: true }))
var Pushy = require('pushy');

 




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




type  Newuser = {

    User:{
        Usertoken:string,
        businessaddress:string,
        businessname:string,
        devicetokeen:string,
        email:string,
        img_url:string,
        usertype:string,
        whatappnumber:string,
        password:string,
        doc_id:string,
    }
}



export const Grelot_lock = functions.https.onRequest(async (request,response) => {
        try{
           let intake =  {"p1":process.env.REACT_APP_P1, "p2":process.env.REACT_APP_P2, "p3":process.env.REACT_APP_P4}
               response.status(200).send(intake);
        }catch (err) {
              response.status(400).send(`Error Occurred ${err as Error}`)
        }
})


export  const records = functions.https.onRequest(async (request, response) => {

    cors(request,response, async () => {
       
            let e:member = request.body;
             const citiesRef =  db.collection(process.env.REACT_APP_VENDORPOST!).doc(e.data);
             const service =  (await citiesRef.get()).data();

            return response.json({
                message: service
            })
         })
})




export  const thumbs = functions.https.onRequest(async (request, response) => {

    cors(request,response, async () => {
       
            let e:GetDatas = request.body;
            const data =  db.collection(process.env.REACT_APP_VENDORPOST!).doc(e.Client.doc_id).collection(process.env.REACT_APP_REACTION!).doc(e.Client.doc_id); 
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
                    'Douches', 'Tick fringe material', 'Zucuba', 'Lycra', 'Vevelt', 'Crepe','Chiffon',' Stretching  Slik', 'Stretching tafeta'];
                     
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




export const Sign_up_new_user = functions.https.onRequest(async(req,res) => {

    cors(req,res, async() => {
        try{

            let user: Newuser = req.body

            admin.auth()
                  .createUser({

                    
                                email: user.User.email,  
                                emailVerified:false,
                                phoneNumber:user.User.whatappnumber,
                                password:user.User.password,
                                displayName: user.User.businessname,
                                disabled:false,

                               }).then(async (useRecord) => {

                                user.User.Usertoken = useRecord.uid!;
                              
                                let docs = db.collection(process.env.REACT_APP_REGISTER_NEW_USER_TABLE!)
                                            .doc(user.User.usertype)
                                              .collection(process.env.REACT_APP_REGISTER_NEW_USER_TABLE!).doc();

                                user.User.doc_id = docs.id;
                                user.User.password = await bycrypt.hash(user.User.password, 12)
                                docs.set(user);

                                return  res.json({
                                    message: user.User.Usertoken ? "Account created " : "Error creating user !"            
                            })
                         })
                            .catch(err => {

                                return  res.json({
                                    message: err as Error           
                            })
                            })
                    
          }catch(err){

            return res.json({
                message: err as Error
            })
         }
    })
})






export const Paid_cart_uploaded = functions.https.onRequest(async(req,res) => {

    cors(req,res, async () => {

    })
})
//grelot function End

















//Start of Webdealit functions
type VisitCount = {
    count:number,
    date:any,
    doc_id:string,
    stamp:any,
}

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
    timestamp: any,
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
            let a = db.collection(process.env.REACT_APP_POST_SECTION!).doc();
            let b = db.collection(process.env.REACT_APP_POST_SECTION!).doc("1A").collection(e.User.useremail).doc();
            e.UserPost.doc_id_a = a.id;
            e.UserPost.doc_id_b = b.id;
            e.UserPost.timestamp = firestore.Timestamp.now()
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
          let data = await db.collection(process.env.REACT_APP_POST_SECTION!).orderBy("UserPost.timestamp","desc").limit(100).get();
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







export const  webdealitGetPostbylink = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
      
        try{
          const m :RequestBody = req.body;
          let raw_data =  db.collection(process.env.REACT_APP_POST_SECTION!).doc("1A").collection(m.User.useremail).doc(m.UserPost.doc_id_b);
          return res.json({
            message: (await raw_data.get()).data()
        })

         }
          catch (err) { 
            return res.json({
                message: err as Error
            })
        }
        
    })
})




export const  webdealitGetAllPostByViews = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
      
        try{
          const raw_data: RequestBody[] = [];
          let data = await db.collection(process.env.REACT_APP_POST_SECTION!).orderBy("UserPost.views","desc").limit(100).get();
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





export const  webdealitGetAllPostByOrientation = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
      
        try{
          const e : RequestBody = req.body;
          const raw_data: RequestBody[] = [];
          let data = await db.collection(process.env.REACT_APP_POST_SECTION!).where("UserPost.orientations","==",e.UserPost.orientations).limit(100).get();
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








export const  webdealitPostByTitle = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
      
        try{
          const e : RequestBody = req.body;
          const raw_data: RequestBody[] = [];
          let title = e.UserPost.title.split('+').join(" ");
          let data = await db.collection(process.env.REACT_APP_POST_SECTION!).where("UserPost.title","==",title).limit(100).get();
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






export const  webdealitGetSignleUserPost = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
        try{
        let e : RequestBody = req.body;
        let raw_data: RequestBody  [] = [];   
        let data = await db.collection(process.env.REACT_APP_POST_SECTION!).doc("1A").collection(e.User.useremail).get();
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





export const  webdealit_thumbsUp_and_views = functions.https.onRequest( async (request, respones) => {

cors(request,respones, async () => {

    let a : RequestBody = request.body
         try{
                if(a.UserPost.likes !== 0)
                    REPEAT_ACTION(a.UserPost.likes,"UserPost.likes")
                else         
                    REPEAT_ACTION(a.UserPost.views,"UserPost.views")
                
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




function REPEAT_ACTION(a:any,table:string) {
    db.collection(process.env.REACT_APP_POST_SECTION!).doc(a.UserPost.doc_id_a)
    .update(table, firestore.FieldValue.increment(a));
        db.collection(process.env.REACT_APP_POST_SECTION!).doc("1A").collection(a.User.useremail)
        .doc(a.UserPost.doc_id_b).update(table,firestore.FieldValue.increment(a));
}



export const  webdealit_RegisterUser = functions.https.onRequest(async (request,respones) => {
    cors(request,respones, async () => {

        try{

         let confirm;
         let e : RegisterUser = request.body
         let data = db.collection(process.env.REACT_APP_NEW_MEMBERS!).doc(e.User.email);
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

             let data = db.collection(process.env.REACT_APP_NEW_MEMBERS!).doc(e.User.email);

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
    timestamp:any,
    downloadcount:number,
}



export const  webdealitAddMovie= functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
         try{
            let e: MovieBody = req.body;
            let a = db.collection(process.env.REACT_APP_SCREEN!).doc();
             e.doc_id = a.id;
             e.timestamp = firestore.Timestamp.now();
             a.set(e);

               return res.json({
                   message: "Movie Added"
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
            let data = await db.collection(process.env.REACT_APP_SCREEN!).orderBy("timestamp","desc").limit(50).get();
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





export const  webdealitGetMovieBydownloadCount = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
         try{
       
            const raw_data: MovieBody[] = [];
            let data = await db.collection(process.env.REACT_APP_SCREEN!).orderBy("downloadcount","desc").limit(50).get();
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



export const  webdealitGetMovieByName = functions.https.onRequest(async (req,res) => {
  
    cors(req,res, async () => {
       
         try{
            const raw_data: MovieBody[] = [];
            let e : MovieBody = req.body;
            let data = await db.collection(process.env.REACT_APP_SOUND!).where("Music.music_title", "==", e.Mtitle).limit(100).get();
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




export const  webdealitGetMovieUpdatedownloadCount = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
         try{
            let errand ="Not Found !";
            let e: MovieBody = req.body;
            const r = db.collection(process.env.REACT_APP_SCREEN!).doc(e.doc_id);

             if((await r.get()).exists){
                  r.update("downloadcount",firestore.FieldValue.increment(1));
                  errand = "Updated"
             }
               
               return res.json({
                   message: errand
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

  Music:{
        name:string,
        email:string,
        doc_id:string,
        music_thumbnail:string
        music_video:string,
        music_title:string,
        music_url:string,
        music_artist:string,
        music_year:string,
        downloadCount:number,
        viewCount:number,
        userType:string,
        flag:boolean,
        timestamp:any,
        genre:string,
        list:any,
        
    }
 
 }






 
export const  webdealitAddMusic = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
         try{
             let e: MusicBody = req.body;
             let a = db.collection(process.env.REACT_APP_SOUND!).doc();
             e.Music.doc_id = a.id;
             e.Music.timestamp = firestore.Timestamp.now();
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
            let data = await db.collection(process.env.REACT_APP_SOUND!).orderBy("Music.timestamp","desc").limit(120).get();
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




export const  webdealitGetMusicByArtiseSort = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
         try{
            const raw_data: MusicBody[] = [];
            let e1 = req.query.query1;
            let e2 = req.query.query2;
            let e3 = req.query.query3;
            let e4 = req.query.query4;
            let list = [e1,e2,e3,e4];
            console.log(list);
            let data = await db.collection(process.env.REACT_APP_SOUND!).where("Music.genre", "in", list).limit(100).get();
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



export const  webdealitGetMusicByArtiseName = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
         try{
            const raw_data: MusicBody[] = [];
            let e : MusicBody = req.body;
            let data = await db.collection(process.env.REACT_APP_SOUND!).where("Music.music_artist", "==", e.Music.music_artist).limit(100).get();
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






export const  webdealitGetMusicByMusictitle = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
         try{
            const raw_data: MusicBody[] = [];
            let e : MusicBody = req.body;
            let data = await db.collection(process.env.REACT_APP_SOUND!).where("Music.music_title", "==", e.Music.music_title).limit(50).get();
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





export const  webdealitGetMusicByLink = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
         try{
            const raw_data: MusicBody[] = [];
            let e : MusicBody = req.body;

            let data = await db.collection(process.env.REACT_APP_SOUND!).where("Music.doc_id", "==", e.Music.doc_id).get();
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







export const Webdealit_Genre = functions.https.onRequest(async (request, respones)=> {

    cors(request, respones, async () => {
        const list = ['Select Music Genre','Hip-Hop Rap','Dancehall','Hip Hop', 'AfroPop', 'Jazz',"Pop", 'Gospel','Electronic','Rock','RnB','Instrumental',"Soul","Tropical","Culture", "Dj mix tape"]
        return respones.json({
            message: list
        })
    })
})





function stamp(){
    var dt = new Date(firestore.Timestamp.now().toDate().toUTCString()).toString()
    var sub = dt.substring(0,dt.indexOf(":")-2).trimEnd();
    return sub;

}



export const  webdealitVisitCount = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
         try{
             let e: VisitCount = req.body;
             let time = db.collection(process.env.REACT_APP_TRACK!).listDocuments();
             const day =  db.collection(process.env.REACT_APP_TRACK!).doc();
             e.date = stamp();
             e.stamp = firestore.Timestamp.now();
             if((await time).length <= 0){
                  e.doc_id = day.id;
                  day.set(e);
             }else{
                  let current = await  db.collection(process.env.REACT_APP_TRACK!).orderBy("stamp","desc").limit(1).get();  
                  current.forEach((doc: any) => e = (doc.data()))  
                    if(stamp() === e.date)
                           db.collection(process.env.REACT_APP_TRACK!).doc(e.doc_id).update("count",firestore.FieldValue.increment(1))
                     else{
                        let e: VisitCount = req.body;
                        e.date = stamp();
                        e.stamp = firestore.Timestamp.now();
                        e.doc_id = day.id;
                        day.set(e);
                       }
                }

               return res.json({
                   message:"OK"
               })

             }
        catch (err) { 
            return res.json({
                message: err as Error
            })
        }
   
    })
})




export const webdealitVisitGetCount  =  functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
    try{
        let e: VisitCount  [] = [];
        let current = await  db.collection(process.env.REACT_APP_TRACK!).orderBy("stamp","desc").limit(500).get();  
        current.forEach((doc: any) => e.push(doc.data()));  

        return  res.json({
            message: e
        })
       }catch(err){
        return  res.json({
                message: err as Error
            })
        }
    });
});




export const webdealitHomePageTopList  =  functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
        
        let list = ["Bitcoin rate", "NFT trends", "Gift card","Ethereum","DeFi trends","Coinbase"]

        return res.json({
            message: list
        })

    })
})




export const webdealitRidirectUrl = functions.https.onRequest(async (req,res) => {
    cors(req,res,async () => {
        console.log(req.query.key)
    })
})





export const dynamicpostRender = functions.https.onRequest(async (req,res) => {
    cors(req,res,async () => {
        
       let i = req.query.i!;
       let t = req.query.t!;
       let a = req.query.a!;
       let d = req.query.d!;
       let s = req.query.s!
       let m = req.query.m!;
       let blog = "WEBFLY BLOG";

 
    const ua = req.headers['user-agent'];
    console.log(ua, "LOG");


    if( ua === "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"){
            res.status(200).send(`<!doctype html xmlns="http://www.w3.org/1999/xhtml"
                                            xmlns:og="http://ogp.me/ns#"
                                            xmlns:fb="https://www.facebook.com/2008/fbml">
                                            <head>
                                            <title>${blog} </title>
                                            <meta property="og:url"           content="https:webfly.click"/>
                                            <meta property="og:type"          content="website" />
                                            <meta property="twitter:title" content=${t}/>
                                            <meta property="og:title"         content=${t} />
                                            <meta property="og:description"   content=${a} />
                                            <meta property="og:image"         content=${i} />
                                            <meta property="og:image:type"    content="image/jpeg"/>
                                            <meta property="og:image:width:   content="100%"/>
                                            <meta property="og:image:height:  content="200"/>
                                            <link rel="icon" href="https://example.com/favicon.png">
                                            </head>
                                            <img src="${i}"/>
                                            <h3>${t}</h3>
                                            <h4>${a}</h4>
                                            <h5>${i}</h5>
                                            </html>`);
     } else
            res.redirect(redireactUrlWebdeal(d,s,a,m,t.toString().toLowerCase()))  
            });
})




 



function redireactUrlWebdeal(d:any, s:any, a:any, m:any, t:any){
    let url:any;
    let frame,useremail,views,doc_id_b,caller;

    if(s === "m")
        url = "https://webfly.click/Musicsearch?M="+t
    else
        if(s === "p"){
            frame = a;
            useremail = m;
            views=0;
            doc_id_b=d
            caller = "p"
            url="https://webfly.click/Explorecontent/"+frame+"/"+useremail+"/"+views+"/"+caller+"/"+doc_id_b
        }
    return url
}


//End of Webdealit functions







export const Noman_id_genrator = functions.https.onRequest(async (request, respones)=> {

    cors(request, respones, async () => {
        respones.json({
            message: uuid()
        })
    })

})









type BaseUrl = {
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








type VideoConstrants = {
     url: any,
     thumbnail:string
}





const bucket = new AWS.S3({
    accessKeyId: process.env.REACT_APP_P1,
    secretAccessKey: process.env.REACT_APP_P2,
    apiVersion: process.env.REACT_APP_API_VERSION,
    httpOptions: {timeout: 0}
});








export const DeletePost = functions.https.onRequest(async (request,response) => {
    cors(request,response,async() => {

            let e: VideoConstrants = request.body;
            console.log(e.url);


                        const   params = {
                            Bucket: process.env.REACT_APP_P4!,
                            Key:  e.thumbnail
                        };
        
                            bucket.deleteObject(params)
                              .on('httpDone', (e) => { 
                                return response.json({
                                    message : "Thumnail Uploaded"
                                })
                             })
                                .send((err) => {
                                if(err) {
                                    return response.json({
                                        message : "Snap error occurred: " +err
                                    })
                                }
                            });
                      })
})


















//Start of monclaris functions
type  RegisterUsers = {

    User:{
        name:string,
        phone:number,
        email:string,
        password:string,
        doc_id:string,
    },

}


export const Registeruser = functions.https.onRequest(async  (request,response) => {

    cors(request,response, async () => {

        try{
            let e: RegisterUsers = request.body

            let f = db.collection("MonclarisRegister").doc();
            e.User.doc_id = f.id;
            f.set(e)

                response.json({
                    message : "New User Registered"
                })

            }catch(err){

                response.json({
                    message: err as Error
                })
            }
    })
})
//End of monclaris












//kokocraft.ng
export const DynamicpostRender = functions.https.onRequest(async (req,res) => {
    cors(req,res,async () => {
        
       let i = req.query.i!;
       let d= req.query.d!;
       let c = req.query.c!;
       let blog = "Kokocraft.ng";

 
    const ua = req.headers['user-agent'];
    console.log(ua, "LOG");


    if( ua === "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"){
            res.status(200).send(`<!doctype html xmlns="http://www.w3.org/1999/xhtml"
                                            xmlns:og="http://ogp.me/ns#"
                                            xmlns:fb="https://www.facebook.com/2008/fbml">
                                            <head>
                                            <title>${blog} </title>
                                            <meta property="og:url"           content="https://us-central1-webpack-4414a.cloudfunctions.net/dynamicpostRender"/>
                                            <meta property="og:type"          content="website" />
                                            <meta property="og:title"         content=${blog} />
                                            <meta property="og:description"   content="Kokocraft.ng  home of exquisite Apparels" />
                                            <meta property="og:image"         content=${i} />
                                            <meta property="og:image:type"    content="image/jpeg"/>
                                            <meta property="og:image:width:   content="100%"/>
                                            <meta property="og:image:height:  content="200"/>
                                            </head>
                                            <img src="${i}"/>
                                            <h5>${i}</h5>
                                            </html>`);
     } else
            res.redirect(redireactUrl(d,c))  
            });
})




 



function redireactUrl(d:any, c:any){
    let url:any;
        if(c === "P")
          url="https://webflystore.web.app/model/"+d+"/"+c
        
    return url
}


type PayloadGrelot ={
    User:{
        to:string
    }

    payload:{
        id: string,
        email:string,
        item:string,
        doc_id:string,
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





var PUSHY_KOKO = new Pushy(process.env.PUSHY_GRELOT_KEYKOKO)
export const NotificationpushGrelot = functions.https.onRequest(async (request, response) => {
    cors(request, response, async () => {
     let e:PayloadGrelot = request.body   
     PUSHY_KOKO.sendPushNotification(e.payload, e.User.to, e.options,function (err: any, id:any){
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





