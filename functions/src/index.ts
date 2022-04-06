import * as functions from "firebase-functions";
import { DynamicpostRender, Notificationwebflystore } from "./controllers/Webflystore";
import  * as express from 'express';
import * as corsModule from 'cors';
import { dynamicpostRender, webdealitAddMovie, webdealitAddMusic, webdealitAddPost, webdealitGetAllPost, webdealitGetAllPostByOrientation, webdealitGetAllPostByViews, webdealitGetMovie, webdealitGetMovieBydownloadCount, webdealitGetMovieByName, webdealitGetMovieUpdatedownloadCount, webdealitGetMusic, webdealitGetMusicByArtiseName, webdealitGetMusicByArtiseSort, webdealitGetMusicByLink, webdealitGetMusicByMusictitle, webdealitGetPostbylink, webdealitGetSignleUserPost, webdealitHomePageTopList, webdealitPostByTitle, webdealitRidirectUrl, webdealitSignInUser, webdealitVisitCount, webdealitVisitGetCount, Webdealit_Genre, webdealit_lock, webdealit_Movie_categories, webdealit_RegisterUser, webdealit_thumbsUp_and_views } from "./controllers/Webflyclick";
import { Grelot_lock, records, thumbs, listofproducts, listofUserAgeGrade, pushyapi, Sign_up_new_user, Paid_cart_uploaded, Notificationpush, UserlocationPhoneNumber } from "./controllers/Grelot";
import { Noman_id_genrator, ImgResize, DeletePost } from "./controllers/Noman";
import { Registeruser } from "./controllers/Monclaris";

const cors = corsModule(({ origin: true }));


const Webflystore = express();
Webflystore.use(cors);
Webflystore.post("DynamicpostRender", DynamicpostRender);
Webflystore.post("Notificationwebflystore", Notificationwebflystore);
exports.Webflystore = functions.https.onRequest(Webflystore);





const WebflyClick = express();
WebflyClick.use(cors);
WebflyClick.post("/webdealitAddPost",webdealitAddPost);
WebflyClick.get("/webdealitGetAllPost",webdealitGetAllPost);
WebflyClick.post("/webdealitGetPostbylink",webdealitGetPostbylink);
WebflyClick.get("/webdealitGetAllPostByViews",webdealitGetAllPostByViews);
WebflyClick.post("/webdealitGetAllPostByOrientation",webdealitGetAllPostByOrientation);
WebflyClick.post("/webdealitPostByTitle",webdealitPostByTitle);
WebflyClick.post("/webdealitGetSignleUserPost",webdealitGetSignleUserPost);
WebflyClick.post("/webdealit_thumbsUp_and_views",webdealit_thumbsUp_and_views);
WebflyClick.post("/webdealit_RegisterUser",webdealit_RegisterUser);
WebflyClick.post("/webdealitSignInUser",webdealitSignInUser);
WebflyClick.get("/webdealit_Movie_categories",webdealit_Movie_categories);
WebflyClick.get("/webdealit_lock",webdealit_lock);
WebflyClick.post("/webdealitAddMovie",webdealitAddMovie);
WebflyClick.get("/webdealitGetMovie",webdealitGetMovie);
WebflyClick.get("/webdealitGetMovieBydownloadCount",webdealitGetMovieBydownloadCount);
WebflyClick.get("/webdealitGetMovieByName",webdealitGetMovieByName);
WebflyClick.post("/webdealitGetMovieUpdatedownloadCount",webdealitGetMovieUpdatedownloadCount);
WebflyClick.post("/webdealitAddMusic",webdealitAddMusic);
WebflyClick.get("/webdealitGetMusic",webdealitGetMusic);
WebflyClick.get("webdealitGetMusicByArtiseSort",webdealitGetMusicByArtiseSort);
WebflyClick.post("/webdealitGetMusicByArtiseName",webdealitGetMusicByArtiseName);
WebflyClick.post("/webdealitGetMusicByMusictitle",webdealitGetMusicByMusictitle);
WebflyClick.post("/webdealitGetMusicByLink",webdealitGetMusicByLink);
WebflyClick.get("/Webdealit_Genre",Webdealit_Genre);
WebflyClick.post("/webdealitVisitCount",webdealitVisitCount);
WebflyClick.get("/webdealitVisitGetCount",webdealitVisitGetCount);
WebflyClick.get("/webdealitHomePageTopList",webdealitHomePageTopList);
WebflyClick.get("/webdealitRidirectUrl",webdealitRidirectUrl);
WebflyClick.get("/dynamicpostRender",dynamicpostRender);
exports.WebflyClick = functions.https.onRequest(WebflyClick);






const Noman = express();
Noman.use(cors);
Noman.get("/Noman_id_genrator",Noman_id_genrator);
Noman.post("/ImgResize",ImgResize);
Noman.post("/DeletePost",DeletePost);
exports.Noman = functions.https.onRequest(Noman);





const Monclaris = express();
Monclaris.use(cors);
Monclaris.post("Registeruser",Registeruser);
exports.Monclaris = functions.https.onRequest(Monclaris);







const Grelot = express();
Grelot.use(cors);
Grelot.get("/Grelot_lock",Grelot_lock);
Grelot.post("/records",records);
Grelot.post("/thumbs",thumbs);
Grelot.get("/listofproducts",listofproducts);
Grelot.post("/listofUserAgeGrade",listofUserAgeGrade);
Grelot.post("/pushyapi",pushyapi);
Grelot.post("/Sign_up_new_user",Sign_up_new_user);
Grelot.post("/Paid_cart_uploaded",Paid_cart_uploaded);
Grelot.post("/Notificationpush",Notificationpush);
Grelot.get("/UserlocationPhoneNumber",UserlocationPhoneNumber);
exports.Grelot = functions.https.onRequest(Grelot);
