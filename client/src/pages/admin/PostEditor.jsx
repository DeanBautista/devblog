import { useEffect, useRef, useState } from "react";
import DocumentationEditor from "../../components/editor/DocumentationEditor";
import { DOCUMENTATION_TYPES } from "../../components/editor/documentationToolsets";

const UploadOverlay = () => (
    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
        <span className="text-sm">Replace</span>
    </div>
);

export default function PostEditor() {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [documentationType, setDocumentationType] = useState(DOCUMENTATION_TYPES[0].id);
    const [editorContent, setEditorContent] = useState("");

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (preview) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(file));
    };

    return (
        <>
            <div className="w-full flex justify-end gap-4">
                <button className="px-5 py-2 rounded-full border-1">Draft</button>
                <button className="text-black font-medium px-5 py-2 rounded-full bg-primary-fixed">Publish</button>
            </div>

            <main className="mt-10">
                <div>
                    <div>
                        <div className="ml-auto bg-surface-container rounded-full flex items-center w-fit px-4 py-1">
                            <span className="text-sm">Last edited 2m ago</span>
                        </div>

                        <div className="flex flex-col mt-3">
                            <span className="text-sm">Editor/Draft</span>
                            <h1 className="text-3xl font-bold">New Post</h1>
                        </div>
                    </div>

                    <div className="mt-10">
                        <div>
                            <input
                                className="w-full outline-none text-4xl font-medium"
                                type="text"
                                placeholder="Post title..."
                            />

                            <div className="mt-10 flex flex-col gap-3 lg:w-full lg:flex-row">
                                <div className="w-full bg-surface-container px-3 py-2 rounded-lg flex gap-1 items-center">
                                    <span className="text-sm text-secondary">obsidian.io/blog/</span>
                                    <input type="text" placeholder="your-post-slug" className="w-full outline-none text-sm" />
                                </div>

                                <div className="flex gap-4">
                                    <button className="whitespace-nowrap text-sm px-4 py-2 bg-on-tertiary rounded-lg">~5 min read</button>
                                    <button className="whssitespace-nowrap text-sm px-4 py-2 bg-on-tertiary rounded-lg">Oct 24, 2023</button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 bg-surface-container rounded-xl p-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />

                            <div className="flex flex-col gap-3 lg:hidden">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold tracking-widest uppercase">Cover Image</span>
                                    <span className="text-xs italic text-secondary">Auto-scaling enabled</span>
                                </div>

                                <input
                                    type="text"
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full bg-on-tertiary outline-none text-sm px-4 py-3 rounded-lg"
                                />

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative w-full h-52 rounded-lg overflow-hidden bg-on-tertiary cursor-pointer group"
                                >
                                    {preview ? (
                                        <>
                                            <img src={preview} className="w-full h-full object-cover" alt="Cover preview" />
                                            <UploadOverlay />
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-secondary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" x2="12" y1="3" y2="15" />
                                            </svg>
                                            <span className="text-xs">Click to upload image</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="hidden lg:flex lg:items-start lg:gap-4">
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary shrink-0">
                                            <rect width="18" height="18" x="3" y="3" rx="2" />
                                            <circle cx="9" cy="9" r="2" />
                                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                        </svg>
                                        <span className="text-xs font-semibold tracking-widest uppercase">Cover Image</span>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full bg-on-tertiary outline-none text-sm px-4 py-3 rounded-lg"
                                    />

                                    <span className="text-xs text-secondary">
                                        Recommended size: 1600x900px. High resolution JPG or WebP preferred for faster loading.
                                    </span>
                                </div>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative w-24 h-20 rounded-lg overflow-hidden bg-on-tertiary shrink-0 cursor-pointer group"
                                >
                                    {preview ? (
                                        <>
                                            <img src={preview} className="w-full h-full object-cover" alt="Cover preview" />
                                            <UploadOverlay />
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-secondary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" x2="12" y1="3" y2="15" />
                                            </svg>
                                            <span className="text-[10px] text-center leading-tight px-1">Upload</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DocumentationEditor
                            documentationType={documentationType}
                            onChangeDocumentationType={setDocumentationType}
                            value={editorContent}
                            onChangeValue={setEditorContent}
                        />
                    </div>
                </div>
            </main>
        </>
    );
}
