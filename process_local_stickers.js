const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const stickersDir = 'F:\\downloads\\chatly_whatsapp_style_lottie (1)';
const outputDir = 'f:\\Chatly\\chatly\\assets\\stickers';

async function processStickers() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(stickersDir);
  const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'stickers.json' && f !== 'bouncing_ball.json' && f !== 'spinning_square.json' && f !== '12_secret.json' && f !== '13_melting.json').sort();

  console.log(`Found ${jsonFiles.length} stickers to process.`);

  const finalConfig = [];

  for (const file of jsonFiles) {
    const baseName = path.basename(file, '.json');
    const id = baseName.replace(/^\d+_/, ''); // e.g. 01_heyyy -> heyyy

    const jsonPath = path.join(stickersDir, file);
    const imagePath = path.join(stickersDir, 'images', `${baseName}.png`);
    // Keeping the original filename format (with digits) for the assets, as it preserves order and old messages use it.
    const outJsonPath = path.join(outputDir, file); 

    const lottieData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (fs.existsSync(imagePath)) {
      const imgBuf = fs.readFileSync(imagePath);
      // Convert to WebP
      const webpBuf = await sharp(imgBuf).webp({ quality: 75 }).toBuffer();
      
      const b64 = 'data:image/webp;base64,' + webpBuf.toString('base64');
      if (lottieData.assets && lottieData.assets.length > 0) {
        lottieData.assets[0].p = b64;
        lottieData.assets[0].u = '';
        lottieData.assets[0].e = 1;
      }
    }

    fs.writeFileSync(outJsonPath, JSON.stringify(lottieData));
    console.log(`Created WebP JSON for ${file}`);

    let name = id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (id === 'heyyy') name = 'Heyyy!';
    if (id === 'lol') name = 'LOL';
    if (id === 'please') name = 'Please?';
    if (id === 'yooo') name = 'Yooo!';
    if (id === 'watching') name = "I'm Watching";
    if (id === 'im_dead') name = "I'm Dead";
    if (id === 'ouch') name = 'Ouch!';

    finalConfig.push({
      id: id,
      path: `assets/stickers/${file}`,
      name: name
    });
  }

  const configObj = [
    {
      packId: 'chatly_mascot',
      packName: 'WhatsApp Style',
      stickers: finalConfig
    }
  ];

  const configPath = path.join(outputDir, 'stickers_config.json');
  fs.writeFileSync(configPath, JSON.stringify(configObj, null, 2));
  console.log('Done! Wrote local config to', configPath);
}

processStickers().catch(console.error);
