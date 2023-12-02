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
        const commentCollection = client.db('programmingLanguage').collection('comment')

        // all data api and search related api
        app.get('/language', async (req, res) => {
            const filter = req.query;
            console.log(filter);
            const query = {
                category: { $regex: filter.search, $options: 'i' }
            }
            const cursor = languageCollection.find(query)
            const result = await cursor.toArray();
            res.send(result);
        })

        // resent blog
        // app.get('/resent/blog', async(req, res)=>{
        //     const filter = req.query;
        //     console.log(filter);
        //     const query = {

        //     }
        //     const cursor = languageCollection.find();
        //     const result = await cursor.toArray();
        //     res.send(result)
        // })


        app.post('/language', async (req, res) => {
            const newBlog = req.body;
            const result = await languageCollection.insertOne(newBlog)
            console.log(result);
            res.send(result);
        })
        // comment
        app.get('/comment', async (req, res) => {
            const cursor = commentCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/comment', async (req, res) => {
            const userComment = req.body;
            console.log('user commit', userComment);
            const result = await commentCollection.insertOne(userComment)
            res.send(result)
        })


        app.get('/language/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await languageCollection.findOne(query);
            res.send(result)

        })

        app.put('/language/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateBlog = req.body;
            const blog = {
                $set: {
                    title: updateBlog.title,
                    select: updateBlog.select,
                    shortDescription: updateBlog.shortDescription,
                    longDescription: updateBlog.longDescription,
                    img: updateBlog.img
                }
            }
            const result = await languageCollection.updateOne(filter, blog, options);
            res.send(result)
        })

        // Wishlist added
        app.get('/wishlist', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await wishlistCollection.find().toArray();
            res.send(result)
        })

        app.post('/wishlist', async (req, res) => {
            const wishlist = req.body;
            console.log(wishlist);
            const result = await wishlistCollection.insertOne(wishlist)
            res.send(result);
        })

        app.delete('/wishlist/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: id }
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