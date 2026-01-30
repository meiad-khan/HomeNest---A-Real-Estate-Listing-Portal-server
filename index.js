const express = require('express');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
      const {
        limit = 0,
        skip = 0,
        sort = "price",
        order = "asc",
        search = "",
      } = req.query;
      const email = req.query.email;
      // console.log('email is ', email);
      const query = {};

      if (email) query.userEmail = email;

      const sortOption = {};
      sortOption[sort || "price"] = order === "asc" ? 1 : -1;
      // console.log(sortOption);

      if (search) {
        query.$or = [
          {location: {$regex: search, $options:'i'}},
          {propertyName: {$regex: search, $options:'i'}},
          {category: {$regex: search, $options:'i'}}
        ]
      }
      /**
       * 
  if (search) {
    query.$or = [
      { location: { $regex: search, $options: 'i' } },
      { propertyName: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }
       */
      const cursor = propertyCollection
        .find(query)
        .sort(sortOption)
        .limit(Number(limit))
        .skip(Number(skip))
        .project({
          image: 1,
          propertyName: 1,
          description:1,
          category: 1,
          userName: 1,
          location: 1,
          price: 1,
          createdAt:1,
        });

      const count = await propertyCollection.countDocuments(query);
      const result = await cursor.toArray();
      res.send({ result, total: count });
    })

    app.get('/properties/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertyCollection.findOne(query);
      res.send(result);
    })

    app.get('/reviews/:propertyId', async (req, res) => {
      const id = req.params.propertyId;
      const query = { propertyId : id};
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/reviews', async (req, res) => {
      const email = req.query.email;
      // console.log('email is ', email);
      // const query = {};
      // if()
      const result = await reviewCollection.find({ ownerEmail: email}).toArray();
      res.send(result);
    })

    app.post("/properties", async (req, res) => {
      const newProperty = {
        ...req.body,
        createdAt: new Date(), 
      };

      const result = await propertyCollection.insertOne(newProperty);
      res.send(result);
    });

    app.patch('/properties/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const updatedProperty = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: updatedProperty
      };
      const result = await propertyCollection.updateOne(query, update);
      res.send(result);
    })

    app.delete("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertyCollection.deleteOne(query);
      res.send(result);
    });


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