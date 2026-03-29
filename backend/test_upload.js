const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testUpload() {
    // 1. Create a dummy user token
    const token = jwt.sign({ id: '64e8b8c7b8c7b8c7b8c7b8c7', role: 'worker' }, process.env.JWT_SECRET || 'secret');

    // 2. Create a dummy image
    const imagePath = path.join(__dirname, 'dummy.jpg');
    fs.writeFileSync(imagePath, Buffer.alloc(1024, 'dummy data'));

    // 3. Create FormData
    const formData = new FormData();
    formData.append('title', 'Test Portfolio with Image');
    formData.append('description', 'Testing upload');
    formData.append('images', fs.createReadStream(imagePath), { filename: 'dummy.jpg', contentType: 'image/jpeg' });

    try {
        const res = await axios.post('http://localhost:5000/api/portfolio', formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });
        console.log("Success! Response:");
        console.log("Images count:", res.data.data.images.length);
    } catch (error) {
        console.error("Upload failed!");
        if (error.response) {
            console.error(error.response.status, error.response.data);
        } else {
            console.error(error.message);
        }
    } finally {
        if(fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
}
testUpload();
