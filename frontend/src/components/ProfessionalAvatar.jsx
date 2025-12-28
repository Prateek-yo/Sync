import React from 'react'
import Avatar from 'boring-avatars'

/**
 * Professional Avatar Component
 * Uses boring-avatars library to render consistent, beautiful avatars
 * 
 * @param {Object} avatarData - Avatar configuration {variant, colors, name}
 * @param {Number} size - Avatar size in pixels
 * @param {String} fallbackName - Fallback name if avatarData doesn't have name
 * @param {String} className - Additional CSS classes
 */
const ProfessionalAvatar = ({ avatarData, size = 40, fallbackName = 'User', className = '' }) => {
    // Default avatar config
    const defaultConfig = {
        variant: 'beam',
        colors: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'],
        name: fallbackName
    }

    // Use provided avatar data or default
    const config = avatarData || defaultConfig
    const name = config.name || fallbackName

    return (
        <div className={`avatar-wrapper ${className}`}>
            <Avatar
                size={size}
                name={name}
                variant={config.variant || defaultConfig.variant}
                colors={config.colors || defaultConfig.colors}
                square={false}
            />
        </div>
    )
}

export default ProfessionalAvatar
