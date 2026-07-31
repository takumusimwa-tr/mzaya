const storage = require('../storage');

async function generateThumbnail({
  attachment,
  sourceBuffer,
  imageProcessor,
}) {
  if (attachment.media_kind !== 'image') return null;

  const thumbnailBuffer = await imageProcessor(sourceBuffer)
    .rotate()
    .resize({
      width: 480,
      height: 480,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 78 })
    .toBuffer();

  const thumbnailKey = `${attachment.storage_key}.thumb.webp`;

  await storage.putBuffer({
    key: thumbnailKey,
    buffer: thumbnailBuffer,
    contentType: 'image/webp',
  });

  await attachment.update({
    thumbnail_key: thumbnailKey,
  });

  return thumbnailKey;
}

module.exports = {
  generateThumbnail,
};
