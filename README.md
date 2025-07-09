# VIDTUBE

A full-stack video sharing platform built with Node.js, Express, and MongoDB. This is the backend repository for the VIDTUBE application.

## Features

- User authentication and authorization
- Video upload and streaming
- Like/Dislike videos
- Subscribe to channels
- Create and manage playlists
- Tweet-like functionality
- Comment system

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **File Storage**: (To be determined - AWS S3 or similar)
- **API Documentation**: (To be added)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas or local MongoDB instance
- (Optional) Redis for caching

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/subhojitp7/vidtube.git
   cd vidtube
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory and add your environment variables:

   ```
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=http://localhost:3000
   # Add other environment variables as needed
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## API Endpoints

### Authentication

- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/current-user` - Get current user details

### Videos

- `GET /api/v1/videos` - Get all videos
- `POST /api/v1/videos` - Upload a new video
- `GET /api/v1/videos/:videoId` - Get video details

### Subscriptions

- `POST /api/v1/subscriptions/:channelId` - Subscribe to a channel
- `DELETE /api/v1/subscriptions/:channelId` - Unsubscribe from a channel

### Playlists

- `POST /api/v1/playlists` - Create a new playlist
- `GET /api/v1/playlists/:playlistId` - Get playlist details
- `PATCH /api/v1/playlists/:playlistId` - Update playlist

## Environment Variables

- `PORT` - Server port (default: 8000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `CORS_ORIGIN` - Allowed CORS origins

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [@subhojitpaul07](https://www.linkedin.com/in/subhojitpaul07/)

Project Link: [https://github.com/subhojitp7/vidtube](https://github.com/subhojitp7/vidtube)
