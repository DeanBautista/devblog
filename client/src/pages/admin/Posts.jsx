import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import PostCard from "../../components/posts/PostCard";

const POSTS = [
    {
        id: 1,
        coverVariant: "mint",
        title: "The Future of Generative UI: Beyond Component Libraries",
        category: "UX Design",
        readTime: "12 min read",
        status: "PUBLISHED",
        views: 12482,
        dateMobile: "Oct 24, 2023",
        dateDesktop: "Oct 24,\n2023",
    },
    {
        id: 2,
        coverVariant: "graphite",
        title: "Leveraging Rust for High-Performance Cloud Edge Functions",
        category: "Backend",
        readTime: "8 min read",
        status: "DRAFT",
        views: 0,
        dateMobile: "Oct 26, 2023",
        dateDesktop: "Oct 26,\n2023",
    },
    {
        id: 3,
        coverVariant: "parchment",
        title: "Sustainable Computing: The Architect's Role in Carbon Zero",
        category: "Culture",
        readTime: "15 min read",
        status: "PUBLISHED",
        views: 8102,
        dateMobile: "Oct 20, 2023",
        dateDesktop: "Oct 20,\n2023",
    },
    {
        id: 4,
        coverVariant: "ivory",
        title: "Mastering CSS Container Queries in Obsidian Architect",
        category: "Dev",
        readTime: "5 min read",
        status: "PUBLISHED",
        views: 24591,
        dateMobile: "Oct 15, 2023",
        dateDesktop: "Oct 15,\n2023",
    },
];

const PAGE_NUMBERS = [1, 2, 3];

export default function Posts() {
    return (
        <section className="min-h-screen w-full pt-14 md:pt-0">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                <div className="relative w-full max-w-md">
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                    />
                    <input
                        type="text"
                        readOnly
                        placeholder="Search posts..."
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface-container px-11 py-3 text-sm text-on-surface outline-none"
                    />
                </div>

                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">All Posts</h1>

                        <div className="mt-5 flex items-center gap-6 text-sm">
                            <button
                                type="button"
                                className="border-b border-primary-fixed pb-1 font-medium text-on-surface"
                            >
                                All
                            </button>
                            <button type="button" className="pb-1 text-on-surface-variant">
                                Published
                            </button>
                            <button type="button" className="pb-1 text-on-surface-variant">
                                Drafts
                            </button>
                        </div>
                    </div>

                    <Link
                        to="/newposts"
                        className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-container px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        <Plus size={16} />
                        New Post
                    </Link>
                </div>

                <div>
                    <div className="hidden grid-cols-[84px_minmax(0,1.7fr)_112px_112px_108px_70px] items-center gap-4 px-5 text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/80 xl:grid">
                        <span>Cover</span>
                        <span>Title</span>
                        <span>Status</span>
                        <span>Views</span>
                        <span>Date</span>
                        <span>Actions</span>
                    </div>

                    <div className="mt-3 flex flex-col gap-3">
                        {POSTS.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-4 pb-6 text-xs text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
                    <span>Showing 4 of 124 publications</span>

                    <nav className="flex items-center gap-2" aria-label="Pagination">
                        <button
                            type="button"
                            className="rounded-lg border border-outline-variant/30 bg-surface-container p-2 text-on-surface-variant"
                            aria-label="Previous page"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {PAGE_NUMBERS.map((page) => (
                            <button
                                key={page}
                                type="button"
                                className={`h-9 w-9 rounded-lg border text-sm font-medium ${
                                    page === 1
                                        ? "border-primary-fixed bg-primary-fixed text-[#1b1f3b]"
                                        : "border-outline-variant/30 bg-surface-container text-on-surface-variant"
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            className="rounded-lg border border-outline-variant/30 bg-surface-container p-2 text-on-surface-variant"
                            aria-label="Next page"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </nav>
                </div>
            </div>
        </section>
    );
}
