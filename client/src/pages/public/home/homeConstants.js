export const HOME_SCROLL_PADDING_TOP = '5rem';

export const FALLBACK_HOME_DATA = {
  hero: {
    kicker: 'Digital Architect',
    role: 'Full Stack Developer & Technical Writer',
  },
  profile: {
    name: 'Alex Vane',
    avatar_url: null,
    bio: 'Crafting high-performance digital experiences through elegant code and architectural precision. Focused on building scalable systems and sharing technical insights.',
  },
  stats: {
    articles: 12,
    views: 4800,
    tags: 3,
  },
  featuredArticles: [
    {
      id: 'dummy-1',
      title: 'Architecting Low-Latency React Environments',
      slug: 'architecting-low-latency-react-environments',
      excerpt: 'A practical breakdown of rendering bottlenecks and architecture-level fixes for frontend teams.',
      reading_time: 12,
      views: 14200,
      published_at: '2024-03-12T00:00:00.000Z',
      created_at: '2024-03-12T00:00:00.000Z',
      cover_image: null,
      tags: ['React', 'Performance', 'Frontend'],
      author: { id: 1, name: 'Alex Rivers', avatar_url: null },
    },
    {
      id: 'dummy-2',
      title: 'Designing API Contracts for Editorial Workflows',
      slug: 'designing-api-contracts-for-editorial-workflows',
      excerpt: 'How to make publishing systems resilient with clear ownership, idempotency, and visibility.',
      reading_time: 9,
      views: 8600,
      published_at: '2024-03-08T00:00:00.000Z',
      created_at: '2024-03-08T00:00:00.000Z',
      cover_image: null,
      tags: ['API', 'Architecture', 'Backend'],
      author: { id: 1, name: 'Lena Chen', avatar_url: null },
    },
    {
      id: 'dummy-3',
      title: 'Automating Zero-Trust Security Pipelines',
      slug: 'automating-zero-trust-security-pipelines',
      excerpt:
        'Bridging modern CI/CD velocity with strict deployment controls and reproducible runtime trust.',
      reading_time: 11,
      views: 9300,
      published_at: '2024-02-29T00:00:00.000Z',
      created_at: '2024-02-29T00:00:00.000Z',
      cover_image: null,
      tags: ['Security', 'CI/CD', 'DevOps'],
      author: { id: 1, name: 'Marcus Thorne', avatar_url: null },
    },
  ],
};
