import express from "express";
const router = express.Router();
import passport from "passport";

import {getLocationBMKG, getWeatherBMKG} from "../controller/forecastingController.js";

router.get("/getlocation", passport.authenticate('jwt', { session: false }), getLocationBMKG); // Menentukan route '/getLocation'
router.post('/getweather', passport.authenticate('jwt', { session: false }), getWeatherBMKG);


export default router;
