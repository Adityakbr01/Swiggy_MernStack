export const  _config ={
    MONGO_URI:process.env.MONGO_URI as string,
    JWT_SECRET:process.env.JWT_SECRET as string,
    CLOUDINARY_CLOUD_NAME:process.env.CLOUDINARY_CLOUD_NAME as string,
    CLOUDINARY_API_KEY:process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_API_SECRET:process.env.CLOUDINARY_API_SECRET as string,
    REDIS_PORT:process.env.REDIS_PORT as string,
    REDIS_HOST:process.env.REDIS_HOST as string,
    REDIS_PASSWORD:process.env.REDIS_PASSWORD as string,
    SMTP_PASS:process.env.SMTP_PASS as string,
    SMTP_USER:process.env.SMTP_USER as string
}