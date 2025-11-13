const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const SSLCommerzPayment = require("sslcommerz-lts");

const store_id = process.env.SSLC_STORE_ID;
const store_passwd = process.env.SSLC_STORE_PASS;
const is_live = false;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ppobgmi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection

    const database = client.db("Online-Course");
    const usersCollection = database.collection("users");
    const sliderCollection = database.collection("sliders");
    const categoriesCollection = database.collection("categories");
    const instructorsCollection = database.collection("instructors");
    const coursesCollection = database.collection("courses");
    const reviewsCollection = database.collection("reviews");
    const footerCollection = database.collection("footerInfo");
    const policiesCollection = database.collection("policies");

    // POST endpoint to save user data (with role)
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      // console.log(req.headers);
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Get role by email
    app.get("/users/role", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      if (!user) {
        return res.status(404).send({ role: null, message: "User not found" });
      }
      res.send({ role: user.role });
    });

    app.patch("/users/:id/role", async (req, res) => {
      const id = req.params.id;
      const { role } = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = { $set: { role } };
      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // DELETE endpoint to remove a user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // Add a new slider
    app.post("/slider", async (req, res) => {
      try {
        const slider = req.body;
        slider.createdAt = new Date();
        const result = await sliderCollection.insertOne(slider);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to add slider" });
      }
    });

    // Get all sliders
    app.get("/slider", async (req, res) => {
      try {
        const sliders = await sliderCollection.find().toArray();
        res.send(sliders);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch sliders" });
      }
    });

    // Get a single slider by ID
    app.get("/slider/:id", async (req, res) => {
      const id = req.params.id;
      const slider = await sliderCollection.findOne({ _id: new ObjectId(id) });
      res.send(slider);
    });

    // Update a slider by ID
    app.put("/slider/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const result = await sliderCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.send(result);
    });

    // Delete a slider by ID
    app.delete("/slider/:id", async (req, res) => {
      const id = req.params.id;
      const result = await sliderCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Add a new category
    app.post("/categories", async (req, res) => {
      const category = req.body;
      const result = await categoriesCollection.insertOne(category);
      res.send(result);
    });

    // Get all categories
    app.get("/categories", async (req, res) => {
      const result = await categoriesCollection.find().toArray();
      res.send(result);
    });

    // Get a single category by ID
    app.get("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const category = await categoriesCollection.findOne(query);
      res.send(category);
    });

    // Delete a category by ID
    app.delete("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await categoriesCollection.deleteOne(query);
      res.send(result);
    });

    // Update a category by ID
    app.put("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCategory = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: updatedCategory.name,
          status: updatedCategory.status,
        },
      };
      const result = await categoriesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //  Add a new instructor
    app.post("/instructors", async (req, res) => {
      try {
        const instructor = req.body;
        instructor.createdAt = new Date();
        const result = await instructorsCollection.insertOne(instructor);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to add instructor" });
      }
    });

    //  Get all instructors
    app.get("/instructors", async (req, res) => {
      try {
        const instructors = await instructorsCollection.find().toArray();
        res.send(instructors);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to fetch instructors" });
      }
    });

    //  Get single instructor by ID
    app.get("/instructors/:id", async (req, res) => {
      const id = req.params.id;
      const instructor = await instructorsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(instructor);
    });

    //  Update instructor
    app.put("/instructors/:id", async (req, res) => {
      const id = req.params.id;
      const updated = req.body;
      const result = await instructorsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updated }
      );
      res.send(result);
    });

    //  Delete instructor
    app.delete("/instructors/:id", async (req, res) => {
      const id = req.params.id;
      const result = await instructorsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Add a new course
    app.post("/courses", async (req, res) => {
      try {
        const course = req.body;
        course.createdAt = new Date();

        const result = await coursesCollection.insertOne(course);
        res.send(result);
      } catch (error) {
        console.error("❌ Error adding course:", error);
        res.status(500).send({ error: "Failed to add course" });
      }
    });

    // Get all courses (optionally only active)
    app.get("/courses", async (req, res) => {
      try {
        const { status } = req.query;
        const query = status ? { status } : {};
        const courses = await coursesCollection.find(query).toArray();
        res.send(courses);
      } catch (error) {
        console.error("❌ Error fetching courses:", error);
        res.status(500).send({ error: "Failed to fetch courses" });
      }
    });

    // Get single course by ID
    app.get("/courses/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const course = await coursesCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!course) return res.status(404).send({ error: "Course not found" });
        res.send(course);
      } catch (error) {
        console.error("❌ Error fetching single course:", error);
        res.status(500).send({ error: "Failed to fetch course" });
      }
    });

    // Update course
    app.put("/courses/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updated = req.body;
        const result = await coursesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updated }
        );
        res.send(result);
      } catch (error) {
        console.error("❌ Error updating course:", error);
        res.status(500).send({ error: "Failed to update course" });
      }
    });

    // Delete course
    app.delete("/courses/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await coursesCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (error) {
        console.error("❌ Error deleting course:", error);
        res.status(500).send({ error: "Failed to delete course" });
      }
    });

    // POST Review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    // GET Reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    // DELETE: Delete a review by ID
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    });

    // Add Footer Info
    app.post("/footer", async (req, res) => {
      try {
        const footer = { ...req.body, createdAt: new Date() };
        const result = await footerCollection.insertOne(footer);
        res.send({ insertedId: result.insertedId });
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to add footer" });
      }
    });

    // Get All Footers
    app.get("/footer", async (req, res) => {
      try {
        const allFooters = await footerCollection.find().toArray();
        res.send(allFooters);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch footers" });
      }
    });

    // Update Footer
    app.put("/footer/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await footerCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: req.body },
          { returnDocument: "after" }
        );
        res.send(result.value);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to update footer" });
      }
    });

    // Delete Footer
    app.delete("/footer/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await footerCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to delete footer" });
      }
    });

    // Add a new policy
    app.post("/policies", async (req, res) => {
      try {
        const policy = req.body;
        policy.createdAt = new Date();
        const result = await policiesCollection.insertOne(policy);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to add policy" });
      }
    });

    // Get all policies
    app.get("/policies", async (req, res) => {
      try {
        const policies = await policiesCollection.find().toArray();
        res.send(policies);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch policies" });
      }
    });

    // Get a single policy by ID
    app.get("/policies/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const policy = await policiesCollection.findOne({
          _id: new ObjectId(id),
        });
        res.send(policy);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch policy" });
      }
    });

    // Update a policy by ID
    app.put("/policies/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = req.body;
        const result = await policiesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to update policy" });
      }
    });

    // Delete a policy by ID
    app.delete("/policies/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await policiesCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to delete policy" });
      }
    });

    app.post("/initiate-payment", async (req, res) => {
      const { courseId, courseTitle, amount, name, email, phone, address } =
        req.body;

      const tran_id = `TXN_${new Date().getTime()}`; // unique transaction ID

      const data = {
        total_amount: amount,
        currency: "BDT",
        tran_id,
        success_url: `http://localhost:5000/payment/success/${tran_id}`, //Backend domain
        fail_url: `http://localhost:5000/payment/fail/${tran_id}`, //Backend domain
        cancel_url: `http://localhost:5000/payment/cancel/${tran_id}`, //Backend domain
        ipn_url: `http://localhost:5000/payment/ipn`,
        shipping_method: "NO",
        product_name: courseTitle,
        product_category: "Course",
        product_profile: "general",
        cus_name: name,
        cus_email: email,
        cus_add1: address,
        cus_city: "Bangladesh",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: phone,
      };

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse) => {
        // Redirect the user to SSLCommerz Gateway
        const GatewayPageURL = apiResponse.GatewayPageURL;
        res.send({ url: GatewayPageURL });
      });
    });

    app.post("/payment/success/:tranId", async (req, res) => {
      const { tranId } = req.params;

      // Here you can mark the payment as "Paid" in your database
      console.log("Payment Success for transaction:", tranId);

      // Redirect the user to frontend success page
      res.redirect(`http://localhost:5173/payment/success?tranId=${tranId}`);
    });

    app.post("/payment/fail/:tranId", async (req, res) => {
      const { tranId } = req.params;
      console.log("Payment Failed:", tranId);
      res.redirect(`http://localhost:5173/payment/fail?tranId=${tranId}`);
    });

    app.post("/payment/cancel/:tranId", async (req, res) => {
      const { tranId } = req.params;
      console.log("Payment Canceled:", tranId);
      res.redirect(`http://localhost:5173/payment/cancel?tranId=${tranId}`);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to you in Online Course page");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
