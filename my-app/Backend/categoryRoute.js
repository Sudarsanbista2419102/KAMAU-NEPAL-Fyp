import express from 'express';
import CategoryModel from './models/categoryModel.js';
import { upload } from './utils/upload.js';

const router = express.Router();

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await CategoryModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// POST a new category (Ideally protected by adminAuthMiddleware)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { value, label } = req.body;
    
    if (!value || !label) {
      return res.status(400).json({ success: false, message: 'Value and label are required' });
    }

    // Check if category already exists
    const existingCategory = await CategoryModel.findOne({ value: value.toLowerCase().trim() });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const newCategory = new CategoryModel({
      value,
      label,
      image: req.file ? req.file.path : null
    });

    await newCategory.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

// DELETE a category
router.delete('/:id', async (req, res) => {
  try {
    const category = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

export default router;
