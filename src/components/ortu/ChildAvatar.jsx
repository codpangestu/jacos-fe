import { getChildAvatar, getChildGender } from '../../lib/childProfile'
import { storageUrl } from '../../lib/api'

export default function ChildAvatar({
  child,
  className = 'h-10 w-10',
  imgClassName = 'h-full w-full object-cover',
  usePhotoIfAvailable = false,
}) {
  const gender = getChildGender(child)
  const defaultVector = getChildAvatar(child)
  const photoSrc = (usePhotoIfAvailable && child?.photo_path)
    ? storageUrl(child.photo_path)
    : defaultVector

  const bgClass = gender === 'female' ? 'bg-[#FCE7F3]' : 'bg-[#E0F2FE]'

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-xs ${bgClass} ${className}`}
    >
      <img
        src={photoSrc}
        onError={(e) => {
          if (e.currentTarget.src !== defaultVector) {
            e.currentTarget.src = defaultVector
          }
        }}
        alt={child?.name ? `Avatar ${child.name}` : 'Avatar Siswa'}
        className={imgClassName}
        draggable="false"
      />
    </span>
  )
}
