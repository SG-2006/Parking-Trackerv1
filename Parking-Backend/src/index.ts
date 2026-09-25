import authRoutes from './auth';
import express from 'express';
import db from './db';
import spotsRoutes from './spots';
import cors from 'cors';
import bookingsRoutes from './bookings';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/', spotsRoutes);
app.use('/', bookingsRoutes);

app.get('/', (req, res) => {
    res.send('Parking backend is running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

db.prepare("INSERT INTO lots (name) VALUES (?)").run("Campus Car Park") 
// this statement allows the developer to add various spots to the database
// since id is the primary key it auto-generates and you do not need to add it specifically 
// therefore it only needs one placeholder 

 db.prepare("INSERT INTO spots (lot_id, label) VALUES (?, ?)").run(1, "A1")
 db.prepare("INSERT INTO spots (lot_id, label) VALUES (?, ?)").run(1, "A2")
 db.prepare("INSERT INTO spots (lot_id, label) VALUES (?, ?)").run(1, "A3")

/ db.prepare("INSERT INTO lots (name) VALUES (?)").run("High Street Car Park")

/ db.prepare("INSERT INTO spots (lot_id, label) VALUES (?, ?)").run(2, "B1")
/ db.prepare("INSERT INTO spots (lot_id, label) VALUES (?, ?)").run(2, "B2")
/ db.prepare("INSERT INTO spots (lot_id, label) VALUES (?, ?)").run(2, "B3")
 
// this table basically inserts the lots into the lot_id and label sections in the spots
// essentially stores it on the database on startup