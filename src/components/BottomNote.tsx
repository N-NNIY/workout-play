import React from 'react'

interface BottomNoteProps {
  t: (key: string) => string
}

const BottomNote: React.FC<BottomNoteProps> = ({ t }) => {
  return (
    <div className="mt-16 text-center">
      <div className="inline-flex items-center gap-8 bg-white rounded-2xl px-8 py-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span>{t('bottomNoteMultiPlatform')}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span>{t('bottomNoteSmartSort')}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span>{t('bottomNoteContinuousPlay')}</span>
        </div>
      </div>
    </div>
  )
}

export default BottomNote
