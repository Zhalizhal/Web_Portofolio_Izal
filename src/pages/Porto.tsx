import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PortfolioItem } from '../types/portfolio';
import portfolioData from '../data/portfolio.json';
import { useLanguage } from '../context/LanguageContext';

interface RawPortfolioItem {
    filename: string;
    title: string;
    scope: string;
    mainCategory: string;
    subCategory?: string | string[];
    size: "small" | "regular" | "wide" | "tall" | "large";
    additionalFiles?: string[];
}


const Porto: React.FC = () => {
    const { t } = useLanguage();
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

    const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [filterOpen, setFilterOpen] = useState(false);

    const galleryItems = useMemo(() => {
        if (!selectedItem) return [];
        const gallery = [{ url: selectedItem.src, type: selectedItem.type }];
        if (selectedItem.additionalFiles && selectedItem.additionalFiles.length > 0) {
            selectedItem.additionalFiles.forEach(url => {
                const isVideo = url.match(/\.(mp4|webm)($|\?)/i);
                gallery.push({ url, type: isVideo ? 'video' : 'image' });
            });
        }
        return gallery;
    }, [selectedItem]);

    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        setActiveIndex(0);
    }, [selectedItem]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedItem || galleryItems.length <= 1) return;
            if (e.key === 'ArrowLeft') {
                setActiveIndex(prev => (prev === 0 ? galleryItems.length - 1 : prev - 1));
            } else if (e.key === 'ArrowRight') {
                setActiveIndex(prev => (prev === galleryItems.length - 1 ? 0 : prev + 1));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedItem, galleryItems]);

    useEffect(() => {
        const loadAssets = async () => {
            const images = import.meta.glob('/src/assets/image/*.(jpg|png|jpeg|webp)', { eager: true, query: '?url', import: 'default' });
            const videos = import.meta.glob('/src/assets/video/*.(mp4|webm)', { eager: true, query: '?url', import: 'default' });
            const assetsMap = { ...images, ...videos };

            const loadedItems: PortfolioItem[] = [];

            // Loop over the JSON database (Single Source of Truth)
            (portfolioData as RawPortfolioItem[]).forEach((dbItem, index) => {
                // Find matching physical file URL in assetsMap
                const entry = Object.entries(assetsMap).find(([path]) => path.endsWith(dbItem.filename));
                
                // If found physically on disk, add it to display list
                if (entry) {
                    const [path, url] = entry;
                    const isVideo = path.match(/\.(mp4|webm)$/i);
                    const type = isVideo ? 'video' : 'image';

                    // Resolve additionalFiles if any
                    const resolvedAdditional: string[] = [];
                    if (dbItem.additionalFiles && dbItem.additionalFiles.length > 0) {
                        dbItem.additionalFiles.forEach(fn => {
                            const subEntry = Object.entries(assetsMap).find(([subPath]) => subPath.endsWith(fn));
                            if (subEntry) {
                                resolvedAdditional.push(subEntry[1] as string);
                            }
                        });
                    }

                    loadedItems.push({
                        id: path || `item-${index}`,
                        filename: dbItem.filename,
                        src: url as string,
                        type,
                        title: dbItem.title,
                        scope: dbItem.scope,
                        mainCategory: dbItem.mainCategory,
                        subCategory: dbItem.subCategory,
                        size: dbItem.size,
                        additionalFiles: resolvedAdditional
                    });
                }
            });

            setItems(loadedItems);
        };

        loadAssets();
    }, []);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const scopeMatch = selectedScopes.length === 0 || selectedScopes.includes(item.scope);
            
            const itemTypeLabel = item.type === 'image' ? 'Still image' : 'Animation';
            const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(itemTypeLabel);
            
            const categoryMatch = selectedCategories.length === 0 || 
                selectedCategories.includes(item.mainCategory) || 
                (item.subCategory && (
                    Array.isArray(item.subCategory)
                        ? item.subCategory.some(cat => selectedCategories.includes(cat))
                        : selectedCategories.includes(item.subCategory)
                ));

            return scopeMatch && typeMatch && categoryMatch;
        });
    }, [items, selectedScopes, selectedTypes, selectedCategories]);

    const toggleFilter = (filter: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (current.includes(filter)) {
            setter(current.filter(f => f !== filter));
        } else {
            setter([...current, filter]);
        }
    };

    const activeFilterCount = selectedScopes.length + selectedTypes.length + selectedCategories.length;

    return (
        <div className="min-h-screen bg-black text-white pt-24 md:pt-32 px-4 md:px-12 flex flex-col md:flex-row gap-6 md:gap-8 relative">

            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 flex-shrink-0 relative md:sticky md:top-32 h-fit z-10">
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-8">{t('works_title')}</h1>

                {/* Mobile toggle button */}
                <button
                    className="md:hidden w-full flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 mb-4 text-sm font-semibold text-white cursor-pointer"
                    onClick={() => setFilterOpen(prev => !prev)}
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 8h12M9 12h6M11 16h2" />
                        </svg>
                        {t('works_filter')}
                        {activeFilterCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </span>
                    <svg
                        className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${filterOpen ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Filter panel — always visible on desktop, collapsible on mobile */}
                <div className={`md:block space-y-6 md:space-y-8 overflow-hidden transition-all duration-300 ${filterOpen ? 'block' : 'hidden'}`}>
                    <h2 className="hidden md:block text-lg font-bold mb-4 border-b border-gray-800 pb-2">{t('works_filter')}</h2>

                    {/* Scope Filter */}
                    <div>
                        <h3 className="text-gray-500 text-sm mb-3">{t('works_scope')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                            {['Project', 'Konten'].map(opt => (
                                <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                                    <div className={`w-4 h-4 border border-gray-600 rounded flex items-center justify-center transition-colors shrink-0 ${selectedScopes.includes(opt) ? 'bg-blue-600 border-blue-600' : 'group-hover:border-gray-400'}`}>
                                        {selectedScopes.includes(opt) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedScopes.includes(opt)}
                                        onChange={() => toggleFilter(opt, selectedScopes, setSelectedScopes)}
                                    />
                                    <span className={`text-sm ${selectedScopes.includes(opt) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <h3 className="text-gray-500 text-sm mb-3">{t('works_type')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                            {['Still image', 'Animation'].map(opt => (
                                <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                                    <div className={`w-4 h-4 border border-gray-600 rounded flex items-center justify-center transition-colors shrink-0 ${selectedTypes.includes(opt) ? 'bg-blue-600 border-blue-600' : 'group-hover:border-gray-400'}`}>
                                        {selectedTypes.includes(opt) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedTypes.includes(opt)}
                                        onChange={() => toggleFilter(opt, selectedTypes, setSelectedTypes)}
                                    />
                                    <span className={`text-sm ${selectedTypes.includes(opt) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <h3 className="text-gray-500 text-sm mb-3">{t('works_category')}</h3>
                        <div className="space-y-2">
                            {[
                                { name: 'Architecture Visual', isSub: false },
                                { name: 'Exterior', isSub: true },
                                { name: 'Interior', isSub: true },
                                { name: 'Residential', isSub: true },
                                { name: 'Commercial', isSub: true },
                                { name: 'Hospitality', isSub: true },
                                { name: 'Real estate', isSub: true },
                                { name: 'Product Visual', isSub: false },
                                { name: 'Environment', isSub: false },
                                { name: 'Modelling', isSub: false },
                                { name: 'Vfx', isSub: false }
                            ].map(opt => (
                                <label key={opt.name} className={`flex items-center space-x-3 cursor-pointer group ${opt.isSub ? 'pl-4' : 'pt-2'}`}>
                                    <div className={`w-4 h-4 border border-gray-600 rounded flex items-center justify-center transition-colors shrink-0 ${selectedCategories.includes(opt.name) ? 'bg-blue-600 border-blue-600' : 'group-hover:border-gray-400'}`}>
                                        {selectedCategories.includes(opt.name) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedCategories.includes(opt.name)}
                                        onChange={() => toggleFilter(opt.name, selectedCategories, setSelectedCategories)}
                                    />
                                    <span className={`text-sm ${opt.isSub ? 'text-xs text-neutral-400 font-light' : 'font-semibold'} ${selectedCategories.includes(opt.name) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                        {opt.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Clear filters button (mobile) */}
                    {activeFilterCount > 0 && (
                        <button
                            className="md:hidden w-full text-center text-xs text-neutral-400 hover:text-white border border-neutral-800 rounded-lg py-2 transition-colors cursor-pointer"
                            onClick={() => {
                                setSelectedScopes([]);
                                setSelectedTypes([]);
                                setSelectedCategories([]);
                            }}
                        >
                            Hapus semua filter
                        </button>
                    )}
                </div>
            </aside>

            {/* Grid Content */}
            <div className="flex-1 min-h-[50vh] space-y-12 pb-16">

                {/* Images Section */}
                {filteredItems.some(i => i.type === 'image') && (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-2 md:gap-4 space-y-2 md:space-y-4">
                        <AnimatePresence>
                            {filteredItems.filter(i => i.type === 'image').map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4 }}
                                    className="relative group break-inside-avoid overflow-hidden cursor-pointer rounded-lg mb-2 md:mb-4"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <img
                                        src={item.src}
                                        alt={item.title}
                                        className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-700"
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Videos Section */}
                {filteredItems.some(i => i.type === 'video') && (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-2 md:gap-4 space-y-2 md:space-y-4">
                        <AnimatePresence>
                            {filteredItems.filter(i => i.type === 'video').map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4 }}
                                    className="relative group break-inside-avoid overflow-hidden cursor-pointer rounded-lg mb-2 md:mb-4"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <div className="w-full relative">
                                        <video
                                            src={item.src}
                                            className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                                            loop
                                            muted
                                            playsInline
                                            onMouseOver={(e) => e.currentTarget.play()}
                                            onMouseOut={(e) => {
                                                e.currentTarget.pause();
                                                e.currentTarget.currentTime = 0;
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-12 h-12 rounded-full border border-white/50 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform bg-black/20">
                                                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {filteredItems.length === 0 && (
                    <div className="w-full py-20 text-center text-gray-500">
                        {t('works_no_items')}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedItem && galleryItems.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4"
                        onClick={() => setSelectedItem(null)}
                    >
                        <div className="relative w-full max-w-7xl h-[65vh] sm:h-[70vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute -top-10 right-0 z-10 p-2 text-white/50 hover:text-white transition-colors cursor-pointer"
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            {/* Arrow Left */}
                            {galleryItems.length > 1 && (
                                <button
                                    onClick={() => setActiveIndex(prev => (prev === 0 ? galleryItems.length - 1 : prev - 1))}
                                    className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 hover:border-white/30 backdrop-blur-sm transition-all z-10 cursor-pointer"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                </button>
                            )}

                            {/* Main Content */}
                            {galleryItems[activeIndex].type === 'video' ? (
                                <video
                                    key={galleryItems[activeIndex].url}
                                    src={galleryItems[activeIndex].url}
                                    className="w-full h-full object-contain rounded-lg shadow-2xl"
                                    controls
                                    autoPlay
                                />
                            ) : (
                                <img
                                    key={galleryItems[activeIndex].url}
                                    src={galleryItems[activeIndex].url}
                                    alt={selectedItem.title}
                                    className="w-full h-full object-contain rounded-lg shadow-2xl"
                                />
                            )}

                            {/* Arrow Right */}
                            {galleryItems.length > 1 && (
                                <button
                                    onClick={() => setActiveIndex(prev => (prev === galleryItems.length - 1 ? 0 : prev + 1))}
                                    className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 hover:border-white/30 backdrop-blur-sm transition-all z-10 cursor-pointer"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            )}
                        </div>

                        {/* Thumbnails Row */}
                        {galleryItems.length > 1 && (
                            <div 
                                className="mt-4 sm:mt-8 flex gap-2 z-20 max-w-full overflow-x-auto px-4 py-2 bg-neutral-900/60 border border-neutral-800/80 rounded-full backdrop-blur-md"
                                onClick={e => e.stopPropagation()}
                            >
                                {galleryItems.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveIndex(index)}
                                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${index === activeIndex ? 'border-blue-500 scale-110' : 'border-neutral-800 hover:border-neutral-600'}`}
                                    >
                                        {item.type === 'video' ? (
                                            <video src={item.url} muted className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={item.url} className="w-full h-full object-cover" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Porto;
