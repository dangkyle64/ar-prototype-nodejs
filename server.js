import express from 'express';
import cors from 'cors';

//route here
import uploadVideoRoute from './routers/uploadVideoRoutes.js';

const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    'https://ar-furniture-ecru.vercel.app',
];

app.use(cors({
    origin: function (origin, callback) {
        console.log('Request Origin:', origin);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));  
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  
    allowedHeaders: ['Content-Type', 'Authorization'],  
    credentials: true, 
}));

app.use(express.json());
app.use(express.static('public'));

const port = 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
};