const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lxaloof.mongodb.net/?retryWrites=true&w=majority`;

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

        const taskCollection = client.db('TaskDB').collection('Task');
        const projectCollection = client.db('TaskDB').collection('Project');
        const userCollection = client.db('TaskDB').collection('users');

        //project related api
        app.get('/getproject', async (req, res) => {

            const result = await projectCollection.find().toArray();
            res.send(result);
        })


        //user related api
        app.get('/user', async (req, res) => {

            const result = await userCollection.find().toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }

            const exitingUser = await userCollection.findOne(query);
            if (exitingUser) {
                return res.send({ message: 'user already exists', insertedId: null });
            }

            const result = await userCollection.insertOne(user)
            res.send(result)
        })


        //task related api
        app.get('/newtaskget', async (req, res) => {

            const result = await taskCollection.find().toArray();
            res.send(result);
        })

        app.post('/postnewtask', async (req, res) => {
            const newdata = req.body;
            console.log(newdata);
            const result = await taskCollection.insertOne(newdata);
            res.send(result);
        })

        app.get('/tasksemail', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await taskCollection.find(query).toArray();
            res.send(result);
        })


        app.delete('/taskdelete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/taskupdate/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.findOne(query);
            res.send(result);
        });

        //update task
        app.put('/updatetasks/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedProduct = req.body;
            const product = {
                $set: {
                    titles: updatedProduct.titles,
                    description: updatedProduct.description,
                    deadline: updatedProduct.deadline,
                    priority: updatedProduct.priority,
                    email: updatedProduct.email,
                    
                }
            }
          

            const result = await taskCollection.updateOne(filter, product, options);
            res.send(result);

        })



       




        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Task-management is running')
})

app.listen(port, () => {
    console.log(`Task-management server is running on port: ${port}`);
})

