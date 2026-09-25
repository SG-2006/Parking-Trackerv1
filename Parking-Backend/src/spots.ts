import { Router } from 'express'; 
import spotsRoutes from './spots'; // allows the index.ts file to use the contents of this one
import db from './db';

const router = Router();
router.get('/lots', async(req, res) => {
    const lots = db.prepare("SELECT * FROM lots").all();
    res.status(200).json(lots)

});

router.get('/spots', async(req,res) => {
    const spots = db.prepare("SELECT * FROM spots").all();
    res.status(200).json(spots)
});

export default router;