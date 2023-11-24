import express from 'express';
import cors from 'cors';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/paklik', (req,res) => {
    
    const client = getClient();

    async function run() {
      try {
        await client.connect();
        const collection = client.db("leitner_app").collection("szavak");
        const result = await collection.find().toArray();        
        res.send(result)
    } finally {
        await client.close();
      }
    }
    run().catch(console.dir);

})

app.post('/createWord', (req,res) => {

  const id = new ObjectId(req.body.id);
  
  const newWord = {
    id: uniqueId(),
    magyar: req.body.magyar,
    idegen: req.body.angol,
    jo: 0,
    rossz: 0,
  }

  const client = getClient();

  async function run() {
    try {
      await client.connect();
      const collection = client.db("leitner_app").collection("szavak");
      const result = await collection.findOne({_id: id});
      const tomb = result.szavak;
      tomb[0].push(newWord);
      const result2 = await collection.findOneAndUpdate(
        {_id: id},
        {$set: { szavak: tomb }}
      );
      res.send('ok');

      
  } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
})

app.post('/createPakli', (req,res) => {

  const {name} = req.body;
  const newPakli = {
    title: name,
    szavak: [
      [], [], [], [], []
    ]
  }
  
  const client = getClient();

  async function run() {
    try {
      await client.connect();
      const collection = client.db("leitner_app").collection("szavak");
      const result = await collection.insertOne(newPakli);
      
      res.send('ok');
      
  } finally {
      await client.close();
    }
  }
  run().catch(console.dir);

})

app.delete('/deleteWord', (req,res) => {

  const {torlesIds} = req.body;
  const id = new ObjectId(req.body.activeId)

  const client = getClient();

  async function run() {
    try {
      await client.connect();
      const collection = client.db("leitner_app").collection("szavak");
      const result = await collection.findOne({_id: id});
      const tomb = result.szavak;
      for(let g = 0; g < torlesIds.length; g++) {
        
        for(let i = 0; i < tomb.length; i++) {
          for(let k = 0; k < tomb[i].length; k++) {
            if(tomb[i][k].id===torlesIds[g]) {
              tomb[i].splice(k, 1);
            }
          }
        }
      }
      const result2 = await collection.findOneAndUpdate(
        {_id: id},
        {$set: { szavak: tomb }}
      );
      res.send('ok');

      
  } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
})

app.delete('/deletePakli', (req,res) => {

  const id = new ObjectId(req.body.id);
  const client = getClient();

  async function run() {
    try {
      await client.connect();
      const collection = client.db("leitner_app").collection("szavak");
      const result = await collection.deleteOne({_id: id});

      res.send('ok');

      
  } finally {
      await client.close();
    }
  }
  run().catch(console.dir);

})


app.put('/jatek', (req,res) => {

  const {jok, rosszak, activeLevel} = req.body;
  const id = new ObjectId(req.body.id);
  if(jok.length!==0) {
    for(let i = 0; i < jok.length; i++) {
      jok[i].jo += 1;
    }  
  }
  if(rosszak.length!==0) {
    for(let i = 0; i < rosszak.length; i++) {
      rosszak[i].rossz += 1;
    }  
  }
  const client = getClient();

  async function run() {
    try {
      await client.connect();
      const collection = client.db("leitner_app").collection("szavak");
      const result = await collection.findOne({_id: id});
      let tomb = result.szavak;
      res.send(tomb)
  /*
      tomb[0].push(newWord);
      const result2 = await collection.findOneAndUpdate(
        {_id: id},
        {$set: { szavak: tomb }}
      );
      res.send('ok');
*/
      
  } finally {
      await client.close();
    }
  }
  run().catch(console.dir);

})

app.listen(7001, () => {
    console.log('Sikeres szerver csatlakozás!');
})

function getClient() {
    const uri = "mongodb+srv://csebifamily:TewhWusR3TcXD5lG@cluster0.fe6n6dw.mongodb.net/?retryWrites=true&w=majority";    
    return new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });    
}

function uniqueId() {
  // desired length of Id
  var idStrLen = 32;
  // always start with a letter -- base 36 makes for a nice shortcut
  var idStr = (Math.floor((Math.random() * 25)) + 10).toString(36) + "_";
  // add a timestamp in milliseconds (base 36 again) as the base
  idStr += (new Date()).getTime().toString(36) + "_";
  // similar to above, complete the Id using random, alphanumeric characters
  do {
    idStr += (Math.floor((Math.random() * 35))).toString(36);
  } while (idStr.length < idStrLen);

  return (idStr);
}