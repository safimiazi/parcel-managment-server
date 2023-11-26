const express = require('express')
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()
require('dotenv').config()

//middleware
app.use(cors())
app.use(express.json())





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
const userCollection = database.collection("users");


//when user register then create a user collection
app.post('/create-user', async(req,res) => {
    const data = req.body;
    const result = await userCollection.insertOne(data)
    res.send(result)
})

app.get("/get-user", async(req,res)=>{
    const result = await userCollection.find().toArray()
    res.send(result)
})

app.patch('/update-user-photo/:id', async(req,res)=>{
    const id = req.params.id;
    const UpdatedData = req.body;
    const query = { _id: new ObjectId(id)}
    const updateDoc = {
        $set: {
            photo: UpdatedData.photo
        }
    }
    const result = await userCollection.updateOne(query,updateDoc)
    res.send(result)
})






// user related api:--------------------------------------------------------------------------------------

//for book a parcel page
app.post('/parcel-booking', async(req,res) => {
    const data = req.body;
    console.log(data);
    const result = await parcelBookingCollection.insertOne(data);
    res.send(result)

})

//for get the data of my parcel page
app.get("/my-parcel/:email", async(req,res)=>{
    const data = req.params.email
    const query = {email: data}
    const cursor = await parcelBookingCollection.find(query).toArray()
    res.send(cursor)
})

//get single data for update parcel page
app.get("/parcel-update/:id", async(req,res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id)}
    const result = await parcelBookingCollection.findOne(query)
    res.send(result)
})

//patch the updated data

app.patch('/parcel-update/:id', async(req,res)=>{
    const id = req.params.id;
    const UpdatedData = req.body;
    const filter = { _id: new ObjectId(id)}

    const updateDoc = {
        $set: {

            name:UpdatedData.name,
            email: UpdatedData.email,
            phone: UpdatedData.phone,
            parcelType:UpdatedData.parcelType,
            parcelDeliveryAddress:UpdatedData.parcelDeliveryAddress,
            deliveryDate:UpdatedData.deliveryDate,
            bookingDate:UpdatedData.bookingDate,
            deliveryAddressLatitude:UpdatedData.deliveryAddressLatitude,
            deliveryAddressLongitude:UpdatedData.deliveryAddressLongitude,
            receiverName:UpdatedData.receiverName,
            receiverMobileNumber:UpdatedData.receiverMobileNumber,
            parcelWeight:UpdatedData.parcelWeight,
            price: UpdatedData.price,
            status:UpdatedData.status
        }
    }

    const result = await parcelBookingCollection.updateOne(filter,updateDoc)
    res.send(result)
})

//user will can delete her parcel in thi api
app.delete('/delete-parcel/:id', async(req,res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await parcelBookingCollection.deleteOne(query)
    res.send(result)
})

app.patch('/add-phone-no/:email', async(req,res)=> {
    const email = req.params.email;
    const data = req.body;
    console.log(email);
    const filter = {email: email}
    const options = { upsert: true };
const updateDoc = {
    $set: {
        phone: data.phone
    },
    $inc: {
        book: 1
    }
}

const result = await userCollection.updateOne(filter,updateDoc, options)
res.send(result)
})

app.get('/get-filter-data', async(req, res)=>{
    const data =req.query.email
    const status = req.query.status

    const query = {email: data, status: status}
    const result = await parcelBookingCollection.find(query).toArray()
    res.send(result)
})




//admin related api:---------------------------------------------------------------------------------------------
app.get('/get-all-users', async(req,res)=> {
    const result = await userCollection.find().toArray()
    res.send(result)
})

app.get('/get-all-parcel', async(req,res)=>{
    const result = await parcelBookingCollection.find().toArray()
    res.send(result)
})

app.get('/all-user', async(req,res)=>{
    const result = await userCollection.find().toArray()
    res.send(result)
})

app.get('/all-delivery-men', async(req,res)=>{
    const query = { role : "deliveryMan"}
    const result = await userCollection.find(query).toArray()
    res.send(result)
})

app.patch('/make-delivery-man/:id', async(req,res)=>{
    const id = req.params.id;
    const query = { _id: new ObjectId(id)}
    const updateDoc = {
        $set: {
            role: "deliveryMan"
        }
    }
    const result = await userCollection.updateOne(query, updateDoc)
    res.send(result)
})


app.patch('/make-admin/:id', async(req,res)=>{
    const id = req.params.id;
    const query = { _id: new ObjectId(id)}
    const updateDoc = {
        $set: {
            role: "admin"
        }
    }
    const result = await userCollection.updateOne(query, updateDoc)
    res.send(result)
})

app.get('/get-all-delivery-man', async(req,res)=> {
    const query = {role: "deliveryMan"}
    const result = await userCollection.find(query).toArray()
    res.send(result)
})

app.patch('/select-delivery-man/:id', async(req,res)=>{
    const id = req.params.id;
    const data = req.body;
    console.log(data);
    const query = {_id: new ObjectId(id)}
    const options = { upsert: true };
    const updateDoc = {
        $set: {
            status: data.status,
            approxDeliveryDate: data.approxDeliveryDate,
            deliveryManId: data.deliveryManId

        }
    }

    const result = await parcelBookingCollection.updateOne(query, updateDoc, options)
    res.send(result)
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