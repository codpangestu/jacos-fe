import { getUser } from '../../lib/auth'
import { getParentAvatarSvg, getParentGender } from '../../lib/parentProfile'

export default function ParentAvatar({
  user: propUser,
  childrenList: propChildren = [],
  className = 'h-[54px] w-[54px]',
  imgClassName = 'h-full w-full object-cover',
}) {
  const user = propUser ?? getUser()
  const avatarSrc = getParentAvatarSvg(user, propChildren)
  const gender = getParentGender(user, propChildren)
  const roleLabel = gender === 'female' ? 'Ibu' : 'Ayah'

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-sm ring-2 ring-white/90 ${
        gender === 'female' ? 'bg-[#FCE7F3]' : 'bg-[#E0F2FE]'
      } ${className}`}
    >
      <img
        src={avatarSrc}
        alt={`Avatar ${roleLabel} (${user?.name ?? 'Orang Tua'})`}
        className={imgClassName}
        draggable="false"
      />
    </div>
  )
}
