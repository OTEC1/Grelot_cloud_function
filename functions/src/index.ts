import * as functions from "firebase-functions";
import * as corsModule from 'cors';
import * as encrpty from 'crypto-js';
import * as bycrypt from 'bcryptjs'
import { db } from "./config/firebase";
import { firestore } from "firebase-admin";
import * as cloudinary from 'cloudinary';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
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
            let a = db.collection("WebdealitPostAd").doc();
            let b = db.collection("WebdealitPostAd").doc("1A").collection(e.User.useremail).doc();
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
          let data = await db.collection("WebdealitPostAd").orderBy("UserPost.timestamp","desc").limit(100).get();
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








export const  webdealitGetAllPostByViews = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
      
        try{
          const raw_data: RequestBody[] = [];
          let data = await db.collection("WebdealitPostAd").orderBy("UserPost.views","desc").limit(100).get();
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
        let data = await db.collection("WebdealitPostAd").doc("1A").collection(e.User.useremail).get();
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
    timestamp:any,
    downloadcount:number,
}



export const  webdealitAddMovie= functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
         try{
            let e: MovieBody = req.body;
            let a = db.collection("WebdealitMovies").doc();
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
            let data = await db.collection("WebdealitMovies").orderBy("timestamp","desc").limit(50).get();
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
            let data = await db.collection("WebdealitMovies").orderBy("downloadcount","desc").limit(50).get();
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
            let data = await db.collection("WebdealitMusic").where("Music.music_title", "==", e.Mtitle).limit(100).get();
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
            const r = db.collection("WebdealitMovies").doc(e.doc_id);
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
        
    }
 
 }

export const  webdealitAddMusic = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
       
         try{
             let e: MusicBody = req.body;
             let a = db.collection("WebdealitMusic").doc();
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
            let data = await db.collection("WebdealitMusic").orderBy("Music.timestamp","desc").limit(120).get();
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
            let data = await db.collection("WebdealitMusic").where("Music.music_artist", "==", e.Music.music_artist).limit(100).get();
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
            let data = await db.collection("WebdealitMusic").where("Music.music_title", "==", e.Music.music_title).limit(50).get();
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
            let data = await db.collection("WebdealitMusic").where("Music.doc_id", "==", e.Music.doc_id).get();
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
        const list = ['Select Music Genre','Hip-Hop Rap','Dancehall','Pop', 'AfroPop', 'Jazz', 'Gospel','Eletronic','Rock','RnB','Instrumental']
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
             let time = db.collection("WebdealitVisitorTrack").listDocuments();
             const day =  db.collection("WebdealitVisitorTrack").doc();
             e.date = stamp();
             e.stamp = firestore.Timestamp.now();
             if((await time).length <= 0){
                  e.doc_id = day.id;
                  day.set(e);
             }else{
                  let current = await  db.collection("WebdealitVisitorTrack").orderBy("stamp","desc").limit(1).get();  
                  current.forEach((doc: any) => e = (doc.data()))  
                    if(stamp() === e.date){
                       
                           db.collection("WebdealitVisitorTrack").doc(e.doc_id).update("count",firestore.FieldValue.increment(1))
                     } else{
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
        let current = await  db.collection("WebdealitVisitorTrack").orderBy("stamp","desc").limit(500).get();  
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


//End of Webdealit functions







export const Noman_id_genrator = functions.https.onRequest(async (request, respones)=> {

    cors(request, respones, async () => {
        respones.json({
            message: uuid()
        })
    })

})