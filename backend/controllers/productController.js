const slugify = require('slugify');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelper');
const { logAdminActivity } = require('../utils/activityLogger');

function normalizeGalleryImages(images = []) {
  if (!Array.isArray(images) || images.length === 0) return [];
  let mainAssigned = false;
  const normalized = images.map((img, idx) => {
    const isThisMain = Boolean(img.isMain) && !mainAssigned;
    if (isThisMain) mainAssigned = true;
    return {
      ...img,
      isMain: isThisMain,
      order: typeof img.order === 'number' ? img.order : idx,
    };
  });
  if (!mainAssigned && normalized.length > 0) {
    normalized[0].isMain = true;
  }
  return normalized.map((img, idx) => ({ ...img, order: idx }));
}

async function resolveCategoryId(categoryInput) {
  if (!categoryInput) return null;
  const raw =
    typeof categoryInput === 'object'
      ? categoryInput._id || categoryInput.slug || categoryInput.name
      : String(categoryInput).trim();
  if (!raw) return null;

  if (/^[0-9a-fA-F]{24}$/.test(raw)) {
    const byId = await Category.findById(raw);
    if (byId) return byId._id;
  }

  const bySlugOrName = await Category.findOne({
    $or: [
      { slug: raw.toLowerCase() },
      { name: new RegExp(`^${raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    ],
  });
  if (bySlugOrName) return bySlugOrName._id;

  const firstCat = await Category.findOne().sort({ displayOrder: 1 });
  return firstCat ? firstCat._id : null;
}

function parseStringOrArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      return [val];
    }
  }
  return [];
}

// GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const {
      category,
      collection,
      metalType,
      occasion,
      stone,
      minPrice,
      maxPrice,
      search,
      featured,
      newArrival,
      bestseller,
      includeInactive,
      demoOnly,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};
    if (includeInactive !== 'true') {
      filter.isActive = true;
    }
    if (demoOnly === 'true') {
      filter.isDemoProduct = true;
    }
    if (category) {
      const catDoc = await Category.findOne({
        $or: [
          { slug: category },
          { name: category },
          ...(category.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: category }] : []),
        ],
      });
      if (catDoc) filter.category = catDoc._id;
    }
    if (collection && collection.match(/^[0-9a-fA-F]{24}$/)) {
      filter.collectionRef = collection;
    }
    if (metalType) filter.metalType = metalType;
    if (occasion) filter.occasion = occasion;
    if (stone) filter.stoneDetails = { $regex: stone, $options: 'i' };
    if (featured === 'true') filter.isFeatured = true;
    if (newArrival === 'true') filter.isNewArrival = true;
    if (bestseller === 'true') filter.isBestseller = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { sku: regex },
        { shortDescription: regex },
        { stoneDetails: regex },
        { metalType: regex },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'popular') sortOption = { viewsCount: -1, enquiriesCount: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('collectionRef', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:idOrSlug
exports.getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug.toLowerCase() }] }
      : { slug: idOrSlug.toLowerCase() };

    const product = await Product.findOne(query)
      .populate('category', 'name slug')
      .populate('collectionRef', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Jewellery piece not found in the AARANYA catalogue.',
      });
    }

    const similarProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category?._id,
      isActive: true,
    })
      .limit(4)
      .select('name slug sku price originalPrice metalType purity images isDemoProduct availability');

    res.json({
      success: true,
      product,
      similarProducts,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/products (Protected Admin + Multer multi-image upload)
exports.createProduct = async (req, res, next) => {
  const uploadedCloudinaryIds = [];
  try {
    const body = req.body;
    const slug = body.slug
      ? slugify(body.slug, { lower: true, strict: true })
      : slugify(`${body.name || ''}-${body.sku || ''}`, { lower: true, strict: true });

    const categoryId = await resolveCategoryId(body.category);
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'A valid product category is required.',
      });
    }

    const parsedAlts = parseStringOrArray(body.imageAlts);
    const requestedMainIdx =
      body.mainImageIndex !== undefined ? parseInt(body.mainImageIndex, 10) : 0;

    let images = [];

    // 1. Handle uploaded binary files via Cloudinary
    if (req.files && req.files.length > 0) {
      if (req.files.length > 8) {
        return res.status(400).json({
          success: false,
          message: 'A maximum of 8 product images is permitted.',
        });
      }
      for (let i = 0; i < req.files.length; i++) {
        const uploaded = await uploadBufferToCloudinary(req.files[i].buffer, 'aaranya/products');
        uploadedCloudinaryIds.push(uploaded.publicId);
        images.push({
          url: uploaded.url,
          publicId: uploaded.publicId,
          width: uploaded.width,
          height: uploaded.height,
          alt:
            (parsedAlts[i] && String(parsedAlts[i]).trim()) ||
            (body.altText && String(body.altText).trim()) ||
            `${body.name} - View ${i + 1}`,
          isMain: i === (Number.isNaN(requestedMainIdx) ? 0 : requestedMainIdx),
          order: i,
          isDemo: false,
          licenseSource: 'Actual Store Photography',
        });
      }
    } else if (body.images) {
      images = typeof body.images === 'string' ? JSON.parse(body.images) : body.images;
    }

    images = normalizeGalleryImages(images);

    const createdDoc = await Product.create({
      ...body,
      category: categoryId,
      slug,
      price: Number(body.price),
      originalPrice:
        body.originalPrice !== undefined && body.originalPrice !== '' && body.originalPrice !== null
          ? Number(body.originalPrice)
          : null,
      weightGrams:
        body.weightGrams !== undefined && body.weightGrams !== '' && body.weightGrams !== null
          ? Number(body.weightGrams)
          : null,
      sizes: parseStringOrArray(body.sizes),
      specifications:
        typeof body.specifications === 'string'
          ? JSON.parse(body.specifications)
          : body.specifications || [],
      images,
      isDemoProduct: images.some((img) => img.isDemo === true),
    });

    const product = await Product.findById(createdDoc._id)
      .populate('category', 'name slug')
      .populate('collectionRef', 'name slug');

    await logAdminActivity(
      req.admin,
      'Product created',
      `${product.name} (${product.sku})`,
      `Created at INR ${product.price}`
    );

    res.status(201).json({ success: true, product });
  } catch (error) {
    for (const pubId of uploadedCloudinaryIds) {
      await deleteFromCloudinary(pubId);
    }
    next(error);
  }
};

// PUT /api/products/:id (Protected Admin — supports price tracking, image replacement & reordering)
exports.updateProduct = async (req, res, next) => {
  const newlyUploadedIds = [];
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const oldPrice = product.price;
    const oldCategory = String(product.category);
    const body = req.body;

    const parsedNewAlts = parseStringOrArray(body.newImageAlts);
    const parsedNewMainIdx =
      body.newMainImageIndex !== undefined && body.newMainImageIndex !== ''
        ? parseInt(body.newMainImageIndex, 10)
        : -1;

    // Upload any new binary files to Cloudinary
    const newImages = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const uploaded = await uploadBufferToCloudinary(req.files[i].buffer, 'aaranya/products');
        newlyUploadedIds.push(uploaded.publicId);
        newImages.push({
          url: uploaded.url,
          publicId: uploaded.publicId,
          width: uploaded.width,
          height: uploaded.height,
          alt:
            (parsedNewAlts[i] && String(parsedNewAlts[i]).trim()) ||
            `${body.name || product.name} - Authentic Store Photo`,
          isMain: i === parsedNewMainIdx,
          order: product.images.length + i,
          isDemo: false,
          licenseSource: 'Actual Store Photography',
        });
      }
    }

    // Handle retained / reordered / replaced images
    let updatedGallery = product.images;
    if (body.images !== undefined) {
      const parsedImages = typeof body.images === 'string' ? JSON.parse(body.images) : body.images;
      const retainedPublicIds = new Set(parsedImages.map((img) => img.publicId).filter(Boolean));
      for (const existingImg of product.images) {
        if (existingImg.publicId && !retainedPublicIds.has(existingImg.publicId)) {
          await deleteFromCloudinary(existingImg.publicId);
        }
      }
      if (parsedNewMainIdx >= 0) {
        parsedImages.forEach((img) => {
          img.isMain = false;
        });
      }
      updatedGallery = [...parsedImages, ...newImages];
    } else if (newImages.length > 0) {
      if (parsedNewMainIdx >= 0) {
        product.images.forEach((img) => {
          img.isMain = false;
        });
      }
      updatedGallery = [...product.images, ...newImages];
    }

    if (updatedGallery.length > 8) {
      for (const pubId of newlyUploadedIds) {
        await deleteFromCloudinary(pubId);
      }
      return res.status(400).json({
        success: false,
        message: 'A maximum of 8 product images is permitted per product.',
      });
    }

    updatedGallery = normalizeGalleryImages(updatedGallery);

    const resolvedCategory = body.category
      ? await resolveCategoryId(body.category)
      : product.category;

    const updateFields = {
      ...body,
      category: resolvedCategory || product.category,
      images: updatedGallery,
      sizes: body.sizes !== undefined ? parseStringOrArray(body.sizes) : product.sizes,
      specifications:
        body.specifications !== undefined
          ? typeof body.specifications === 'string'
            ? JSON.parse(body.specifications)
            : body.specifications
          : product.specifications,
      isDemoProduct: updatedGallery.some((img) => img.isDemo === true),
    };

    if (body.price !== undefined && body.price !== '') {
      updateFields.price = Number(body.price);
    }
    if (body.originalPrice !== undefined) {
      updateFields.originalPrice =
        body.originalPrice === '' || body.originalPrice === null
          ? null
          : Number(body.originalPrice);
    }
    if (body.weightGrams !== undefined) {
      updateFields.weightGrams =
        body.weightGrams === '' || body.weightGrams === null ? null : Number(body.weightGrams);
    }

    Object.assign(product, updateFields);
    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('collectionRef', 'name slug');

    if (Number(body.price) && Number(body.price) !== oldPrice) {
      await logAdminActivity(
        req.admin,
        'Price changed',
        `${product.name} (${product.sku})`,
        `INR ${oldPrice} -> INR ${product.price}`
      );
    } else if (newImages.length > 0 || body.imageReplaced) {
      await logAdminActivity(
        req.admin,
        'Image replaced',
        `${product.name} (${product.sku})`,
        'Updated product gallery images'
      );
    } else if (resolvedCategory && String(resolvedCategory) !== oldCategory) {
      await logAdminActivity(
        req.admin,
        'Category changed',
        `${product.name} (${product.sku})`,
        `Assigned new category ID ${resolvedCategory}`
      );
    } else {
      await logAdminActivity(
        req.admin,
        'Product updated',
        `${product.name} (${product.sku})`,
        'Updated product attributes'
      );
    }

    res.json({ success: true, product: populatedProduct });
  } catch (error) {
    for (const pubId of newlyUploadedIds) {
      await deleteFromCloudinary(pubId);
    }
    next(error);
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    for (const img of product.images) {
      if (img.publicId) {
        await deleteFromCloudinary(img.publicId);
      }
    }

    await product.deleteOne();
    await logAdminActivity(
      req.admin,
      'Product deleted',
      `${product.name} (${product.sku})`,
      'Permanently removed product and associated Cloudinary assets'
    );

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
