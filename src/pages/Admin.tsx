import React, { useState, useEffect } from 'react';
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

const Admin: React.FC = () => {
    const { t } = useLanguage();
    const [items, setItems] = useState<RawPortfolioItem[]>(portfolioData as RawPortfolioItem[]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
    const [uploading, setUploading] = useState(false);
    const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadAssets = async () => {
            const images = import.meta.glob('/src/assets/image/*.(jpg|png|jpeg|webp)', { eager: true, query: '?url', import: 'default' });
            const videos = import.meta.glob('/src/assets/video/*.(mp4|webm)', { eager: true, query: '?url', import: 'default' });
            const combined = { ...images, ...videos };

            const urls: Record<string, string> = {};
            Object.entries(combined).forEach(([path, url]) => {
                const filename = path.split('/').pop() || '';
                urls[filename] = url as string;
            });
            setAssetUrls(urls);
        };
        loadAssets();
    }, [items]);

    // Form states
    const [filename, setFilename] = useState('');
    const [title, setTitle] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Sub-assets states
    const [additionalFiles, setAdditionalFiles] = useState<string[]>([]);
    const [selectedAdditionalFiles, setSelectedAdditionalFiles] = useState<File[]>([]);
    const [additionalPreviewUrls, setAdditionalPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        return () => {
            additionalPreviewUrls.forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [additionalPreviewUrls]);

    const handleAdditionalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setSelectedAdditionalFiles(prev => [...prev, ...files]);

        // Generate preview URLs
        const localUrls = files.map(file => URL.createObjectURL(file));
        setAdditionalPreviewUrls(prev => [...prev, ...localUrls]);

        setMessage({ text: `${files.length} berkas tambahan dipilih secara lokal.`, isError: false });
        e.target.value = '';
    };

    const removeSelectedAdditionalFile = (index: number) => {
        const urlToRevoke = additionalPreviewUrls[index];
        if (urlToRevoke && urlToRevoke.startsWith('blob:')) {
            URL.revokeObjectURL(urlToRevoke);
        }

        setSelectedAdditionalFiles(prev => prev.filter((_, i) => i !== index));
        setAdditionalPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingAdditionalFile = (index: number) => {
        setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Selection states for bulk delete
    const [selectedFilenames, setSelectedFilenames] = useState<string[]>([]);

    const toggleSelect = (fn: string) => {
        if (selectedFilenames.includes(fn)) {
            setSelectedFilenames(selectedFilenames.filter(f => f !== fn));
        } else {
            setSelectedFilenames([...selectedFilenames, fn]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedFilenames.length === items.length) {
            setSelectedFilenames([]);
        } else {
            setSelectedFilenames(items.map(item => item.filename));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedFilenames.length === 0) return;

        if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedFilenames.length} item terpilih beserta seluruh berkas asetnya secara permanen dari komputer?`)) {
            try {
                setUploading(true);
                setMessage(null);

                // Find all filenames (main and additional) to delete
                const filesToDelete = new Set<string>();
                for (const fn of selectedFilenames) {
                    filesToDelete.add(fn);
                    const item = items.find(i => i.filename === fn);
                    if (item && item.additionalFiles && item.additionalFiles.length > 0) {
                        item.additionalFiles.forEach(subFn => filesToDelete.add(subFn));
                    }
                }

                // Delete files physically via API
                for (const fn of filesToDelete) {
                    await fetch('/api/delete-asset', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ filename: fn }),
                    });
                }

                // Filter out deleted from state
                const updated = items.filter(item => !selectedFilenames.includes(item.filename));
                setItems(updated);

                // Save list update
                const saveResponse = await fetch('/api/save-portfolio', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updated),
                });
                const saveData = await saveResponse.json();

                if (saveData.success) {
                    setMessage({ text: `${selectedFilenames.length} item dan seluruh berkas aset terkait berhasil dihapus secara permanen!`, isError: false });
                } else {
                    setMessage({ text: 'Item dihapus dari disk, namun gagal menyimpan database JSON: ' + saveData.error, isError: true });
                }

                setSelectedFilenames([]);
            } catch (error) {
                setMessage({ text: 'Terjadi kesalahan saat menghapus item terpilih.', isError: true });
                console.error(error);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setFilename(file.name);

        // Instant local object URL preview
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);

        if (!title) {
            const cleanTitle = file.name.split('.')[0].replace(/[-_]/g, ' ').replace(/([A-Z])/g, ' $1').trim();
            setTitle(cleanTitle);
        }
        if (file.type.startsWith('video/')) {
            setMainCategory('Product Visual');
            setSubCategoriesSelected([]);
        } else {
            setMainCategory('Architecture Visual');
            setSubCategoriesSelected(['Exterior']);
        }

        setMessage({ text: `File "${file.name}" terpilih secara lokal. Klik "Tambahkan" atau "Perbarui" untuk mengunggah secara permanen.`, isError: false });
        e.target.value = '';
    };
    const [scope, setScope] = useState('Project');
    const [mainCategory, setMainCategory] = useState('Architecture Visual');
    const [subCategoriesSelected, setSubCategoriesSelected] = useState<string[]>(['Exterior']);
    const [size, setSize] = useState<'small' | 'regular' | 'wide' | 'tall' | 'large'>('regular');

    const subCategories = ['Exterior', 'Interior', 'Residential', 'Commercial', 'Hospitality', 'Real estate'];

    const handleMainCategoryChange = (val: string) => {
        setMainCategory(val);
        if (val === 'Architecture Visual') {
            setSubCategoriesSelected(['Exterior']);
        } else {
            setSubCategoriesSelected([]);
        }
    };

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = async (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        await moveItem(draggedIndex, index);
        setDraggedIndex(null);
    };

    const moveItem = async (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= items.length) return;
        const updated = [...items];
        const [movedItem] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, movedItem);
        setItems(updated);

        try {
            const saveResponse = await fetch('/api/save-portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updated),
            });
            const saveData = await saveResponse.json();
            if (saveData.success) {
                setMessage({ text: 'Urutan portofolio berhasil disimpan!', isError: false });
            } else {
                setMessage({ text: 'Urutan diubah secara lokal, namun gagal disimpan ke disk: ' + saveData.error, isError: true });
            }
        } catch (saveError) {
            console.error("Order save failed:", saveError);
            setMessage({ text: 'Urutan diubah secara lokal, namun gagal disimpan otomatis akibat kesalahan jaringan.', isError: true });
        }
    };

    const compressImage = (file: File, maxWidth = 1920, maxHeight = 1920, quality = 0.82): Promise<File> => {
        return new Promise((resolve) => {
            if (!file.type.startsWith('image/')) {
                resolve(file);
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        resolve(file);
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    const isPng = file.type === 'image/png';
                    const format = isPng ? 'image/png' : 'image/jpeg';
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                resolve(file);
                                return;
                            }
                            const compressedFile = new File([blob], file.name, {
                                type: format,
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        },
                        format,
                        isPng ? undefined : quality
                    );
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const resetForm = () => {
        setFilename('');
        setTitle('');
        setScope('Project');
        setMainCategory('Architecture Visual');
        setSubCategoriesSelected(['Exterior']);
        setSize('regular');
        setEditingIndex(null);
        setPreviewUrl(null);
        setSelectedFile(null);
        setAdditionalFiles([]);
        setSelectedAdditionalFiles([]);
        additionalPreviewUrls.forEach(url => {
            if (url && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        setAdditionalPreviewUrls([]);
    };

    const handleEdit = (idx: number) => {
        const item = items[idx];
        setEditingIndex(idx);
        setFilename(item.filename);
        setTitle(item.title);
        setScope(item.scope);
        setMainCategory(item.mainCategory);
        if (item.subCategory) {
            setSubCategoriesSelected(Array.isArray(item.subCategory) ? item.subCategory : [item.subCategory]);
        } else {
            setSubCategoriesSelected([]);
        }
        setSize(item.size);
        setPreviewUrl(assetUrls[item.filename] || null);
        setSelectedFile(null);

        // Load sub-assets
        const existing = item.additionalFiles || [];
        setAdditionalFiles(existing);
        setSelectedAdditionalFiles([]);

        // For existing files, resolve preview URLs from assets map
        const urls = existing.map(fn => assetUrls[fn] || '');
        setAdditionalPreviewUrls(urls);
    };

    const handleDelete = async (idx: number) => {
        const item = items[idx];
        if (window.confirm(`Apakah Anda yakin ingin menghapus "${item.title}" dan semua berkas asetnya secara permanen?`)) {
            try {
                // Delete main file
                await fetch('/api/delete-asset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ filename: item.filename }),
                });

                // Delete additional files
                if (item.additionalFiles && item.additionalFiles.length > 0) {
                    for (const fn of item.additionalFiles) {
                        await fetch('/api/delete-asset', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ filename: fn }),
                        });
                    }
                }

                const updated = items.filter((_, i) => i !== idx);
                setItems(updated);

                const saveResponse = await fetch('/api/save-portfolio', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updated),
                });
                const saveData = await saveResponse.json();

                if (saveData.success) {
                    setMessage({ text: `Item "${item.title}" beserta seluruh file asetnya berhasil dihapus secara permanen!`, isError: false });
                } else {
                    setMessage({ text: 'Item dihapus dari disk, namun gagal menyimpan database JSON: ' + saveData.error, isError: true });
                }
            } catch (error) {
                setMessage({ text: 'Terjadi kesalahan jaringan saat menghapus item.', isError: true });
                console.error(error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!filename.trim() || !title.trim()) {
            setMessage({ text: 'Nama file dan judul harus diisi!', isError: true });
            return;
        }

        let finalFilename = filename.trim();

        const ext = finalFilename.split('.').pop()?.toLowerCase();
        const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm'];
        if (!ext || !validExtensions.includes(ext)) {
            setMessage({
                text: 'Nama file utama tidak valid! Harus diakhiri dengan ekstensi berkas yang didukung (seperti .jpg, .png, .mp4).',
                isError: true
            });
            return;
        }

        setUploading(true);

        if (selectedFile) {
            let fileToUpload = selectedFile;
            if (selectedFile.type.startsWith('image/')) {
                setMessage({ text: `Sedang mengompres berkas utama "${selectedFile.name}"...`, isError: false });
                try {
                    fileToUpload = await compressImage(selectedFile);
                } catch (err) {
                    console.error("Compression failed:", err);
                }
            }
            setMessage({ text: `Sedang mengunggah berkas utama "${fileToUpload.name}"...`, isError: false });

            try {
                const response = await fetch('/api/upload-asset', {
                    method: 'POST',
                    headers: {
                        'x-filename': fileToUpload.name,
                        'Content-Type': 'application/octet-stream',
                    },
                    body: fileToUpload,
                });

                const data = await response.json();
                if (data.success) {
                    finalFilename = data.filename;
                } else {
                    setMessage({ text: 'Gagal mengunggah berkas utama: ' + data.error, isError: true });
                    setUploading(false);
                    return;
                }
            } catch (error) {
                setMessage({ text: 'Terjadi kesalahan jaringan saat mengunggah berkas utama.', isError: true });
                console.error(error);
                setUploading(false);
                return;
            }
        }

        // Upload additional files
        const uploadedAdditional: string[] = [...additionalFiles];
        if (selectedAdditionalFiles.length > 0) {
            for (const file of selectedAdditionalFiles) {
                let fileToUpload = file;
                if (file.type.startsWith('image/')) {
                    setMessage({ text: `Sedang mengompres berkas tambahan "${file.name}"...`, isError: false });
                    try {
                        fileToUpload = await compressImage(file);
                    } catch (err) {
                        console.error("Additional compression failed:", err);
                    }
                }
                setMessage({ text: `Sedang mengunggah berkas tambahan "${fileToUpload.name}"...`, isError: false });
                try {
                    const response = await fetch('/api/upload-asset', {
                        method: 'POST',
                        headers: {
                            'x-filename': fileToUpload.name,
                            'Content-Type': 'application/octet-stream',
                        },
                        body: fileToUpload,
                    });
                    const data = await response.json();
                    if (data.success) {
                        uploadedAdditional.push(data.filename);
                    } else {
                        setMessage({ text: 'Gagal mengunggah berkas tambahan: ' + data.error, isError: true });
                        setUploading(false);
                        return;
                    }
                } catch (error) {
                    setMessage({ text: 'Terjadi kesalahan jaringan saat mengunggah berkas tambahan.', isError: true });
                    console.error(error);
                    setUploading(false);
                    return;
                }
            }
        }

        const newItem: RawPortfolioItem = {
            filename: finalFilename,
            title: title.trim(),
            scope,
            mainCategory,
            size,
            ...(mainCategory === 'Architecture Visual' && subCategoriesSelected.length > 0 ? { subCategory: subCategoriesSelected } : {}),
            ...(uploadedAdditional.length > 0 ? { additionalFiles: uploadedAdditional } : {})
        };

        let updated: RawPortfolioItem[];
        if (editingIndex !== null) {
            updated = [...items];
            updated[editingIndex] = newItem;
        } else {
            updated = [newItem, ...items];
        }

        setItems(updated);

        // Auto-save to prevent data loss on HMR/reload
        try {
            const saveResponse = await fetch('/api/save-portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updated),
            });
            const saveData = await saveResponse.json();
            if (saveData.success) {
                setMessage({ text: 'Item berhasil ditambahkan/diperbarui dan database portofolio disimpan secara lokal!', isError: false });
            } else {
                setMessage({ text: 'Item ditambahkan, namun gagal menyimpan otomatis ke disk: ' + saveData.error, isError: true });
            }
        } catch (saveError) {
            console.error("Auto-save failed:", saveError);
            setMessage({ text: 'Item ditambahkan ke daftar, namun gagal menyimpan otomatis ke disk akibat kesalahan jaringan.', isError: true });
        }

        resetForm();
        setUploading(false);
    };

    const handleSaveDatabase = async () => {
        try {
            const response = await fetch('/api/save-portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(items),
            });

            const data = await response.json();
            if (data.success) {
                setMessage({ text: 'Database portfolio.json berhasil disimpan di lokal!', isError: false });
            } else {
                setMessage({ text: 'Gagal menyimpan database: ' + data.error, isError: true });
            }
        } catch (error) {
            setMessage({ text: 'Terjadi kesalahan jaringan saat menyimpan data.', isError: true });
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white pt-24 md:pt-32 px-3 sm:px-4 md:px-12 pb-16 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-neutral-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('admin_title')}</h1>
                        <p className="text-neutral-400 text-sm mt-1">{t('admin_subtitle')}</p>
                    </div>
                    <button
                        onClick={handleSaveDatabase}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded font-semibold text-sm transition-colors shadow-lg cursor-pointer"
                    >
                        Save Database
                    </button>
                </div>

                {message && (
                    <div className={`p-4 mb-6 rounded text-sm font-medium ${message.isError ? 'bg-red-950/60 border border-red-800/80 text-red-300' : 'bg-green-950/60 border border-green-800/80 text-green-300'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Input */}
                    <div className="lg:col-span-1 bg-neutral-900/60 border border-neutral-800 p-6 rounded-lg h-fit">
                        <h2 className="text-lg font-bold mb-4 border-b border-neutral-800 pb-2">
                            {editingIndex !== null ? 'Edit Portfolio Item' : 'Add New Item'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-neutral-400 mb-1 font-medium">Pilih & Upload File Aset</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        className="hidden"
                                        id="asset-upload-input"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor="asset-upload-input"
                                        className={`w-full flex items-center justify-between bg-black border border-neutral-800 hover:border-neutral-600 rounded px-3 py-2 text-neutral-400 hover:text-white transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span>{uploading ? 'Sedang mengunggah...' : 'Pilih File Gambar / Video...'}</span>
                                        <svg className={`w-4 h-4 text-neutral-400 ${uploading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            {uploading ? (
                                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                                            ) : (
                                                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
                                            )}
                                        </svg>
                                    </label>
                                </div>
                                <p className="text-neutral-500 text-[10px] mt-0.5">Otomatis mengunggah ke folder proyek Anda (assets/image atau assets/video).</p>
                            </div>

                            {previewUrl && (
                                <div className="mt-2 border border-neutral-800 rounded bg-black/40 overflow-hidden relative animate-fadeIn">
                                    <div className="text-[10px] text-neutral-500 font-mono p-1.5 border-b border-neutral-800 bg-neutral-900/60 uppercase tracking-wider">
                                        Asset Preview
                                    </div>
                                    <div className="flex items-center justify-center p-2 bg-neutral-950/40 min-h-[120px] max-h-[220px]">
                                        {filename.match(/\.(mp4|webm)$/i) ? (
                                            <video
                                                src={previewUrl}
                                                controls
                                                muted
                                                className="max-w-full max-h-[200px] object-contain rounded shadow-lg"
                                            />
                                        ) : (
                                            <img
                                                src={previewUrl}
                                                alt="Upload Preview"
                                                className="max-w-full max-h-[200px] object-contain rounded shadow-lg"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Berkas Tambahan (Multiple Files) */}
                            <div>
                                <label className="block text-neutral-400 mb-1 font-medium">{t('admin_label_additional')}</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        multiple
                                        className="hidden"
                                        id="additional-assets-input"
                                        onChange={handleAdditionalFilesChange}
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor="additional-assets-input"
                                        className={`w-full flex items-center justify-between bg-black border border-neutral-800 hover:border-neutral-600 rounded px-3 py-2 text-neutral-400 hover:text-white transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span>Pilih Berkas Tambahan (Bisa Banyak)...</span>
                                        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </label>
                                </div>
                                <p className="text-neutral-500 text-[10px] mt-0.5">{t('admin_desc_additional')}</p>

                                {/* Previews of selected additional files */}
                                {additionalPreviewUrls.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <div className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase">
                                            Galeri Sub-Aset ({additionalPreviewUrls.length})
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 bg-black/40 border border-neutral-800 p-2 rounded">
                                            {additionalPreviewUrls.map((url, index) => {
                                                const isExisting = index < additionalFiles.length && editingIndex !== null;
                                                const fn = isExisting ? additionalFiles[index] : (selectedAdditionalFiles[index - additionalFiles.length]?.name || '');
                                                const isVideo = fn.match(/\.(mp4|webm)$/i);

                                                return (
                                                    <div key={index} className="relative group aspect-square bg-neutral-950 border border-neutral-800 rounded overflow-hidden">
                                                        {url ? (
                                                            isVideo ? (
                                                                <video src={url} muted className="w-full h-full object-cover" />
                                                            ) : (
                                                                <img src={url} alt="Sub Asset Preview" className="w-full h-full object-cover" />
                                                            )
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[8px] text-neutral-700">No File</div>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (isExisting) {
                                                                    removeExistingAdditionalFile(index);
                                                                    setAdditionalPreviewUrls(prev => prev.filter((_, i) => i !== index));
                                                                } else {
                                                                    removeSelectedAdditionalFile(index - additionalFiles.length);
                                                                }
                                                            }}
                                                            className="absolute top-1 right-1 bg-red-900/90 hover:bg-red-800 text-white rounded-full p-0.5 shadow transition-colors cursor-pointer"
                                                            title="Hapus"
                                                        >
                                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-neutral-400 mb-1 font-medium">Nama File Aset (Filename)</label>
                                <input
                                    type="text"
                                    placeholder="contoh: 09Villa.jpg atau Pulkam.mp4"
                                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-600"
                                    value={filename}
                                    onChange={(e) => setFilename(e.target.value)}
                                />
                                <p className="text-neutral-500 text-[10px] mt-0.5">Dapat diisi manual atau terisi otomatis setelah mengunggah file di atas.</p>
                            </div>

                            <div>
                                <label className="block text-neutral-400 mb-1 font-medium">Judul (Title)</label>
                                <input
                                    type="text"
                                    placeholder="contoh: Villa Modern Lamongan"
                                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-600"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-400 mb-1 font-medium">Scope</label>
                                <select
                                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-600"
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value)}
                                >
                                    <option value="Project">Project</option>
                                    <option value="Konten">Konten</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-neutral-400 mb-1 font-medium">Main Category</label>
                                <select
                                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-600"
                                    value={mainCategory}
                                    onChange={(e) => handleMainCategoryChange(e.target.value)}
                                >
                                    <option value="Architecture Visual">Architecture Visual</option>
                                    <option value="Product Visual">Product Visual</option>
                                    <option value="Environment">Environment</option>
                                    <option value="Modelling">Modelling</option>
                                    <option value="Vfx">Vfx</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-neutral-400 mb-2 font-medium">Sub Categories</label>
                                <div className="grid grid-cols-2 gap-2 bg-neutral-950 border border-neutral-800 rounded p-3">
                                    {subCategories.map(cat => {
                                        const isChecked = subCategoriesSelected.includes(cat);
                                        return (
                                            <label key={cat} className="flex items-center space-x-2 cursor-pointer group py-1">
                                                <input
                                                    type="checkbox"
                                                    className="rounded bg-black border-neutral-800 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        if (isChecked) {
                                                            setSubCategoriesSelected(subCategoriesSelected.filter(c => c !== cat));
                                                        } else {
                                                            setSubCategoriesSelected([...subCategoriesSelected, cat]);
                                                        }
                                                    }}
                                                />
                                                <span className="text-neutral-300 text-sm group-hover:text-white transition-colors">{cat}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral-400 mb-1 font-medium">Layout Grid Size</label>
                                <select
                                    className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-600"
                                    value={size}
                                    onChange={(e) => setSize(e.target.value as any)}
                                >
                                    <option value="small">small (kecil)</option>
                                    <option value="regular">regular (sedang)</option>
                                    <option value="wide">wide (lebar mendatar)</option>
                                    <option value="tall">tall (tinggi vertikal)</option>
                                    <option value="large">large (besar)</option>
                                </select>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded transition-colors"
                                >
                                    {editingIndex !== null ? 'Perbarui' : 'Tambahkan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Daftar Item */}
                    <div className="lg:col-span-2 bg-neutral-900/60 border border-neutral-800 p-6 rounded-lg">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-neutral-800 pb-3 gap-2">
                            <div>
                                <h2 className="text-lg font-bold">List Portfolio Items ({items.length})</h2>
                                <p className="text-xs text-neutral-500 font-mono">Urutan atas tampil pertama</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {items.length > 0 && (
                                    <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer hover:text-white select-none">
                                        <input
                                            type="checkbox"
                                            checked={selectedFilenames.length === items.length && items.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-neutral-800 text-blue-600 focus:ring-blue-500 bg-black cursor-pointer w-4 h-4"
                                        />
                                        <span>Select All</span>
                                    </label>
                                )}
                                {selectedFilenames.length > 0 && (
                                    <button
                                        onClick={handleBulkDelete}
                                        className="px-3 py-1 bg-red-900 hover:bg-red-800 text-red-200 text-xs font-semibold rounded transition-colors shadow cursor-pointer"
                                    >
                                        Hapus Terpilih ({selectedFilenames.length})
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {items.map((item, idx) => {
                                const fileUrl = assetUrls[item.filename];
                                const isVideo = item.filename.match(/\.(mp4|webm)$/i);

                                return (
                                    <div
                                        key={idx}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => handleDrop(e, idx)}
                                        className={`flex flex-col sm:flex-row sm:justify-between sm:items-center bg-black/60 border p-3 rounded transition-all text-sm gap-3 sm:gap-4 cursor-grab active:cursor-grabbing ${draggedIndex === idx
                                                ? 'border-blue-600 opacity-40 bg-neutral-900'
                                                : 'border-neutral-800/80 hover:border-neutral-750'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                            {/* Drag Handle Icon — hidden on mobile */}
                                            <div className="hidden sm:block text-neutral-600 hover:text-neutral-400 cursor-grab active:cursor-grabbing shrink-0 pr-1 select-none" title="Drag to reorder">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM5 6a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM5 10a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM5 14a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={selectedFilenames.includes(item.filename)}
                                                onChange={() => toggleSelect(item.filename)}
                                                className="rounded border-neutral-800 text-blue-600 focus:ring-blue-500 bg-black cursor-pointer w-4 h-4 shrink-0"
                                            />
                                            {/* Preview Thumbnail */}
                                            <div className="w-12 h-12 rounded overflow-hidden bg-neutral-900 border border-neutral-800 flex-shrink-0 flex items-center justify-center">
                                                {fileUrl ? (
                                                    isVideo ? (
                                                        <video src={fileUrl} muted className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={fileUrl} alt={item.title} className="w-full h-full object-cover" />
                                                    )
                                                ) : (
                                                    <span className="text-[10px] text-neutral-600 font-mono">No File</span>
                                                )}
                                            </div>

                                            <div className="space-y-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-bold text-white truncate max-w-[180px] sm:max-w-none">{item.title}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase shrink-0 ${item.scope === 'Project' ? 'bg-blue-950 text-blue-300' : 'bg-purple-950 text-purple-300'}`}>
                                                        {item.scope}
                                                    </span>
                                                    <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-mono shrink-0">
                                                        {item.size}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-neutral-400 flex flex-wrap gap-x-3 gap-y-0.5">
                                                    <span className="truncate max-w-full">File: <code className="text-neutral-300 break-all">{item.filename}</code></span>
                                                    <span className="shrink-0">Main: <strong className="text-neutral-300">{item.mainCategory}</strong></span>
                                                    {item.subCategory && (
                                                        <span className="shrink-0">Sub: <strong className="text-neutral-300">
                                                            {Array.isArray(item.subCategory) ? item.subCategory.join(', ') : item.subCategory}
                                                        </strong></span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                                            {/* Up / Down Reorder buttons */}
                                            <div className="flex flex-col gap-1 mr-1 shrink-0">
                                                <button
                                                    type="button"
                                                    disabled={idx === 0}
                                                    onClick={() => moveItem(idx, idx - 1)}
                                                    className="p-1 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded border border-neutral-800 transition-colors cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                                                    title="Move Up"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                        <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={idx === items.length - 1}
                                                    onClick={() => moveItem(idx, idx + 1)}
                                                    className="p-1 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded border border-neutral-800 transition-colors cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                                                    title="Move Down"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleEdit(idx)}
                                                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-white rounded text-xs transition-colors cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(idx)}
                                                className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 rounded text-xs transition-colors cursor-pointer"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
