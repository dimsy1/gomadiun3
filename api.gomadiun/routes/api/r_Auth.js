const router = require('express').Router();

const {
    Login, logOut, Me, sendOtp, VerifOtp, LoginAdmin, MeAdmin
} = require('../../controllers/AuthController')


router.post("/wisatawan/login", Login);
router.post("/admin/login", LoginAdmin);
router.post("/logout", logOut);
router.get("/wisatawan/me", Me);
router.get("/admin/me", MeAdmin);
router.post("/sendOTP", sendOtp);
router.post("/verifOTP", VerifOtp);

module.exports = router;