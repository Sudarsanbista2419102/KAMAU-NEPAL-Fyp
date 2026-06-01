import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing MongoDB connection...');
console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('Connected to:', process.env.MONGO_URI);
    
    // Try to create a test collection
    const testSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model('test', testSchema);
    
    const testDoc = new TestModel({ name: 'test' });
    testDoc.save().then(() => {
      console.log('✅ Test document saved successfully!');
      process.exit(0);
    }).catch(err => {
      console.error('❌ Error saving test document:', err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
