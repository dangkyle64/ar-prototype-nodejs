import express from 'express';
import cors from 'cors';
import { runPipeline } from './docker_services/colmapPipeline.js';
import { uploadVideoController } from './controllers/uploadVideoController.js';

const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    'https://ar-prototype-nextjs.vercel.app/',
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

app.use('/api/video-upload', uploadVideoController);

/*
app.get('/', async (request, response) => {
    try {
        await runPipeline();
        response.status(200).json({ message: 'Pipeline COLMAP successful '});
    } catch(error) {
        response.status(500).json({ error: 'Error loading pipeline' });
    };
});
*/
const port = 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
};