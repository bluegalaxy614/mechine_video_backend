require('dotenv').config();
const User = require('../models/User');
const s3Client = require('../config/awsS3');

// Function to upload file to S3
const uploadFileToS3 = async (fileBuffer, fileName, contentType) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        // ACL: 'public-read',  // Public access for the file
        ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    return s3Client.send(command);
};

const deleteFileFromS3 = async (key) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME, // S3 bucket name
        Key: key, // File name (or path) in the S3 bucket
    };

    try {
        // Create a DeleteObjectCommand and send it
        const command = new DeleteObjectCommand(params);
        const data = await s3Client.send(command);
    } catch (err) {
        console.error("Error deleting file:", err.message);
    }
};

const updateProfile = async (req, res) => {
    const userId = req.userId;
    try{
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({message: 'ユーザーが見つかりません。'});
        }
        
        const deleteUserAvatar = await deleteFileFromS3(`avatars/${user.avatar}`)

        const avatar = req.files['avatar'][0];

        const avatarName = `avatars/${user.name}${path.extname(avatar.originalname)}`;
        const avatarS3Response = await uploadFileToS3(avatar.buffer, avatarName, avatar.mimetype);
        const avatarUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${avatarName}`;

        user.avatar = avatarUrl;
        await user.save();

        res.status(200).json(
            {
                message: 'プロフィールが正常に更新されました。',
                user: {
                    avatar: avatarUrl
                }
            }
        );
    }catch(err){
        res.status(500).json({message: 'Internal server error'});
    }
}

module.exports = {
    updateProfile
}