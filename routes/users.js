require('dotenv').config()
const express = require('express');
const app = express();

const fs = require('fs');
const mongodb = require('mongodb');
const client = new mongodb.MongoClient(process.env.MONGO_URI);
const db = client.db('gridFS');
const bucket = new mongodb.GridFSBucket(db, {bucketName: 'userImgs'});

(async () => {
    await client.connect();
})();

app.get('/api/v1/users', async (req, res) => {
    try{
        const users = await db.collection('gridFS').find({}).toArray();
        res.send(users);
    }catch(error){
        res.status(500).json({msg:error})
    }
})

app.post('/api/v1/users', async (req, res) =>{
    try{
        const user = { _id: req.body.name, imgs: [] };

        const match = await db.collection('gridFS').findOne({_id: req.body.name});
        if(match) return res.redirect('/');

        const createImg = image => {
            const imgId = (mongodb.ObjectId()).toString();
            user.imgs.push(imgId);

            fs.writeFileSync(`./${imgId}.png`, image.data, { encoding: 'base64' });
            fs.createReadStream(`./${imgId}.png`).pipe(bucket.openUploadStream(imgId, {
                chunkSizeBytes: 1048576
            })).on('finish', () => {
                fs.unlinkSync(`./${imgId}.png`)
            });
        }
        if(req.files.img.length){
            req.files.img.forEach(image => {
                createImg(image);
            })
        } else {
            createImg(req.files.img);
        }

        await db.collection('gridFS').insertOne(user);

        res.redirect('/')
    }catch(error){
        res.status(500).json({ msg: error})
    }
})

module.exports = app;