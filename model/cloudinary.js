const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// UPLOAD PROFILE PIC
module.exports.uploadImage = function uploadImage(image) {
    return new Promise((resolve, reject) => {
        if (image) {
            cloudinary.uploader.upload(
                image.path,
                { resource_type: 'image' },
                (error, result) => {
                    if (error || !result) {
                        console.error('Image upload failed:', error);
                        reject(new Error('Image upload failed'));
                    } else {
                        resolve(result.secure_url);
                    }
                }
            );
        } else {
            resolve(null);
        }
    });
}

// Signature Upload 
module.exports.uploadSignature = function uploadSignature(file) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    return new Promise((resolve, reject) => {
        if (file) {
            cloudinary.uploader.upload(file, { resource_type: 'image', format: 'png' }, (err, result) => {
                if (err) {
                    reject(new Error('Signature upload failed'));
                } else {
                    resolve(result.secure_url);
                }
            }
            );
        }
        else {
            resolve(null);
        }
    });
}
