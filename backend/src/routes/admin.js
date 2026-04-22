import { Router } from 'express';
import { getCollection, ObjectId, toObj } from '../db/index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

/** Dashboard stats: counts for admin overview */
router.get('/stats', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const users = getCollection('users');
    const services = getCollection('services');
    const bookings = getCollection('bookings');
    const [customersCount, providersCount, servicesCount, bookingsCount, pendingProvidersCount] = await Promise.all([
      users.countDocuments({ role: 'taker' }),
      users.countDocuments({ role: 'provider' }),
      services.countDocuments({}),
      bookings.countDocuments({}),
      users.countDocuments({ role: 'provider', is_verified: { $ne: true } }),
    ]);
    const completedBookings = await bookings.countDocuments({ status: 'completed' });
    res.json({
      customers: customersCount,
      providers: providersCount,
      pendingProviders: pendingProvidersCount,
      services: servicesCount,
      bookings: bookingsCount,
      completedBookings,
    });
  } catch (e) {
    console.error('Admin stats error:', e);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

/** List providers for admin (optional filter: ?verified=false for pending only) */
router.get('/providers', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const verified = req.query.verified;
    const users = getCollection('users');
    const filter = { role: 'provider' };
    if (verified === 'false' || verified === '0') filter.is_verified = { $ne: true };
    else if (verified === 'true' || verified === '1') filter.is_verified = true;

    const list = await users
      .find(filter)
      .sort({ created_at: -1 })
      .project({ password_hash: 0 })
      .toArray();

    const providerProfiles = getCollection('provider_profiles');
    const profiles = await providerProfiles.find({}).toArray();
    const profileByUserId = new Map(profiles.map((p) => [p.user_id.toString(), toObj(p)]));

    const out = list.map((u) => {
      const profile = profileByUserId.get(u._id.toString());
      return {
        id: u._id.toString(),
        email: u.email,
        full_name: u.full_name,
        phone: u.phone || null,
        is_verified: !!u.is_verified,
        is_active: u.is_active !== false,
        created_at: u.created_at,
        updated_at: u.updated_at,
        business_name: profile?.business_name || null,
        address: profile?.address || null,
      };
    });

    res.json({ providers: out });
  } catch (e) {
    console.error('Admin list providers error:', e);
    res.status(500).json({ error: 'Failed to list providers' });
  }
});

/** Verify a provider (set is_verified = true) */
router.patch('/providers/:id/verify', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const users = getCollection('users');
    const user = await users.findOne({
      _id: new ObjectId(id),
      role: 'provider',
    });
    if (!user) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    const now = new Date();
    await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { is_verified: true, updated_at: now } }
    );
    const updated = await users.findOne({ _id: new ObjectId(id) }, { projection: { password_hash: 0 } });
    res.json(toObj(updated));
  } catch (e) {
    console.error('Admin verify provider error:', e);
    res.status(500).json({ error: 'Failed to verify provider' });
  }
});

/** SOS incidents for admin */
router.get('/sos', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const sos = getCollection('sos_incidents');
    const match = {};
    if (status) match.status = status;
    const list = await sos
      .find(match)
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();
    res.json({ incidents: list.map(toObj) });
  } catch (e) {
    console.error('Admin sos list error:', e);
    res.status(500).json({ error: 'Failed to fetch SOS incidents' });
  }
});

router.patch('/sos/:id/assign', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const sos = getCollection('sos_incidents');
    const now = new Date();
    const { value } = await sos.findOneAndUpdate(
      { _id: id },
      { $set: { status: 'assigned', assigned_admin_id: req.user._id, updated_at: now } },
      { returnDocument: 'after' }
    );
    if (!value) return res.status(404).json({ error: 'SOS incident not found' });
    res.json(toObj(value));
  } catch (e) {
    console.error('Admin sos assign error:', e);
    res.status(500).json({ error: 'Failed to assign SOS incident' });
  }
});

router.patch('/sos/:id/resolve', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const sos = getCollection('sos_incidents');
    const now = new Date();
    const { value } = await sos.findOneAndUpdate(
      { _id: id },
      { $set: { status: 'resolved', updated_at: now } },
      { returnDocument: 'after' }
    );
    if (!value) return res.status(404).json({ error: 'SOS incident not found' });
    res.json(toObj(value));
  } catch (e) {
    console.error('Admin sos resolve error:', e);
    res.status(500).json({ error: 'Failed to resolve SOS incident' });
  }
});

export default router;
