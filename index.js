const express = require('express');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require('cors');
const port = process.env.PORT || 3000;

//middleware.
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Real Estate server is running');
})

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ephossx.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db('RealEstateDB');
    const propertyCollection = db.collection('properties');
    const reviewCollection = db.collection('reviews');

    app.get('/feature-properties', async (req, res) => {
      const cursor = propertyCollection.find().sort({ createdAt: 1}).limit(6).project({image:1, propertyName:1, category:1, description:1, location:1, price:1});
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/properties', async (req, res) => {
      // console.log(req.query);
      const { limit = 0, skip = 0, sort = 'price', order = 'desc', search = '' } = req.query;



      const cursor = propertyCollection
        .find()
        .limit(Number(limit))
        .skip(Number(skip))
        .project({
          image: 1,
          propertyName: 1,
          category: 1,
          userName:1,
          location: 1,
          price: 1,
        });
      
      const count = await propertyCollection.countDocuments();
      const result = await cursor.toArray();
      res.send({result, total:count});
    })

    app.get('/reviews', async (req, res) => {
      const cursor = propertyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/properties', async (req, res) => {
      const newProperty = req.body;
      const result = await propertyCollection.insertOne(newProperty);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
})
/**
 * const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

 */