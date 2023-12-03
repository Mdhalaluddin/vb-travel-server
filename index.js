const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;


// middleware
app.use(cors({
    origin: [
        'http://localhost:5173'
    ],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// middewares
const verifyToken = async (req, res, next) => {
    const token = req.cookies?.token;
    // console.log('token in the middleware', token);
    if (!token) {
        return res.status(401).send({ massage: 'unauthorized access' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ massage: 'unauthorized access' })
        }
        req.user = decoded;
        next();
    })
}

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



        // auth related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log('user for token', user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h'
            })
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            })
                .send({ success: true })
        });

        app.post('/logout', async (req, res) => {
            const user = req.body;
            console.log('logging out', user);
            res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        })

        // all data api and search related api
        app.get('/language', async (req, res) => {
            const filter = req.query;
            console.log('cok cok cokise', req.cookies);
            console.log(filter);
            const query = {
                category: { $regex: filter.search, $options: 'i' }
            }
            const cursor = languageCollection.find(query)
            const result = await cursor.toArray();
            res.send(result);
        })
        // all blog
        app.get('/language/create', async (req, res) => {
            const cursor = languageCollection.find();
            const result = (await cursor.toArray());
            res.send(result)
        })


        // resent blog
        app.get('/language/resent', async (req, res) => {
            const cursor = languageCollection.find().sort({ createdAt: -1 });
            const result = (await cursor.toArray());
            res.send(result)
        })


        app.post('/language', async (req, res) => {
            const newBlog = {
                body: req.body,
                createdAt: new Date(toString),
            };
            const result = await languageCollection.insertOne(newBlog)
            console.log(result);
            res.send(result);
        })



        app.get('/language/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await languageCollection.findOne(query);
            res.send(result)

        })

        app.put('/language/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
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
        app.get('/wishlist',  async (req, res) => {
            // console.log(req.query.email);
            // console.log('token owner info', req.user);
            // if (req.query.email !== req.user.email) {
            //     return res.status(403).send({ massage: 'forbidden access' })
            // }
            let query = {};
            if (req?.query?.email) {
                query = { email: req.query.email }
            }
            const result = await wishlistCollection.find().toArray();
            res.send(result)
        })

        app.post('/wishlist', async (req, res) => {
            const wishlist = req.body;
            delete wishlist._id;
            console.log(wishlist);
            const result = await wishlistCollection.insertOne(wishlist)
            res.send(result);
        })

        app.delete('/wishlist/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId (id) }
            const result = await wishlistCollection.deleteOne(query)
            res.send(result)
        });
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