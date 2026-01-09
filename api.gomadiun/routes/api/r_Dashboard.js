const router = require('express').Router();

const {
    get_all_dashboard,
    get_all_event,
    get_all_event_ByAdmin,
    get_detail_event,
    post_event_ByAdmin,
    delete_data_desawisata_byAdmin,
    get_all_availability
} = require('../../controllers/DashboardController')


router.get("/admin/dashboard", get_all_dashboard);
router.get("/userindustri/availability", get_all_availability);
router.get("/dashboard/event-report", get_all_event);
router.get("/dashboard/admin/event-report", get_all_event_ByAdmin);
router.get("/dashboard/event-report/:id_announcements", get_detail_event);
router.post("/dashboard/event-report/create", post_event_ByAdmin);
router.delete("/dashboard/event-report/delete/:id_announcements", delete_data_desawisata_byAdmin);

module.exports = router;