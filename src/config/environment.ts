

export const config = {
    port: process.env.PORT || 'default',
    mongoURI: process.env.MONGO_URI || 'default',
    jwtSecret: process.env.JWT_SECRET || 'default',
    nodeEnv: process.env.NODE_ENV || 'default'
}