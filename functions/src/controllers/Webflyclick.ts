
import * as functions from "firebase-functions";
import { firestore } from "firebase-admin";
import { db } from "../config/firebase";
import * as encrpty from 'crypto-js';
import * as bycrypt from 'bcryptjs'





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


export const  webdealitAddPost = functions.https.onRequest(async (req,res) => {
         try{
            let e: RequestBody = req.body;
            let a = db.collection(process.env.REACT_APP_POST_SECTION!).doc();
            let b = db.collection(process.env.REACT_APP_POST_SECTION!).doc("1A").collection(e.User.useremail).doc();
            e.UserPost.doc_id_a = a.id;
            e.UserPost.doc_id_b = b.id;
            e.UserPost.timestamp = firestore.Timestamp.now()
            a.set(e);
            b.set(e);
                res.json({
                   message: "Ok 200"
               })
             }
        catch (err) { 
             res.json({
                message: err as Error
            })
        }
})





export const  webdealitGetAllPost = functions.https.onRequest(async (req,res) => {  
        try{
          const raw_data: RequestBody[] = [];
          let data = await db.collection(process.env.REACT_APP_POST_SECTION!).orderBy("UserPost.timestamp","desc").limit(100).get();
          data.forEach((doc: any) => raw_data.push(doc.data()))   
           res.json({
            message: raw_data
           })
         }
          catch (err) { 
            res.json({
                message: err as Error
            })
        }
})







export const  webdealitGetPostbylink = functions.https.onRequest(async (req,res) => {      
        try{
          const m :RequestBody = req.body;
          let raw_data =  db.collection(process.env.REACT_APP_POST_SECTION!).doc("1A").collection(m.User.useremail).doc(m.UserPost.doc_id_b);
            res.json({
                  message: (await raw_data.get()).data()
                })
          }
            catch (err) { 
                res.json({
                    message: err as Error
                })
            }
})




export const  webdealitGetAllPostByViews = functions.https.onRequest(async (req,res) => {      
        try{
          const raw_data: RequestBody[] = [];
            let data = await db.collection(process.env.REACT_APP_POST_SECTION!).orderBy("UserPost.views","desc").limit(100).get();
               data.forEach((doc: any) => raw_data.push(doc.data()))   
                res.json({
                    message: raw_data
                })
            }
            catch (err) { 
              res.json({
                    message: err as Error
            })
        }
})





export const  webdealitGetAllPostByOrientation = functions.https.onRequest(async (req,res) => {
        try{
          const e : RequestBody = req.body;
          const raw_data: RequestBody[] = [];
          let data = await db.collection(process.env.REACT_APP_POST_SECTION!).where("UserPost.orientations","==",e.UserPost.orientations).limit(100).get();
          data.forEach((doc: any) => raw_data.push(doc.data()));   
           
          res.json({
            message: raw_data
           })

         }
          catch (err) { 
             res.json({
                message: err as Error
            })
        }
})








export const  webdealitPostByTitle = functions.https.onRequest(async (req,res) => {   
        try{
          const e : RequestBody = req.body;
          const raw_data: RequestBody[] = [];
          let title = e.UserPost.title.split('+').join(' ');
          console.log(title);
          let data = await db.collection(process.env.REACT_APP_POST_SECTION!).where("UserPost.title","==",title).limit(100).get();
          data.forEach((doc: any) => raw_data.push(doc.data()))   
        
           res.json({
            message: raw_data
           })

         }
          catch (err) { 
            res.json({
                message: err as Error
            })
        }
})






export const  webdealitGetSignleUserPost = functions.https.onRequest(async (req,res) => {
       
        try{
        let e : RequestBody = req.body;
        let raw_data: RequestBody  [] = [];   
        let data = await db.collection(process.env.REACT_APP_POST_SECTION!).doc("1A").collection(e.User.useremail).get();
        data.forEach((doc: any) => raw_data.push(doc.data()))   
        

         res.json({
            message: raw_data
        })
        }
        catch (err) { 

        res.json({
            message: err as Error
            })
        }
})





export const  webdealit_thumbsUp_and_views = functions.https.onRequest( async (request, respones) => {

    let a : RequestBody = request.body
         try{
                if(a.UserPost.likes !== 0)
                    REPEAT_ACTION(a.UserPost.likes,"UserPost.likes")
                else         
                    REPEAT_ACTION(a.UserPost.views,"UserPost.views")
                
                 respones.json({
                    message: "Ok"
                })
            }catch(err){
                 respones.json({
                    message: err as Error
                })
            }   
})




function REPEAT_ACTION(a:any,table:string) {
    db.collection(process.env.REACT_APP_POST_SECTION!).doc(a.UserPost.doc_id_a)
    .update(table, firestore.FieldValue.increment(a));
        db.collection(process.env.REACT_APP_POST_SECTION!).doc("1A").collection(a.User.useremail)
        .doc(a.UserPost.doc_id_b).update(table,firestore.FieldValue.increment(a));
}



export const  webdealit_RegisterUser = functions.https.onRequest(async (request,respones) => {
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


           respones.json({
             message: confirm
         })
         
        }catch(err) {

              respones.json({
                message: err as Error
            })
        }

})






export const  webdealitSignInUser = functions.https.onRequest(async (request,respones) => {
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
                         respones.json({
                            message: e
                        })  
                    else
                         respones.json({
                            message: "Email or password combination not correct !"
                        }) 
                    
            }else
                     respones.json({
                        message: "Account not found !"
                    }) 

            }catch(err) {
    
                  respones.json({
                    message: err as Error
                })
            }

});




export const webdealit_Movie_categories = functions.https.onRequest(async (request,respones) => {
        const list = ['Select Categories', 'Romantic', 'Action', 'Horror', 'Telenovelas','funny', "MCU's",'Comic',"Nigerian","Ghanain","foreign"];
         respones.json({
            message: list
        })
})











export const webdealit_lock = functions.https.onRequest(async (request,respones) => {        
        let intake =  {"p1":process.env.REACT_APP_P1, "p2":process.env.REACT_APP_P2, "p3":process.env.REACT_APP_P3}
         respones.json({
            message: intake
        })
})










export const  webdealitAddMovie= functions.https.onRequest(async (req,res) => {       
         try{
            let e: MovieBody = req.body;
            let a = db.collection(process.env.REACT_APP_SCREEN!).doc();
             e.doc_id = a.id;
             e.timestamp = firestore.Timestamp.now();
             a.set(e);

            res.json({
                   message: "Movie Added"
               })

             }
        catch (err) { 
             res.json({
                message: err as Error
            })
        }
})







export const  webdealitGetMovie= functions.https.onRequest(async (req,res) => {
         try{
       
            const raw_data: MovieBody[] = [];
            let data = await db.collection(process.env.REACT_APP_SCREEN!).orderBy("timestamp","desc").limit(50).get();
            data.forEach((doc: any) => raw_data.push(doc.data()))  
                res.json({
                   message: raw_data
               })
             }
            catch (err) { 
                 res.json({
                    message: err as Error
                })
            }
})





export const  webdealitGetMovieBydownloadCount = functions.https.onRequest(async (req,res) => {
         try{
       
            const raw_data: MovieBody[] = [];
            let data = await db.collection(process.env.REACT_APP_SCREEN!).orderBy("downloadcount","desc").limit(50).get();
            data.forEach((doc: any) => raw_data.push(doc.data()))  
                res.json({
                   message: raw_data
               })

             }
            catch (err) { 
                res.json({
                    message: err as Error
                })
            }

})



export const  webdealitGetMovieByName = functions.https.onRequest(async (req,res) => {

       
         try{
            const raw_data: MovieBody[] = [];
            let e : MovieBody = req.body;
            let data = await db.collection(process.env.REACT_APP_SOUND!).where("Music.music_title", "==", e.Mtitle).limit(100).get();
            data.forEach((doc: any) => raw_data.push(doc.data()))  

            res.json({
                    message: raw_data
                })

        }
        catch (err) { 
            res.json({
                message: err as Error
            })
        }

})




export const  webdealitGetMovieUpdatedownloadCount = functions.https.onRequest(async (req,res) => {       
         try{
            let errand ="Not Found !";
            let e: MovieBody = req.body;
            const r = db.collection(process.env.REACT_APP_SCREEN!).doc(e.doc_id);

             if((await r.get()).exists){
                  r.update("downloadcount",firestore.FieldValue.increment(1));
                  errand = "Updated"
             }
               
                res.json({
                   message: errand
               })

             }

            catch (err) { 
                 res.json({
                    message: err as Error
                })
            }
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
         try{
             let e: MusicBody = req.body;
             let a = db.collection(process.env.REACT_APP_SOUND!).doc();
             e.Music.doc_id = a.id;
             e.Music.timestamp = firestore.Timestamp.now();
             a.set(e);

                res.json({
                   message: "Music Added "
               })

             }
        catch (err) { 
             res.json({
                message: err as Error
            })
        }

})



export const  webdealitGetMusic= functions.https.onRequest(async (req,res) => {       
         try{
            const raw_data: MusicBody[] = [];
            let data = await db.collection(process.env.REACT_APP_SOUND!).orderBy("Music.timestamp","desc").limit(120).get();
            data.forEach((doc: any) => raw_data.push(doc.data()))  

                res.json({
                   message: raw_data
               })

             }
        catch (err) { 
             res.json({
                message: err as Error
            })
        }
})




export const  webdealitGetMusicByArtiseSort = functions.https.onRequest(async (req,res) => {
         try{
            const raw_data: MusicBody[] = [];
            let e1 = req.query.query1;
            let e2 = req.query.query2;
            let e3 = req.query.query3;
            let e4 = req.query.query4;
            let list = [e1,e2,e3,e4];
            let data = await db.collection(process.env.REACT_APP_SOUND!).where("Music.genre", "in", list).limit(100).get();
            data.forEach((doc: any) => raw_data.push(doc.data()))  

                 res.json({
                    message: raw_data
                })

        }
        catch (err) { 
             res.json({
                message: err as Error
            })
        }
})



export const  webdealitGetMusicByArtiseName = functions.https.onRequest(async (req,res) => {       
         try{
            const raw_data: MusicBody[] = [];
            let e : MusicBody = req.body;
            let data = await db.collection(process.env.REACT_APP_SOUND!).where("Music.music_artist", "==", e.Music.music_artist).limit(100).get();
            data.forEach((doc: any) => raw_data.push(doc.data()))  

             res.json({
                    message: raw_data
                })

        }
        catch (err) { 
            res.json({
                message: err as Error
            })
        }
})






export const  webdealitGetMusicByMusictitle = functions.https.onRequest(async (req,res) => {       
         try{
            const raw_data: MusicBody[] = [];
            let e : MusicBody = req.body;
            console.log(e.Music.music_title,"BF");
            let ms = e.Music.music_title.split('+').join(' ');
            console.log(ms,"AF");
            let data = await db.collection(process.env.REACT_APP_SOUND!).where("Music.music_title", "==", ms).limit(50).get();
            data.forEach((doc: any) => raw_data.push(doc.data()))  
            
             res.json({
                message: raw_data
            })    
        }
        catch (err) { 
             res.json({
                message: err as Error
            })
        }
})





export const  webdealitGetMusicByLink = functions.https.onRequest(async (req,res) => {
         try{
            const raw_data: MusicBody[] = [];
            let e : MusicBody = req.body;

            let data = await db.collection(process.env.REACT_APP_SOUND!).where("Music.doc_id", "==", e.Music.doc_id).get();
            data.forEach((doc: any) => raw_data.push(doc.data()))  

             res.json({
                    message: raw_data
                })

        }
        catch (err) { 
             res.json({
                message: err as Error
            })
        }

})







export const Webdealit_Genre = functions.https.onRequest(async (request, respones)=> {
        const list = ['Select Music Genre','Hip-Hop Rap','Dancehall','Hip Hop', 'AfroPop', 'Jazz',"Pop", 'Gospel','Electronic','Rock','RnB','Instrumental',"Soul","Tropical","Culture", "Dj mix tape","Highlife"]
         respones.json({
            message: list
        })
})





function stamp(){
    var dt = new Date(firestore.Timestamp.now().toDate().toUTCString()).toString()
    var sub = dt.substring(0,dt.indexOf(":")-2).trimEnd();
    return sub;

}



export const  webdealitVisitCount = functions.https.onRequest(async (req,res) => {
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

                res.json({
                   message:"OK"
               })

             }
        catch (err) { 
             res.json({
                message: err as Error
            })
        }
})




export const webdealitVisitGetCount  =  functions.https.onRequest(async (req,res) => {
    try{
        let e: VisitCount  [] = [];
        let current = await  db.collection(process.env.REACT_APP_TRACK!).orderBy("stamp","desc").limit(500).get();  
        current.forEach((doc: any) => e.push(doc.data()));  

          res.json({
            message: e
        })
       }catch(err){
          res.json({
                message: err as Error
            })
        }
});




export const webdealitHomePageTopList  =  functions.https.onRequest(async (req,res) => {    
        let list = ["Bitcoin rate", "NFT trends", "Gift card","Ethereum","DeFi trends","Coinbase"]
         res.json({
            message: list
        })
})




export const webdealitRidirectUrl = functions.https.onRequest(async (req,res) => {  
console.log(req.query.key)
})





export const dynamicpostRender = functions.https.onRequest(async (req,res) => {

       let i = req.query.i!;
       let t = req.query.t!;
       let a = req.query.a!;
       let s = req.query.s!
       let blog = "WEBFLY BLOG";

 
    const ua = req.headers['user-agent'];
    console.log(ua, "LOG");


    if( ua === "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"){
            res.status(200).send(`<!doctype html xmlns="http://www.w3.org/1999/xhtml"
                                            xmlns:og="http://ogp.me/ns#"
                                            xmlns:fb="https://www.facebook.com/2008/fbml">
                                                <head>
                                                    <title>${blog} </title>
                                                    <meta property="og:url"           content="https://webfly.click"/>
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
            res.redirect(redireactUrlWebdeal(s,t,t.toString().toLowerCase()))  
})




 



function redireactUrlWebdeal(s:any,m:any, t:any){
    let url:any;

    if(s === "m")
        url = "https://webfly.click/Musicsearch?M="+t;
    else
        if(s === "p")
            url=`https://webfly.click/Read/${m.split(' ').join('+')}`
        
    return url
}


//End of Webdealit functions






