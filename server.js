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

app.put('/athelyez', (req, res) => {

  const osszesSzo = req.body.osszesSzo;
  const tanuloId = new ObjectId(req.body.tanuloId);
  const hova = new ObjectId(req.body.hova);

  const client = getClient();
  async function run() {
    try {
      await client.connect();
      const collection = client.db("leitner_app").collection("szavak");
      const result = await collection.findOne({_id: hova});
      const tomb = result.szavak;
      for(let i = 0; i < osszesSzo.length; i++) {
        tomb[0].push({
          id: osszesSzo[i].id,
          magyar: osszesSzo[i].magyar,
          idegen: osszesSzo[i].idegen,
          jo: 0,
          rossz: 0,
        });
      }
      const result2 = await collection.findOneAndUpdate(
        {_id: hova},
        {$set: { szavak: tomb }}
      );
      const tomb2 = [
        [], [], [], [], []
      ]
      const result3 = await collection.findOneAndUpdate(
        {_id: tanuloId},
        {$set: { szavak: tomb2 }}
      );
      res.send('ok');
/*      
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

app.put('/jatek', (req,res) => {
  const {jok, rosszak, level} = req.body;
  const id = new ObjectId(req.body.id);
  const index = Number(level);
  
  const client = getClient();
  async function run() {
    try {
      await client.connect();
      const collection = client.db("leitner_app").collection("szavak");
      const result = await collection.findOne({_id: id});
      const tomb = result.szavak;
      const torolniKell = [];
      if(jok.length!==0) {
        for(let i = 0; i < jok.length; i++) {
          if(level===5) {
            jok[i].jo += 1;
            tomb[level-1].push(jok[i]);
            torolniKell.push({level: level-1, id: jok[i].id});
          }else{  
            jok[i].jo += 1;
            tomb[level].push(jok[i]);
            torolniKell.push({level: level-1, id: jok[i].id});
          }
        }
      }
      if(rosszak.length!==0) {
        for(let i = 0; i < rosszak.length; i++) {
          rosszak[i].rossz += 1;
          tomb[0].push(rosszak[i]);
          torolniKell.push({level: level-1, id: rosszak[i].id});
        }  
      }
      if(torolniKell.length!==0) {
        for(let i = 0; i < torolniKell.length; i++) {
          const index = tomb[torolniKell[i].level].findIndex((content) => content.id === torolniKell[i].id);
          tomb[torolniKell[i].level].splice(index, 1);
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