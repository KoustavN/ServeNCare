import { Router } from 'express';
import { getCollection, ObjectId, toObj } from '../db/index.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const coll = getCollection('categories');
    const parents = await coll.find({ parent_id: null }).sort({ sort_order: 1, name: 1 }).toArray();
    const children = await coll.find({ parent_id: { $ne: null } }).sort({ sort_order: 1, name: 1 }).toArray();
    const byParent = new Map();
    for (const c of children) {
      const pid = c.parent_id?.toString();
      if (!byParent.has(pid)) byParent.set(pid, []);
      byParent.get(pid).push(toObj(c));
    }
    const withChildren = parents.map((p) => ({
      ...toObj(p),
      children: byParent.get(p._id.toString()) || [],
    }));
    res.json(withChildren);
  } catch (e) {
    console.error('Categories list error:', e);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/flat', async (req, res) => {
  try {
    const coll = getCollection('categories');
    const rows = await coll.find({}).sort({ sort_order: 1, name: 1 }).toArray();
    res.json(rows.map((r) => ({ ...toObj(r), parent_id: r.parent_id?.toString() ?? null })));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const coll = getCollection('categories');
    let doc;
    try {
      doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    } catch {
      return res.status(404).json({ error: 'Category not found' });
    }
    if (!doc) return res.status(404).json({ error: 'Category not found' });
    res.json({ ...toObj(doc), parent_id: doc.parent_id?.toString() ?? null });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

export default router;
