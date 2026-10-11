import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import complaintsRouter from './routes/complaints';
import votesRouter from './routes/votes';
import adminRouter from './routes/admin';
import priorityRouter from './routes/priority';
import { Storage } from './storage';

dotenv.config();
// Ensure storage is initialized
Storage; // just to trigger constructor

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/votes', votesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/priority', priorityRouter);

export default app;

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
  });
}
