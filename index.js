const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.3x6azjv.mongodb.net/?retryWrites=true&w=majority`;


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
    await client.connect();

    const languageCollection = client.db('programmingLanguage').collection('language')
    const wishlistCollection = client.db('programmingLanguage').collection('wishlist')


    app.get('/language', async(req, res)=>{
        const cursor = languageCollection.find()
        const result = await cursor.toArray();
        res.send(result);
    })

    app.post('/language', async(req, res)=>{
        const newCourses = req.body;
        const result = await languageCollection.insertOne(newCourses)
        console.log(result);
        res.send(result);
    })

    app.put('/language/:id', async(req, res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const options = {upsert: true}
        const updateCourses = req.body;
        const cursor ={
            $set: {
                title: updateCourses.title,
                select: updateCourses.select,
                shortDescription: updateCourses.shortDescription,
                longDescription: updateCourses.longDescription,
                img: updateCourses.img
            }
        }
        const result = await languageCollection.updateOne(filter,options, cursor);
        res.send(result)
    })

    // Wishlist added
    app.get('/wishlist', async(req, res)=>{
        console.log(req.query.email);
        let query = {};
        if(req.query?.email){
            query = {email : req.query.email}
        }
        const result = await wishlistCollection.find().toArray();
        res.send(result)
        })

    app.post('/wishlist', async(req, res)=>{
        const wishlist = req.body;
        console.log(wishlist);
        const result= await wishlistCollection.insertOne(wishlist)
        res.send(result);
    })

    app.delete('/wishlist/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await wishlistCollection.deleteOne(query)
        res.send(result)
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Programming language')
})

app.listen(port, () => {
    console.log(`programming language is running on port  ${port}`)
})