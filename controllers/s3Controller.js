const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3');

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, Date.now().toString()+ '-' + file.originalname);
        },
    }),
})
exports.uploadVideo = (req, res) => {
  res.json({ url: req.file.location });
};

exports.downloadVideo = (req, res) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.params.key
    }
    s3.getObject(params, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.send(data.Body)
        }
    })
}