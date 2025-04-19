import express from 'express';
import cors from 'cors';
import uploadVideoRouter from './routers/uploadVideoRouter.js';
import getPlyRouter from './routers/getPlyRouter.js';

const app = express();

let allowedOrigins = [];

if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
};

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

app.use('/api/video-upload', uploadVideoRouter);
app.use('/api/ply-upload', getPlyRouter);

const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
