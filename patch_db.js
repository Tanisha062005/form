const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://tani:17147714@tanisha0.vtvfjcy.mongodb.net/?appName=Tanisha0').then(async () => {
    // find the submission and update it with a fake url
    await mongoose.connection.collection('submissions').updateOne(
        { _id: new mongoose.Types.ObjectId("69f8701f4def410b287b3c93") },
        { 
            $set: { 
                "answers.wrUg4xO0LR8PuEfOrOKTg.url": "https://res.cloudinary.com/demo/image/upload/sample.pdf"
            }
        }
    );
    console.log("Updated document!");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
