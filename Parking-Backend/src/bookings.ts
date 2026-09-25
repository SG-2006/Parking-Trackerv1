import checkAuth from './middleware';
import db from './db';
import { Router } from 'express';

const router = Router();

router.post('/bookings', checkAuth, async (req, res) => {
    const { spot_id } = req.body;

const spot = db.prepare("SELECT * FROM spots WHERE id = ?").get(spot_id);
// looks up the spot that matches the spot_id the user sent, so I can check its current status before deciding weather to let the booking go ahead

if (!spot) {return res.status(404).send('Parking Spot does not exist')}
// if the spot id doesn't match any of the ones in the database return error

if (spot.status !== 'free') {
    return res.status(409).send('Spot is already occupied')
}
// !== means not equal to, if the spot isn't free give an error with the message above

db.prepare("INSERT INTO bookings (spot_id, user_id) VALUES (?, ?)").run(spot_id, req.user.id); 
// this inserts the spot_id and user_id into the bookings table, storing it for future reference

db.prepare("UPDATE spots SET status = ? WHERE id = ?").run('occupied', spot_id);
// this updates the status to occupied if the spot isn't free, of the spot that matches the spot id that the user is trying to book

res.status(201).send('Spot booked successfully');
});

router.post('/bookings/release', checkAuth, async ( req, res ) => {
     const {spot_id } = req.body 
// first line is sequence of order - post bookings/release, verify they're logged in (auth) and run the function using req and res
// line 2 just means pull out the spot_id from the data     

const booking = db.prepare("SELECT * FROM bookings WHERE spot_id = ? AND status = ?").get(spot_id, "active")
// selects data from bookings table where spot_id matches the users and status returns active

if (!booking) {return res.status(404).send('No active booking found for this spot')}
// this line checks both of the conditions above and returns an error unless BOTH are TRUE

if (booking.user_id !== req.user.id) {
    return res.status(403).send('You cannot release a booking that is not yours');

}

// this line compares the booking.user id against the req.user id (who's asking rn) and unless it matches doesn't allow you to realease the booking

db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run('completed', booking.id);

db.prepare("UPDATE spots SET status = ? WHERE id = ?").run('free', spot_id);

res.status(200).send('Spot is free');

});

export default router;