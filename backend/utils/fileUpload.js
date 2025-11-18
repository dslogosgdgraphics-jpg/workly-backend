const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (FREE tier - 25GB storage)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
    api_key: process.env.CLOUDINARY_API_KEY || 'demo',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

// Upload file to Cloudinary
exports.uploadFile = async (file) => {
    try {
        // Convert buffer to base64
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'emplystack',
            resource_type: 'auto',
            transformation: file.mimetype.startsWith('image/') ? [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto:good' }
            ] : undefined
        });
        
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('File upload failed');
    }
};

// Delete file from Cloudinary
exports.deleteFile = async (fileUrl) => {
    try {
        // Extract public_id from URL
        const parts = fileUrl.split('/');
        const filename = parts[parts.length - 1];
        const publicId = `emplystack/${filename.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return false;
    }
};

// Alternative: Simple local storage (if you don't want Cloudinary)
exports.uploadFileLocal = async (file) => {
    const fs = require('fs').promises;
    const path = require('path');
    
    const uploadDir = path.join(__dirname, '../uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(uploadDir, filename);
    
    await fs.writeFile(filepath, file.buffer);
    
    return `/uploads/${filename}`;
};