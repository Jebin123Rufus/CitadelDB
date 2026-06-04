import axios from 'axios';

const STIX_URL =
  'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json';

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000;

async function loadAttackData() {
  if (cache && Date.now() - cacheTime < CACHE_TTL) return cache;

  const { data } = await axios.get(STIX_URL, { timeout: 60000 });
  const objects = data.objects || [];

  const tactics = [];
  const techniques = [];
  const mitigations = [];

  for (const obj of objects) {
    if (obj.revoked || obj.x_mitre_deprecated) continue;

    if (obj.type === 'x-mitre-tactic') {
      tactics.push({
        id: obj.external_references?.[0]?.external_id || obj.id,
        name: obj.name,
        description: obj.description?.slice(0, 500) || '',
        shortName: obj.x_mitre_shortname,
        url: obj.external_references?.[0]?.url,
      });
    } else if (obj.type === 'attack-pattern') {
      const phases = (obj.kill_chain_phases || []).map((p) => p.phase_name);
      techniques.push({
        id: obj.external_references?.[0]?.external_id || obj.id,
        name: obj.name,
        description: obj.description || '',
        tactics: phases,
        platforms: obj.x_mitre_platforms || [],
        url: obj.external_references?.[0]?.url,
        detection: obj.x_mitre_detection || '',
        dataSources: obj.x_mitre_data_sources || [],
      });
    } else if (obj.type === 'course-of-action') {
      mitigations.push({
        id: obj.external_references?.[0]?.external_id || obj.id,
        name: obj.name,
        description: obj.description || '',
        url: obj.external_references?.[0]?.url,
      });
    }
  }

  tactics.sort((a, b) => a.id.localeCompare(b.id));
  techniques.sort((a, b) => a.id.localeCompare(b.id));

  cache = { tactics, techniques, mitigations };
  cacheTime = Date.now();
  return cache;
}

export async function getTactics() {
  const { tactics } = await loadAttackData();
  return tactics;
}

export async function getTechniques({ tactic, search, limit = 100 } = {}) {
  const { techniques } = await loadAttackData();
  let filtered = techniques;

  if (tactic) {
    const t = tactic.toLowerCase();
    filtered = filtered.filter((tech) =>
      tech.tactics.some((p) => p.toLowerCase().includes(t))
    );
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (tech) =>
        tech.name.toLowerCase().includes(q) ||
        tech.id.toLowerCase().includes(q) ||
        tech.description.toLowerCase().includes(q)
    );
  }

  return filtered.slice(0, limit);
}

export async function getTechniqueById(techniqueId) {
  const { techniques, mitigations } = await loadAttackData();
  const id = techniqueId.toUpperCase();
  const tech = techniques.find(
    (t) => t.id.toUpperCase() === id || t.id === techniqueId
  );
  if (!tech) {
    const err = new Error(`Technique not found: ${techniqueId}`);
    err.status = 404;
    throw err;
  }

  const relatedMitigations = mitigations
    .filter(
      (m) =>
        m.description?.toLowerCase().includes(tech.name.toLowerCase()) ||
        m.name?.toLowerCase().includes(tech.id.toLowerCase())
    )
    .slice(0, 8);

  return {
    ...tech,
    defensiveRecommendations: relatedMitigations.length
      ? relatedMitigations
      : [
          {
            id: 'general',
            name: 'Defense in Depth',
            description:
              'Apply layered controls: network segmentation, least privilege, EDR monitoring, and logging aligned to this technique\'s tactics.',
          },
        ],
  };
}

export async function searchTechniques(query) {
  return getTechniques({ search: query, limit: 50 });
}
