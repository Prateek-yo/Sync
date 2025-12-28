import React from 'react'

const TypingIndicator = ({ userName }) => {
    return (
        <div className='flex items-end gap-2 mb-8 fade-in'>
            <div className='typing-indicator'>
                <div className='typing-dot'></div>
                <div className='typing-dot'></div>
                <div className='typing-dot'></div>
            </div>
            {userName && (
                <span className='text-xs text-slate-400'>{userName} is typing...</span>
            )}
        </div>
    )
}

export default TypingIndicator
