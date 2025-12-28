import React, { useState } from 'react'
import Avatar from 'boring-avatars'

const AvatarSelector = ({ onSelect, currentAvatar }) => {
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || {
        variant: 'beam',
        name: '',
        colors: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95']
    })

    // Available avatar variants
    const variants = ['beam', 'marble', 'pixel', 'sunset', 'ring', 'bauhaus']

    // Color palettes for avatars
    const colorPalettes = [
        { name: 'Purple', colors: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'] },
        { name: 'Blue', colors: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'] },
        { name: 'Green', colors: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'] },
        { name: 'Pink', colors: ['#ec4899', '#db2777', '#be185d', '#9f1239', '#881337'] },
        { name: 'Orange', colors: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'] },
        { name: 'Teal', colors: ['#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a'] },
    ]

    // Sample names for avatar generation
    const sampleNames = [
        'Alex Morgan', 'Sam Wilson', 'Jordan Lee', 'Taylor Swift',
        'Casey Brown', 'Riley Johnson', 'Morgan Davis', 'Quinn Martinez',
        'Avery Garcia', 'Cameron Rodriguez', 'Dakota Williams', 'Skyler Jones'
    ]

    const handleSelect = (variant, colors, name) => {
        const avatar = { variant, colors, name }
        setSelectedAvatar(avatar)
        if (onSelect) {
            onSelect(avatar)
        }
    }

    return (
        <div className='w-full'>
            <h3 className='text-white text-lg font-medium mb-4'>Select Your Avatar Style</h3>

            {/* Selected Avatar Preview */}
            <div className='glass-strong p-6 rounded-2xl mb-6 flex flex-col items-center gap-4'>
                <Avatar
                    size={120}
                    name={selectedAvatar.name || 'Preview'}
                    variant={selectedAvatar.variant}
                    colors={selectedAvatar.colors}
                />
                <p className='text-slate-300 text-sm'>Selected Style: <span className='text-white font-medium capitalize'>{selectedAvatar.variant}</span></p>
            </div>

            {/* Avatar Variants Grid */}
            <div className='mb-6'>
                <h4 className='text-white text-sm font-medium mb-3'>Choose Avatar Type</h4>
                <div className='grid grid-cols-3 sm:grid-cols-6 gap-3'>
                    {variants.map((variant) => (
                        <button
                            key={variant}
                            onClick={() => handleSelect(variant, selectedAvatar.colors, selectedAvatar.name)}
                            className={`
                                glass-strong p-4 rounded-xl transition-all duration-300 hover-lift
                                ${selectedAvatar.variant === variant
                                    ? 'border-2 border-violet-500 shadow-lg shadow-violet-500/50'
                                    : 'border border-white/10'
                                }
                            `}
                        >
                            <div className='flex flex-col items-center gap-2'>
                                <Avatar
                                    size={50}
                                    name={selectedAvatar.name || 'Sample'}
                                    variant={variant}
                                    colors={selectedAvatar.colors}
                                />
                                <p className='text-xs text-slate-300 capitalize'>{variant}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Palettes */}
            <div className='mb-6'>
                <h4 className='text-white text-sm font-medium mb-3'>Choose Color Palette</h4>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                    {colorPalettes.map((palette) => (
                        <button
                            key={palette.name}
                            onClick={() => handleSelect(selectedAvatar.variant, palette.colors, selectedAvatar.name)}
                            className={`
                                glass-strong p-3 rounded-xl transition-all duration-300 hover-lift
                                ${JSON.stringify(selectedAvatar.colors) === JSON.stringify(palette.colors)
                                    ? 'border-2 border-violet-500'
                                    : 'border border-white/10'
                                }
                            `}
                        >
                            <div className='flex items-center gap-2'>
                                <div className='flex gap-1'>
                                    {palette.colors.slice(0, 3).map((color, i) => (
                                        <div
                                            key={i}
                                            className='w-6 h-6 rounded-full'
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <p className='text-xs text-slate-300 ml-auto'>{palette.name}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sample Avatar Names */}
            <div>
                <h4 className='text-white text-sm font-medium mb-3'>Or Choose from Samples</h4>
                <div className='glass-strong p-4 rounded-2xl max-h-[300px] overflow-y-auto'>
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                        {sampleNames.map((name) => (
                            <button
                                key={name}
                                onClick={() => handleSelect(selectedAvatar.variant, selectedAvatar.colors, name)}
                                className={`
                                    glass p-3 rounded-xl transition-all duration-300 hover-scale
                                    ${selectedAvatar.name === name
                                        ? 'border-2 border-violet-500'
                                        : 'border border-white/10'
                                    }
                                `}
                            >
                                <div className='flex flex-col items-center gap-2'>
                                    <Avatar
                                        size={50}
                                        name={name}
                                        variant={selectedAvatar.variant}
                                        colors={selectedAvatar.colors}
                                    />
                                    <p className='text-xs text-slate-300 text-center'>{name.split(' ')[0]}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AvatarSelector
