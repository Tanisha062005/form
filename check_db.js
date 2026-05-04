const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://tani:17147714@tanisha0.vtvfjcy.mongodb.net/?appName=Tanisha0').then(async () => {
    const submissions = await mongoose.connection.collection('submissions').find().sort({ submittedAt: -1 }).limit(3).toArray();
    console.log(JSON.stringify(submissions, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
