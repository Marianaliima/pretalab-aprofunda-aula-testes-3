export const config = {
    port: process.env.PORT || 3000,
    mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/blog',
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    nodeEnv: process.env.NODE_ENV || 'development'
}