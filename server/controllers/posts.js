const db = require('../config/db');

function normalizeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function submitPost(req, res) {
  const userId = req.user?.sub;
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const excerpt = typeof req.body.excerpt === 'string' ? req.body.excerpt.trim() : '';
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
  const slugInput = typeof req.body.slug === 'string' ? req.body.slug : '';
  const slug = normalizeSlug(slugInput) || normalizeSlug(title);
  const readingTime = Number.parseInt(req.body.reading_time, 10);

  const missingFields = [];

  if (!userId) missingFields.push('user');
  if (!title) missingFields.push('title');
  if (!slug) missingFields.push('slug');
  if (!excerpt) missingFields.push('excerpt');
  if (!content) missingFields.push('content');

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`,
    });
  }

  if (!Number.isInteger(readingTime) || readingTime <= 0) {
    return res.status(400).json({
      success: false,
      message: 'reading_time must be a positive integer',
    });
  }

  try {
    const [existingRows] = await db.query('SELECT id FROM posts WHERE slug = ? LIMIT 1', [slug]);

    if (existingRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Slug already exists. Please choose a different slug.',
      });
    }

    const [result] = await db.query(
      `INSERT INTO posts (
        user_id,
        title,
        slug,
        excerpt,
        content,
        cover_image,
        status,
        reading_time,
        published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        slug,
        excerpt,
        content,
        null,
        'published',
        readingTime,
        new Date(),
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Post published successfully.',
      post: {
        id: result.insertId,
        user_id: userId,
        title,
        slug,
        excerpt,
        content,
        cover_image: null,
        status: 'published',
        reading_time: readingTime,
      },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Slug already exists. Please choose a different slug.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to publish post',
      error: error.message,
    });
  }
}

module.exports = {
  submitPost,
};
