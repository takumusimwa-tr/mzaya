"""Apply Batch 05 to the exact GitHub baseline; refuse unexpected edits."""
from pathlib import Path
import sys

root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd()
changes = {}

def replace(rel, old, new):
    path = root / rel
    content = changes.get(path, path.read_text(encoding='utf-8'))
    if old not in content:
        raise RuntimeError(f'Expected anchor missing in {rel}: {old[:90]!r}. Stop and inspect; do not overwrite.')
    if content.count(old) != 1:
        raise RuntimeError(f'Ambiguous anchor in {rel}: {old[:90]!r}')
    changes[path] = content.replace(old, new, 1)

replace('backend/src/app.js',
    "const adCampaignRoutes = require('./routes/adCampaign.routes');",
    "const adCampaignRoutes = require('./routes/adCampaign.routes');\nconst adAnalyticsRoutes = require('./routes/adAnalytics.routes');")
replace('backend/src/app.js',
    "app.use('/api/ad-campaigns', adCampaignRoutes);",
    "app.use('/api/ad-campaigns', adCampaignRoutes);\napp.use('/api/ad-analytics', adAnalyticsRoutes);")
replace('frontend/src/api/api.js',
    '// ─── Admin ─',
    """// ─── Advertising analytics (separate from checkout promos) ─────────────
export const adAnalyticsAPI = {
  record: (data) => api.post('/ad-analytics/events', data),
  summary: () => api.get('/ad-analytics/summary'),
}

// ─── Admin ─""")
replace('frontend/src/components/home/PromotionalCarousel.jsx',
    "import { useEffect, useState } from 'react'",
    "import { useEffect, useRef, useState } from 'react'\nimport { adAnalyticsAPI } from '../../api/api'")
replace('frontend/src/components/home/PromotionalCarousel.jsx',
    "  const sponsored = slide.type !== 'first_party'",
    """  const sponsored = slide.type !== 'first_party'
  const seen = useRef(new Set())
  useEffect(() => {
    if (!sponsored || !slide.id || seen.current.has(slide.id)) return
    seen.current.add(slide.id)
    // An impression is counted when a campaign becomes the active slide.
    // Analytics failure must never interrupt the shopping experience.
    if (typeof crypto === 'undefined' || !crypto.randomUUID) return
    adAnalyticsAPI.record({ campaign_id: slide.id, event_type: 'impression', event_key: crypto.randomUUID() }).catch(() => {})
  }, [slide.id, sponsored])
  const visit = () => {
    if (sponsored && typeof crypto !== 'undefined' && crypto.randomUUID) {
      adAnalyticsAPI.record({ campaign_id: slide.id, event_type: 'click', event_key: crypto.randomUUID() }).catch(() => {})
    }
    onNavigate(slide.href)
  }""")
replace('frontend/src/components/home/PromotionalCarousel.jsx',
    'onClick={() => onNavigate(slide.href)}',
    'onClick={visit}')
replace('frontend/src/pages/vendor/VendorCampaigns.jsx',
    "import api from '../../api/api'",
    "import api from '../../api/api'\nimport CampaignMetrics from '../../components/advertising/CampaignMetrics'")
replace('frontend/src/pages/vendor/VendorCampaigns.jsx',
    '      <section className="space-y-3"><h2 className="text-lg font-bold text-[#123E33]">Your campaigns</h2>',
    '      <CampaignMetrics />\n      <section className="space-y-3"><h2 className="text-lg font-bold text-[#123E33]">Your campaigns</h2>')
replace('frontend/src/pages/admin/AdminCampaigns.jsx',
    "import { adCampaignAPI } from '../../api/api'",
    "import { adCampaignAPI } from '../../api/api'\nimport CampaignMetrics from '../../components/advertising/CampaignMetrics'")
replace('frontend/src/pages/admin/AdminCampaigns.jsx',
    '    {message && <p role="status"',
    '    <CampaignMetrics title="Advertising performance" />\n    {message && <p role="status"')

for path, content in changes.items():
    path.write_text(content, encoding='utf-8')
    print('UPDATED', path.relative_to(root))
print('Applied Batch 05 anchors successfully. Run lint, build and backend checks.')
