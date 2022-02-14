const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middle were
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yatx1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
  try {
    await client.connect()

    const database = client.db("doctorsPortal");
    const appointmentBookingCollection = database.collection("appointmentBookings")
    const userCollection = database.collection("users");

    //post api (users booking store to db)
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      const result = await appointmentBookingCollection.insertOne(booking);
      res.json(result);
    })

    //get api (get the booked appoinment)
    app.get('/booked-appointments', async (req, res) => {
      const email = req.query.email;
      const date = req.query.date;
      const query = { email, date }
      const result = await appointmentBookingCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/appointments/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await appointmentBookingCollection.findOne(query);
      res.json(result)
    })

    //post api (store the user information with registration)
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });

    //put api (store user info with google sign in )
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: user };
      const options = { upsert: true };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    })

    app.put('/admin', async (req, res) => {
      const admin = req.body;
      const filter = { email: admin.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    })

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.send({ admin: isAdmin })
    })

  }
  finally {

  }

};

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('doctors portal server is runnig')
})

app.listen(port, () => {
  console.log('doctors portal server is runnig at port', port)
})