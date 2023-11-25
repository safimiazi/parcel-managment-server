const express = require('express')
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()
require('dotenv').config()

//middleware
app.use(cors())
app.use(express.json())





const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_BD}@cluster0.uinjrty.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

const database = client.db('parcelDB')
const parcelBookingCollection = database.collection("parcelBooking");



// user related api:

//for book a parcel page
app.post('/parcel-booking', async(req,res) => {
    const data = req.body;
    console.log(data);
    const result = await parcelBookingCollection.insertOne(data);
    res.send(result)

})

//for get the data of my parcel page
app.get("/my-parcel", async(req,res)=>{
    const cursor = await parcelBookingCollection.find().toArray()
    res.send(cursor)
})







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/',(req,res)=>{
    res.send('parcel management open')
} )

app.listen(port, () => {
    console.log(`example app listening on part ${port}`);
})