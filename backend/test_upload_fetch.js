const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testUpload() {
    const token = jwt.sign({ id: '64e8b8c7b8c7b8c7b8c7b8c7', role: 'worker' }, process.env.JWT_SECRET || 'secret');

    const imagePath = path.join(__dirname, 'dummy.jpg');
    fs.writeFileSync(imagePath, Buffer.alloc(10 * 1024, 'X')); // 10KB dummy image

    // Since node fetch doesn't have a FormData built-in, we use the `form-data` package
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('title', 'Test Portfolio with Image Fetch');
    formData.append('description', 'Testing upload');
    formData.append('images', fs.createReadStream(imagePath), { filename: 'dummy.jpg', contentType: 'image/jpeg' });

    try {
        const fetch = (await import('node-fetch')).default;
        
        const res = await fetch('http://localhost:5000/api/portfolio', {
            method: 'POST',
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", data);
    } catch (error) {
        console.error("Fetch Exception:", error);
    } finally {
        if(fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
}
testUpload();
