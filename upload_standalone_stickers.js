const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const stickersDir = 'F:\\downloads\\chatly_whatsapp_style_lottie (1)';
const outputDir = path.join(__dirname, 'standalone_stickers');
const finalConfig = [];

async function uploadRawFile(filePath, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      public_id: publicId,
      overwrite: true
    }, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
  });
}

async function processStickers() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(stickersDir);
  const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'stickers.json' && f !== 'bouncing_ball.json' && f !== 'spinning_square.json' && f !== '12_secret.json' && f !== '13_melting.json').sort();

  console.log(`Found ${jsonFiles.length} stickers to process.`);

  for (const file of jsonFiles) {
    const baseName = path.basename(file, '.json');
    const id = baseName.replace(/^\d+_/, ''); // e.g. 01_heyyy -> heyyy

    const jsonPath = path.join(stickersDir, file);
    const imagePath = path.join(stickersDir, 'images', `${baseName}.png`);
    const outJsonPath = path.join(outputDir, `${id}.json`);

    // Read Lottie JSON and embed base64 image
    const lottieData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (fs.existsSync(imagePath)) {
      const imgBuf = fs.readFileSync(imagePath);
      const b64 = 'data:image/png;base64,' + imgBuf.toString('base64');
      if (lottieData.assets && lottieData.assets.length > 0) {
        lottieData.assets[0].p = b64;
        lottieData.assets[0].u = '';
        lottieData.assets[0].e = 1;
      }
    }

    fs.writeFileSync(outJsonPath, JSON.stringify(lottieData));
    console.log(`Created standalone JSON for ${id} (size: ${fs.statSync(outJsonPath).size} bytes)`);

    // Format display name
    let name = id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (id === 'heyyy') name = 'Heyyy!';
    if (id === 'lol') name = 'LOL';
    if (id === 'please') name = 'Please?';
    if (id === 'yooo') name = 'Yooo!';
    if (id === 'watching') name = "I'm Watching";
    if (id === 'im_dead') name = "I'm Dead";
    if (id === 'ouch') name = 'Ouch!';

    console.log(`Uploading ${id}.json to Cloudinary...`);
    try {
      const publicId = `stickers/chatly_pack/${id}.json`;
      const url = await uploadRawFile(outJsonPath, publicId);
      console.log(`Uploaded ${id}! URL: ${url}`);
      
      finalConfig.push({
        id: id,
        path: url,
        name: name
      });
    } catch (e) {
      console.error(`Failed to upload ${id}:`, e);
    }
  }

  // Create the final config
  const configObj = [
    {
      packId: 'chatly_mascot',
      packName: 'Chatly Mascot',
      stickers: finalConfig
    }
  ];

  const configPath = path.join(__dirname, 'stickers_config.json');
  fs.writeFileSync(configPath, JSON.stringify(configObj, null, 2));
  console.log('Done! Wrote config to', configPath);
  
  // Upload config to Cloudinary
  console.log('Uploading config to Cloudinary...');
  try {
    const configUrl = await uploadRawFile(configPath, 'stickers/stickers_config.json');
    console.log(`Config uploaded successfully! URL: ${configUrl}`);
  } catch (e) {
    console.error('Failed to upload config:', e);
  }
}

processStickers();
