import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import countryRoutes from './routes/countryRoutes';

const app: Application = express();
const port: number = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Use country routes
app.use('/', countryRoutes);

//Handle error
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);

    // Gracefully shutdown the server
    server.close(() => {
        console.log('Server is shutting down due to an uncaught exception.');
        process.exit(1); // Exit the process with a non-zero status code
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);

    // Gracefully shutdown the server
    server.close(() => {
        console.log('Server is shutting down due to an unhandled promise rejection.');
        process.exit(1); // Exit the process with a non-zero status code
    });
});