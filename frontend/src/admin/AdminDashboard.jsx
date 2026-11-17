import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Star,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit3,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { updatePageMeta } from '../utils/seo';
import { formatINR, createSvgFallbackDataUri } from '../utils/fallbackData';

const METAL_TYPES = [
  'Gold',
  'Silver',
  'Diamond & Gold',
  'Kundan & Gold',
  'Polki & Gold',
  'Platinum',
  'Temple Gold',
];

const OCCASIONS = [
  'Bridal',
  'Festive',
  'Everyday Luxury',
  'Temple & Ceremonial',
  'Cocktail & Evening',
];

const AVAILABILITIES = [
  'In Store & Ready',
  'Made to Order (14-21 Days)',
  'Reserved / Out of Stock',
];

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
];

const MAX_IMAGES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const {
    products,
    setProducts,
    categories,
    enquiries,
    setEnquiries,
    contactMessages,
    setContactMessages,
    settings,
    setSettings,
  } = useStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [replaceDemoOnly, setReplaceDemoOnly] = useState(false);

  // Create Product State
  const defaultCategoryId = categories?.[0]?._id || '';
  const [newProd, setNewProd] = useState({
    name: '',
    slug: '',
    category: defaultCategoryId,
    price: '',
    originalPrice: '',
    metalType: 'Kundan & Gold',
    purity: '22K (916 BIS Hallmarked)',
    weightGrams: '',
    stoneDetails: '',
    occasion: 'Bridal',
    availability: 'In Store & Ready',
    altText: '',
  });

  // Pending files for Create: [{ file, previewUrl, alt, isMain }]
  const [pendingCreateImages, setPendingCreateImages] = useState([]);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [createErrors, setCreateErrors] = useState({});

  // Edit Gallery / Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [retainedGallery, setRetainedGallery] = useState([]);
  const [newEditFiles, setNewEditFiles] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!newProd.category && categories?.length > 0) {
      setNewProd((prev) => ({ ...prev, category: categories[0]._id }));
    }
  }, [categories]);

  useEffect(() => {
    updatePageMeta({
      title: 'Admin Dashboard | AARANYA',
      description: 'Protected AARANYA administration dashboard.',
    });
    if (!admin) {
      navigate('/admin/login');
    }
  }, [admin, navigate]);

  // Cleanup blob object URLs on unmount
  useEffect(() => {
    return () => {
      pendingCreateImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      newEditFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  if (!admin) return null;

  const demoCount = products.filter((p) => p.isDemoProduct).length;
  const displayedProducts = replaceDemoOnly
    ? products.filter((p) => p.isDemoProduct)
    : products;

  const refreshProductsFromApi = async () => {
    try {
      const res = await api.get('/products?limit=50&includeInactive=true');
      if (res.data?.products) {
        setProducts(res.data.products);
      }
    } catch {
      // Keep current state if refetch fails
    }
  };

  // Validate and stage files for Create form
  const handleCreateFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    if (pendingCreateImages.length + selectedFiles.length > MAX_IMAGES) {
      toast.error(`You can upload at most ${MAX_IMAGES} images per product.`);
      e.target.value = '';
      return;
    }

    const validItems = [];
    for (const file of selectedFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(
          `Invalid file format (${file.name}). Use JPEG, PNG, WebP, or AVIF.`
        );
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} exceeds the 5MB per-image limit.`);
        continue;
      }
      validItems.push({
        file,
        previewUrl: URL.createObjectURL(file),
        alt: newProd.altText || newProd.name || file.name.replace(/\.[^/.]+$/, ''),
        isMain: pendingCreateImages.length === 0 && validItems.length === 0,
      });
    }

    if (validItems.length > 0) {
      setPendingCreateImages((prev) => {
        const merged = [...prev, ...validItems].slice(0, MAX_IMAGES);
        if (!merged.some((img) => img.isMain) && merged.length > 0) {
          merged[0].isMain = true;
        }
        return merged;
      });
    }
    e.target.value = '';
  };

  const handleSetCreateMain = (index) => {
    setPendingCreateImages((prev) =>
      prev.map((item, idx) => ({ ...item, isMain: idx === index }))
    );
  };

  const handleMoveCreateImage = (index, direction) => {
    setPendingCreateImages((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(target, 0, moved);
      return copy;
    });
  };

  const handleRemoveCreateImage = (index) => {
    setPendingCreateImages((prev) => {
      const removed = prev[index];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      const remaining = prev.filter((_, idx) => idx !== index);
      if (remaining.length > 0 && !remaining.some((img) => img.isMain)) {
        remaining[0].isMain = true;
      }
      return remaining;
    });
  };

  const validateCreateForm = () => {
    const errs = {};
    if (!newProd.name.trim()) errs.name = 'Product name is required';
    if (!newProd.category) errs.category = 'Category is required';
    if (!newProd.price || Number(newProd.price) <= 0) {
      errs.price = 'Valid INR price is required';
    }
    if (!newProd.metalType) errs.metalType = 'Metal type is required';
    if (!newProd.purity.trim()) errs.purity = 'Purity is required';
    if (!newProd.altText.trim()) {
      errs.altText = 'Descriptive image alt text is required';
    }
    if (pendingCreateImages.length === 0) {
      errs.images = 'Please select at least 1 product photograph (up to 8)';
    }
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (creatingProduct) return;

    if (!validateCreateForm()) {
      toast.error('Please complete all required fields and attach at least one image.');
      return;
    }

    setCreatingProduct(true);
    try {
      const formData = new FormData();
      formData.append('name', newProd.name.trim());
      if (newProd.slug.trim()) {
        formData.append('slug', newProd.slug.trim().toLowerCase());
      }
      formData.append('category', newProd.category);
      formData.append('price', String(Number(newProd.price)));
      if (newProd.originalPrice) {
        formData.append('originalPrice', String(Number(newProd.originalPrice)));
      }
      formData.append('metalType', newProd.metalType);
      formData.append('purity', newProd.purity.trim());
      if (newProd.weightGrams) {
        formData.append('weightGrams', String(Number(newProd.weightGrams)));
      }
      if (newProd.stoneDetails.trim()) {
        formData.append('stoneDetails', newProd.stoneDetails.trim());
      }
      formData.append('occasion', newProd.occasion);
      formData.append('availability', newProd.availability);
      formData.append('altText', newProd.altText.trim());

      const mainIdx = Math.max(
        0,
        pendingCreateImages.findIndex((item) => item.isMain)
      );
      formData.append('mainImageIndex', String(mainIdx));

      const imageAlts = pendingCreateImages.map(
        (item, idx) =>
          (item.alt && item.alt.trim()) ||
          `${newProd.altText.trim()} (View ${idx + 1})`
      );
      formData.append('imageAlts', JSON.stringify(imageAlts));

      pendingCreateImages.forEach((item) => {
        formData.append('images', item.file);
      });

      const res = await api.post('/products', formData);
      const savedProduct = res.data?.product;

      if (savedProduct) {
        setProducts((prev) => [
          savedProduct,
          ...prev.filter((p) => p._id !== savedProduct._id),
        ]);
      } else {
        await refreshProductsFromApi();
      }

      pendingCreateImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setPendingCreateImages([]);
      setCreateErrors({});
      setNewProd({
        name: '',
        slug: '',
        category: categories?.[0]?._id || '',
        price: '',
        originalPrice: '',
        metalType: 'Kundan & Gold',
        purity: '22K (916 BIS Hallmarked)',
        weightGrams: '',
        stoneDetails: '',
        occasion: 'Bridal',
        availability: 'In Store & Ready',
        altText: '',
      });

      toast.success(
        `Saved ${savedProduct?.name || newProd.name} to MongoDB & Cloudinary`
      );
    } catch (err) {
      toast.error(
        err.friendlyMessage ||
          'Could not save product to server. Verify backend and Cloudinary connection.'
      );
    } finally {
      setCreatingProduct(false);
    }
  };

  // Open Gallery & Product Editor Modal
  const openEditModal = (product) => {
    const existingImgs = [...(product.images || [])]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((img, idx) => ({
        ...img,
        order: idx,
        isMain: Boolean(img.isMain),
      }));
    if (existingImgs.length > 0 && !existingImgs.some((img) => img.isMain)) {
      existingImgs[0].isMain = true;
    }

    const catId =
      typeof product.category === 'object'
        ? product.category?._id
        : categories.find((c) => c.name === product.category || c._id === product.category)?._id ||
          categories?.[0]?._id ||
          '';

    setEditingProduct({
      _id: product._id,
      name: product.name || '',
      sku: product.sku || '',
      price: product.price || '',
      category: catId,
      metalType: product.metalType || 'Gold',
      purity: product.purity || '',
    });
    setRetainedGallery(existingImgs);
    newEditFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setNewEditFiles([]);
  };

  const closeEditModal = () => {
    newEditFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setNewEditFiles([]);
    setRetainedGallery([]);
    setEditingProduct(null);
  };

  const totalEditImagesCount = retainedGallery.length + newEditFiles.length;

  const handleEditFilesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (totalEditImagesCount + files.length > MAX_IMAGES) {
      toast.error(
        `Maximum ${MAX_IMAGES} images allowed per product. Currently ${totalEditImagesCount} in gallery.`
      );
      e.target.value = '';
      return;
    }

    const added = [];
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`Invalid file format: ${file.name}`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} exceeds 5MB limit`);
        continue;
      }
      added.push({
        file,
        previewUrl: URL.createObjectURL(file),
        alt: `${editingProduct?.name || 'Product'} - Showroom View`,
        isMain: retainedGallery.length === 0 && newEditFiles.length === 0 && added.length === 0,
      });
    }

    setNewEditFiles((prev) => [...prev, ...added]);
    e.target.value = '';
  };

  const handleSelectEditMain = (type, index) => {
    if (type === 'retained') {
      setRetainedGallery((prev) =>
        prev.map((img, i) => ({ ...img, isMain: i === index }))
      );
      setNewEditFiles((prev) => prev.map((img) => ({ ...img, isMain: false })));
    } else {
      setRetainedGallery((prev) => prev.map((img) => ({ ...img, isMain: false })));
      setNewEditFiles((prev) =>
        prev.map((img, i) => ({ ...img, isMain: i === index }))
      );
    }
  };

  const handleMoveRetainedImage = (index, direction) => {
    setRetainedGallery((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(target, 0, moved);
      return copy.map((item, idx) => ({ ...item, order: idx }));
    });
  };

  const handleRemoveRetainedImage = (index) => {
    setRetainedGallery((prev) => {
      const remaining = prev
        .filter((_, idx) => idx !== index)
        .map((img, idx) => ({ ...img, order: idx }));
      const hasMain =
        remaining.some((img) => img.isMain) || newEditFiles.some((img) => img.isMain);
      if (!hasMain) {
        if (remaining.length > 0) {
          remaining[0].isMain = true;
        } else if (newEditFiles.length > 0) {
          setNewEditFiles((files) =>
            files.map((f, idx) => ({ ...f, isMain: idx === 0 }))
          );
        }
      }
      return remaining;
    });
  };

  const handleRemoveNewEditFile = (index) => {
    setNewEditFiles((prev) => {
      const removed = prev[index];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      const remaining = prev.filter((_, idx) => idx !== index);
      const hasMain =
        retainedGallery.some((img) => img.isMain) ||
        remaining.some((img) => img.isMain);
      if (!hasMain) {
        if (retainedGallery.length > 0) {
          setRetainedGallery((ret) =>
            ret.map((img, idx) => ({ ...img, isMain: idx === 0 }))
          );
        } else if (remaining.length > 0) {
          remaining[0].isMain = true;
        }
      }
      return remaining;
    });
  };

  const handleSaveEditedProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct || savingEdit) return;

    if (retainedGallery.length + newEditFiles.length === 0) {
      toast.error('A product must have at least one image in its gallery.');
      return;
    }

    if (retainedGallery.length + newEditFiles.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed per product.`);
      return;
    }

    setSavingEdit(true);
    try {
      const formData = new FormData();
      formData.append('name', editingProduct.name.trim());
      formData.append('sku', editingProduct.sku.trim().toUpperCase());
      formData.append('price', String(Number(editingProduct.price)));
      if (editingProduct.category) {
        formData.append('category', editingProduct.category);
      }
      formData.append('metalType', editingProduct.metalType);
      formData.append('purity', editingProduct.purity.trim());

      const normalizedRetained = retainedGallery.map((img, idx) => ({
        _id: img._id,
        url: img.url,
        publicId: img.publicId || '',
        alt: img.alt || editingProduct.name,
        isMain: Boolean(img.isMain),
        order: idx,
        width: img.width || 800,
        height: img.height || 1000,
        isDemo: Boolean(img.isDemo),
        licenseSource: img.licenseSource || 'Actual Store Photography',
        licenseUrl: img.licenseUrl || '',
      }));

      formData.append('images', JSON.stringify(normalizedRetained));

      const newMainIdx = newEditFiles.findIndex((f) => f.isMain);
      if (newMainIdx >= 0) {
        formData.append('newMainImageIndex', String(newMainIdx));
      }

      const newAlts = newEditFiles.map(
        (f, i) => (f.alt && f.alt.trim()) || `${editingProduct.name} - View ${i + 1}`
      );
      formData.append('newImageAlts', JSON.stringify(newAlts));

      newEditFiles.forEach((f) => {
        formData.append('images', f.file);
      });

      const res = await api.put(`/products/${editingProduct._id}`, formData);
      const updated = res.data?.product;

      if (updated) {
        setProducts((prev) =>
          prev.map((p) => (p._id === updated._id ? updated : p))
        );
      } else {
        await refreshProductsFromApi();
      }

      toast.success(`Updated ${editingProduct.name} gallery & details`);
      closeEditModal();
    } catch (err) {
      toast.error(
        err.friendlyMessage ||
          'Failed to update product on server. Changes were not saved.'
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!product?._id || deletingId) return;
    const confirmed = window.confirm(
      `Permanently delete "${product.name}" (${product.sku}) and its Cloudinary images?`
    );
    if (!confirmed) return;

    setDeletingId(product._id);
    try {
      await api.delete(`/products/${product._id}`);
      setProducts((prev) => prev.filter((item) => item._id !== product._id));
      toast.success(`Deleted ${product.name} (${product.sku})`);
    } catch (err) {
      toast.error(
        err.friendlyMessage ||
          'Could not delete product from server. Verify admin session and backend connection.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 p-4 rounded-xl bg-[#FBF7F0] border border-[#C89B5C] flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#34241D]">
            Pre-launch photography status:{' '}
            <span className="text-[#B88A4A]">
              {demoCount} of {products.length}
            </span>{' '}
            products currently use licensed reference photos.
          </p>
          <p className="text-xs text-[#695B4E] mt-0.5">
            Upload up to 8 showroom photographs per piece to persist in MongoDB &amp; Cloudinary.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setActiveTab('products');
            setReplaceDemoOnly(!replaceDemoOnly);
          }}
          className="px-4 py-2 rounded-lg bg-[#34241D] hover:bg-[#2E1F18] text-[#FAF8F4] text-xs font-medium transition-colors"
        >
          {replaceDemoOnly ? 'Show All Products' : 'Filter Demo Images to Replace'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <div className="bg-[#FBF7F0] border border-[#E6DBC9] rounded-xl p-4 space-y-1.5">
            <div className="px-3 py-2 border-b border-[#E6DBC9] mb-2">
              <p className="text-[11px] text-[#8C6239] font-medium">Signed in administrator</p>
              <p className="font-serif text-lg font-semibold text-[#34241D]">{admin.name}</p>
              <p className="text-xs text-[#695B4E] truncate">{admin.email}</p>
            </div>
            {[
              { id: 'dashboard', label: 'Dashboard Overview' },
              { id: 'products', label: `Products (${products.length})` },
              { id: 'enquiries', label: `WhatsApp Enquiries (${enquiries.length})` },
              { id: 'contacts', label: `Contact Messages (${contactMessages.length})` },
              { id: 'settings', label: 'Website Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#34241D] text-[#FAF8F4]'
                    : 'text-[#34241D] hover:bg-[#F2E9DC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              onClick={logout}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 transition-colors mt-2 border-t border-[#E6DBC9] pt-3"
            >
              Logout Securely
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#FBF7F0] border border-[#E6DBC9] rounded-xl p-4">
                  <p className="text-xs text-[#695B4E]">Total Products</p>
                  <p className="font-serif text-3xl font-semibold text-[#34241D] mt-1">
                    {products.length}
                  </p>
                </div>
                <div className="bg-[#FBF7F0] border border-[#E6DBC9] rounded-xl p-4">
                  <p className="text-xs text-[#695B4E]">Categories</p>
                  <p className="font-serif text-3xl font-semibold text-[#34241D] mt-1">
                    {categories.length}
                  </p>
                </div>
                <div className="bg-[#FBF7F0] border border-[#E6DBC9] rounded-xl p-4">
                  <p className="text-xs text-[#695B4E]">WhatsApp Enquiries</p>
                  <p className="font-serif text-3xl font-semibold text-[#B88A4A] mt-1">
                    {enquiries.length}
                  </p>
                </div>
                <div className="bg-[#FBF7F0] border border-[#E6DBC9] rounded-xl p-4">
                  <p className="text-xs text-[#695B4E]">Contact Messages</p>
                  <p className="font-serif text-3xl font-semibold text-[#34241D] mt-1">
                    {contactMessages.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Create Product Form */}
              <div className="bg-[#FBF7F0] border border-[#E6DBC9] rounded-xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-[#34241D]">
                      Add New Catalogue Piece
                    </h2>
                    <p className="text-xs text-[#695B4E]">
                      Uploads directly to Cloudinary and persists to MongoDB (up to 8 images).
                    </p>
                  </div>
                  <span className="text-xs font-medium text-[#695B4E]">
                    Selected images: {pendingCreateImages.length} / {MAX_IMAGES}
                  </span>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-4 text-xs" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-[#34241D] mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Royal Bikaneri Kundan Choker"
                        value={newProd.name}
                        onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                      />
                      {createErrors.name && (
                        <p className="text-[11px] text-red-600 mt-1">{createErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block font-medium text-[#34241D] mb-1">
                        Category *
                      </label>
                      <select
                        value={newProd.category}
                        onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                      >
                        <option value="">Select category...</option>
                        {categories.map((cat) => (
                          <option key={cat._id || cat.slug} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {createErrors.category && (
                        <p className="text-[11px] text-red-600 mt-1">{createErrors.category}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block font-medium text-[#34241D] mb-1">
                        Price (INR) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 185000"
                        value={newProd.price}
                        onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                      />
                      {createErrors.price && (
                        <p className="text-[11px] text-red-600 mt-1">{createErrors.price}</p>
                      )}
                    </div>
                    <div>
                      <label className="block font-medium text-[#34241D] mb-1">
                        Original Price (Optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 195000"
                        value={newProd.originalPrice}
                        onChange={(e) =>
                          setNewProd({ ...newProd, originalPrice: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#34241D] mb-1">
                        Metal Type *
                      </label>
                      <select
                        value={newProd.metalType}
                        onChange={(e) => setNewProd({ ...newProd, metalType: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                      >
                        {METAL_TYPES.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-[#34241D] mb-1">
                        Purity *
                      </label>
                      <input
                        type="text"
                        value={newProd.purity}
                        onChange={(e) => setNewProd({ ...newProd, purity: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                      />
                      {createErrors.purity && (
                        <p className="text-[11px] text-red-600 mt-1">{createErrors.purity}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block font-medium text-[#34241D] mb-1">
                        Weight (Grams)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 42.5"
                        value={newProd.weightGrams}
                        onChange={(e) =>
                          setNewProd({ ...newProd, weightGrams: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#34241D] mb-1">
                        Stone Details
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Uncut Polki & Emeralds"
                        value={newProd.stoneDetails}
                        onChange={(e) =>
                          setNewProd({ ...newProd, stoneDetails: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#34241D] mb-1">
                        Occasion
                      </label>
                      <select
                        value={newProd.occasion}
                        onChange={(e) => setNewProd({ ...newProd, occasion: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                      >
                        {OCCASIONS.map((occ) => (
                          <option key={occ} value={occ}>
                            {occ}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-[#34241D] mb-1">
                        Availability
                      </label>
                      <select
                        value={newProd.availability}
                        onChange={(e) =>
                          setNewProd({ ...newProd, availability: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                      >
                        {AVAILABILITIES.map((av) => (
                          <option key={av} value={av}>
                            {av}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    <div>
                      <label className="block font-medium text-[#34241D] mb-1">
                        Default Image Alt Text *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 22K gold Bikaneri Kundan choker with pearl drops"
                        value={newProd.altText}
                        onChange={(e) => setNewProd({ ...newProd, altText: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                      />
                      {createErrors.altText && (
                        <p className="text-[11px] text-red-600 mt-1">{createErrors.altText}</p>
                      )}
                    </div>
                    <div>
                      <label className="block font-medium text-[#34241D] mb-1">
                        Product Photographs (1 to 8 images, max 5MB each) *
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        multiple
                        disabled={pendingCreateImages.length >= MAX_IMAGES}
                        onChange={handleCreateFileSelect}
                        className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#C89B5C] file:bg-[#FAF8F4] file:text-[#34241D] file:font-medium"
                      />
                      {createErrors.images && (
                        <p className="text-[11px] text-red-600 mt-1">{createErrors.images}</p>
                      )}
                    </div>
                  </div>

                  {/* Staged Image Previews with Reorder & Main Selection */}
                  {pendingCreateImages.length > 0 && (
                    <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E6DBC9] space-y-3">
                      <p className="text-xs font-medium text-[#34241D]">
                        Staged Gallery Preview (Select primary image &amp; order before upload)
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {pendingCreateImages.map((item, idx) => (
                          <div
                            key={item.previewUrl}
                            className={`p-2.5 rounded-lg border bg-[#FBF7F0] flex flex-col justify-between gap-2 ${
                              item.isMain
                                ? 'border-[#B88A4A] ring-2 ring-[#B88A4A]/20'
                                : 'border-[#E6DBC9]'
                            }`}
                          >
                            <div className="relative aspect-[4/5] bg-[#F2E9DC]/60 rounded overflow-hidden p-1.5 flex items-center justify-center">
                              <img
                                src={item.previewUrl}
                                alt={item.alt || `Staged view ${idx + 1}`}
                                className="w-full h-full object-contain"
                              />
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#34241D]/80 text-[#FAF8F4] text-[10px]">
                                #{idx + 1}
                              </span>
                              {item.isMain && (
                                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#B88A4A] text-white text-[10px] font-medium">
                                  Main
                                </span>
                              )}
                            </div>

                            <input
                              type="text"
                              value={item.alt}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPendingCreateImages((prev) =>
                                  prev.map((img, i) =>
                                    i === idx ? { ...img, alt: val } : img
                                  )
                                );
                              }}
                              placeholder="Image alt text"
                              className="w-full px-2 py-1 rounded border border-[#E6DBC9] bg-white text-[11px]"
                            />

                            <div className="flex items-center justify-between gap-1 pt-1">
                              <button
                                type="button"
                                onClick={() => handleSetCreateMain(idx)}
                                className={`px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 ${
                                  item.isMain
                                    ? 'bg-[#B88A4A] text-white'
                                    : 'bg-white border border-[#E6DBC9] text-[#34241D]'
                                }`}
                              >
                                <Star className="w-3 h-3" />
                                <span>{item.isMain ? 'Main' : 'Set Main'}</span>
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveCreateImage(idx, -1)}
                                  aria-label="Move image earlier"
                                  className="p-1 rounded border border-[#E6DBC9] bg-white disabled:opacity-40"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === pendingCreateImages.length - 1}
                                  onClick={() => handleMoveCreateImage(idx, 1)}
                                  aria-label="Move image later"
                                  className="p-1 rounded border border-[#E6DBC9] bg-white disabled:opacity-40"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCreateImage(idx)}
                                  aria-label="Remove staged image"
                                  className="p-1 rounded border border-red-200 bg-white text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={creatingProduct}
                    className="px-6 py-2.5 rounded-lg bg-[#34241D] hover:bg-[#2E1F18] disabled:opacity-60 text-[#FAF8F4] font-medium inline-flex items-center gap-2 transition-colors"
                  >
                    {creatingProduct ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading to Cloudinary &amp; Saving...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#D8B982]" />
                        <span>Create Product</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Catalogue Inventory List */}
              <div className="bg-[#FBF7F0] border border-[#E6DBC9] rounded-xl p-6 space-y-3">
                <h3 className="font-serif text-2xl font-semibold text-[#34241D]">
                  Catalogue Inventory ({displayedProducts.length})
                </h3>
                {displayedProducts.map((p) => {
                  const sortedImgs = [...(p.images || [])].sort(
                    (a, b) => (a.order ?? 0) - (b.order ?? 0)
                  );
                  const mainImg =
                    sortedImgs.find((img) => img.isMain) || sortedImgs[0] || {};
                  return (
                    <div
                      key={p._id}
                      className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E6DBC9] flex flex-wrap items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-16 rounded-lg border border-[#E6DBC9] bg-[#F2E9DC]/60 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={
                              mainImg.url ||
                              createSvgFallbackDataUri(p.name, p.purity, p.sku)
                            }
                            alt={mainImg.alt || p.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-semibold text-[#8C6239]">
                              {p.sku}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#F2E9DC] text-[#34241D] text-[10px]">
                              {(p.images || []).length} image
                              {(p.images || []).length === 1 ? '' : 's'}
                            </span>
                            {p.isDemoProduct ? (
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-medium">
                                Reference photo
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-medium">
                                Store photo
                              </span>
                            )}
                          </div>
                          <p className="font-serif text-lg font-semibold text-[#34241D] mt-0.5">
                            {p.name}
                          </p>
                          <p className="text-[#695B4E]">{formatINR(p.price)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="px-3.5 py-2 rounded-lg border border-[#C89B5C] bg-white hover:bg-[#F2E9DC] text-[#34241D] font-medium inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#B88A4A]" />
                          <span>Manage Gallery &amp; Edit</span>
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === p._id}
                          onClick={() => handleDeleteProduct(p)}
                          className="px-3 py-2 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-700 font-medium disabled:opacity-50 transition-colors"
                        >
                          {deletingId === p._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'enquiries' && (
            <div className="bg-[#FBF7F0] border border-[#E6DBC9] rounded-xl p-6 space-y-3">
              <h2 className="font-serif text-2xl font-semibold text-[#34241D]">
                Logged WhatsApp Enquiries ({enquiries.length})
              </h2>
              {enquiries.map((enq) => (
                <div
                  key={enq._id}
                  className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E6DBC9] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-mono font-semibold text-[#8C6239]">{enq.sku}</p>
                    <p className="font-serif text-lg font-semibold text-[#34241D]">
                      {enq.productName}
                    </p>
                    <p className="text-[#695B4E]">{formatINR(enq.priceAtEnquiry)}</p>
                  </div>
                  <select
                    value={enq.status}
                    onChange={(e) =>
                      setEnquiries(
                        enquiries.map((item) =>
                          item._id === enq._id ? { ...item, status: e.target.value } : item
                        )
                      )
                    }
                    className="px-3 py-1.5 rounded-lg border border-[#C89B5C] bg-white font-medium"
                  >
                    {['New', 'Contacted', 'Interested', 'Converted', 'Not Interested'].map(
                      (st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      )
                    )}
                  </select>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="bg-[#FBF7F0] border border-[#E6DBC9] rounded-xl p-6 space-y-3">
              <h2 className="font-serif text-2xl font-semibold text-[#34241D]">
                Contact Submissions ({contactMessages.length})
              </h2>
              {contactMessages.map((msg) => (
                <div
                  key={msg.contactId || msg._id}
                  className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E6DBC9] text-xs space-y-1"
                >
                  <p className="font-serif text-lg font-semibold text-[#34241D]">
                    {msg.name} — {msg.subject}
                  </p>
                  <p className="text-[#695B4E]">
                    {msg.email} • {msg.phone}
                  </p>
                  <p className="text-[#34241D]">{msg.message}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-[#FBF7F0] border border-[#E6DBC9] rounded-xl p-6 space-y-4 text-xs">
              <h2 className="font-serif text-2xl font-semibold text-[#34241D]">
                Website &amp; Showroom Settings
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={settings.whatsappNumber}
                    onChange={(e) =>
                      setSettings({ ...settings, whatsappNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Showroom Phone</label>
                  <input
                    type="text"
                    value={settings.phoneNumber}
                    onChange={(e) =>
                      setSettings({ ...settings, phoneNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Store Address</label>
                <input
                  type="text"
                  value={settings.storeAddress}
                  onChange={(e) =>
                    setSettings({ ...settings, storeAddress: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                />
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api.put('/cms/settings', settings);
                    toast.success('Settings saved to database');
                  } catch {
                    toast.success('Settings updated in current session');
                  }
                }}
                className="px-6 py-2.5 rounded-lg bg-[#34241D] text-[#FAF8F4] font-medium"
              >
                Save Website Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Product & Gallery Modal */}
      {editingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-gallery-modal-title"
          className="fixed inset-0 z-50 bg-[#2E1F18]/75 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-[#FAF8F4] border border-[#E6DBC9] rounded-2xl max-w-4xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6DBC9] pb-4">
              <div>
                <h2
                  id="edit-gallery-modal-title"
                  className="font-serif text-2xl font-semibold text-[#34241D]"
                >
                  Edit Product &amp; Multi-Image Gallery
                </h2>
                <p className="text-xs text-[#695B4E]">
                  {editingProduct.name} ({editingProduct.sku}) — {totalEditImagesCount} /{' '}
                  {MAX_IMAGES} images
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                aria-label="Close modal"
                className="p-2 rounded-full hover:bg-[#F2E9DC] text-[#34241D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedProduct} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-[#34241D] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#34241D] mb-1">
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#34241D] mb-1">
                    Category
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#E6DBC9] bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id || cat.slug} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Existing / Retained Images */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-[#34241D]">
                    Saved Gallery Images ({retainedGallery.length})
                  </label>
                  <span className="text-[11px] text-[#695B4E]">
                    Reorder, select main image, or remove outdated photos
                  </span>
                </div>

                {retainedGallery.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {retainedGallery.map((img, idx) => (
                      <div
                        key={img._id || img.publicId || idx}
                        className={`p-2.5 rounded-lg border bg-[#FBF7F0] flex flex-col justify-between gap-2 ${
                          img.isMain
                            ? 'border-[#B88A4A] ring-2 ring-[#B88A4A]/20'
                            : 'border-[#E6DBC9]'
                        }`}
                      >
                        <div className="relative aspect-[4/5] bg-[#F2E9DC]/60 rounded overflow-hidden p-1.5 flex items-center justify-center">
                          <img
                            src={img.url}
                            alt={img.alt || editingProduct.name}
                            className="w-full h-full object-contain"
                          />
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#34241D]/80 text-[#FAF8F4] text-[10px]">
                            #{idx + 1}
                          </span>
                          {img.isMain && (
                            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#B88A4A] text-white text-[10px] font-medium">
                              Main
                            </span>
                          )}
                        </div>

                        <input
                          type="text"
                          value={img.alt || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRetainedGallery((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, alt: val } : item
                              )
                            );
                          }}
                          placeholder="Alt text"
                          className="w-full px-2 py-1 rounded border border-[#E6DBC9] bg-white text-[11px]"
                        />

                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => handleSelectEditMain('retained', idx)}
                            className={`px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 ${
                              img.isMain
                                ? 'bg-[#B88A4A] text-white'
                                : 'bg-white border border-[#E6DBC9] text-[#34241D]'
                            }`}
                          >
                            <Star className="w-3 h-3" />
                            <span>{img.isMain ? 'Main' : 'Set Main'}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveRetainedImage(idx, -1)}
                              aria-label="Move image earlier"
                              className="p-1 rounded border border-[#E6DBC9] bg-white disabled:opacity-40"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === retainedGallery.length - 1}
                              onClick={() => handleMoveRetainedImage(idx, 1)}
                              aria-label="Move image later"
                              className="p-1 rounded border border-[#E6DBC9] bg-white disabled:opacity-40"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveRetainedImage(idx)}
                              aria-label="Remove image"
                              className="p-1 rounded border border-red-200 bg-white text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#695B4E] italic">
                    All previous images marked for removal. Upload at least one new image below.
                  </p>
                )}
              </div>

              {/* Upload Additional Images */}
              <div className="space-y-2.5 pt-2 border-t border-[#E6DBC9]">
                <label className="block font-medium text-[#34241D]">
                  Add New Photographs ({MAX_IMAGES - totalEditImagesCount} slots remaining)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  disabled={totalEditImagesCount >= MAX_IMAGES}
                  onChange={handleEditFilesSelect}
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#C89B5C] file:bg-[#FBF7F0] file:text-[#34241D] file:font-medium"
                />

                {newEditFiles.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {newEditFiles.map((item, idx) => (
                      <div
                        key={item.previewUrl}
                        className={`p-2.5 rounded-lg border bg-[#FBF7F0] flex flex-col justify-between gap-2 ${
                          item.isMain
                            ? 'border-[#B88A4A] ring-2 ring-[#B88A4A]/20'
                            : 'border-[#E6DBC9]'
                        }`}
                      >
                        <div className="relative aspect-[4/5] bg-[#F2E9DC]/60 rounded overflow-hidden p-1.5 flex items-center justify-center">
                          <img
                            src={item.previewUrl}
                            alt={item.alt}
                            className="w-full h-full object-contain"
                          />
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-emerald-800 text-white text-[10px]">
                            New #{retainedGallery.length + idx + 1}
                          </span>
                          {item.isMain && (
                            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#B88A4A] text-white text-[10px] font-medium">
                              Main
                            </span>
                          )}
                        </div>

                        <input
                          type="text"
                          value={item.alt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewEditFiles((prev) =>
                              prev.map((f, i) => (i === idx ? { ...f, alt: val } : f))
                            );
                          }}
                          placeholder="Alt text"
                          className="w-full px-2 py-1 rounded border border-[#E6DBC9] bg-white text-[11px]"
                        />

                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => handleSelectEditMain('new', idx)}
                            className={`px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 ${
                              item.isMain
                                ? 'bg-[#B88A4A] text-white'
                                : 'bg-white border border-[#E6DBC9] text-[#34241D]'
                            }`}
                          >
                            <Star className="w-3 h-3" />
                            <span>{item.isMain ? 'Main' : 'Set Main'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewEditFile(idx)}
                            aria-label="Remove new file"
                            className="p-1 rounded border border-red-200 bg-white text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6DBC9]">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2.5 rounded-lg border border-[#E6DBC9] bg-white text-[#34241D] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-lg bg-[#34241D] hover:bg-[#2E1F18] text-[#FAF8F4] font-medium inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#D8B982]" />
                      <span>Save Gallery &amp; Details</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
