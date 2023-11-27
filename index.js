const express = require('express')
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()
require('dotenv').config()
var jwt = require('jsonwebtoken');

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


//jwt related api-----------------------------------------------------------
app.post('/jwt', async(req,res)=>{
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
    })
    res.send({token});
})

//middleware:
const verifyToken = (req, res, next) => {
    console.log("inside verify token", req.headers.authorization);
    if(!req.headers.authorization){
        return res.status(401).send({message: 'forbidden access'})
    }
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
        if(err){
            return res.status(401).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })
}

//admin
app.get('/user/admin/:email', verifyToken, async (req, res) => {
    const email = req.params.email;
    if(email !== req.decoded.email){
        return res.status(403).send({message: 'unauthorized access'})
    }
    const query = {email: email}
    const user = await userCollection.findOne(query)
    let admin = false;
    if(user){
        admin = user?.role === 'admin';
    }
    res.send({admin})
})

//deliveryMan
app.get('/user/delivery-man/:email',verifyToken, async(req,res)=>{
    const email = req.params.email;
    if(email !== req.decoded.email){
        return res.status(403).send({message: 'unauthorized access'})
    }
    const query = {email: email}
    const user = await userCollection.findOne(query)
    let deliveryMan = false;
    if(user){
        deliveryMan = user?.role === 'deliveryMan';
    }
    res.send({deliveryMan})
})





//when user register then create a user collection------------------------
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
    const id = req?.params?.id;
    const UpdatedData = req.body;
    console.log(UpdatedData, id);
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

//google login:
app.post('/post-google-info', async(req,res) => {
    const data = req.body;
    console.log(data);
    const result = await userCollection.insertOne(data);
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
app.get('/get-all-users', verifyToken, async(req,res)=> {
    const result = await userCollection.find().toArray()
    res.send(result)
})

app.get('/get-all-parcel',verifyToken,  async(req,res)=>{
    const result = await parcelBookingCollection.find().toArray()
    res.send(result)
})

app.get('/all-user',verifyToken, async(req,res)=>{
    const result = await userCollection.find().toArray()
    res.send(result)
})

app.get('/all-delivery-men',verifyToken, async(req,res)=>{
    const query = { role : "deliveryMan"}
    const result = await userCollection.find(query).toArray()
    res.send(result)
})

app.patch('/make-delivery-man/:id',verifyToken, async(req,res)=>{
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


app.patch('/make-admin/:id',verifyToken, async(req,res)=>{
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

app.get('/get-all-delivery-man',verifyToken, async(req,res)=> {
    const query = {role: "deliveryMan"}
    const result = await userCollection.find(query).toArray()
    res.send(result)
})

app.patch('/select-delivery-man/:id',verifyToken, async(req,res)=>{
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




//delivery man related api----------------------------------------------------------------


app.get('/get-delivery-list/:email', async(req,res)=>{
    const userEmail = req.params.email;
    const query = {deliveryManId: userEmail}
    const result = await parcelBookingCollection.find(query).toArray()
      res.send(result)
})


app.patch('/cancel-status/:id', async(req,res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const updateDoc = {
        $set: {
            status: "cancelled"
        }
    }

    const result = await parcelBookingCollection.updateOne(query, updateDoc)
    res.send(result)
})

app.patch('/deliver-status/:id', async(req,res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const updateDoc = {
        $set: {
            status: "delivered"
        }
    }

    const result = await parcelBookingCollection.updateOne(query, updateDoc)
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