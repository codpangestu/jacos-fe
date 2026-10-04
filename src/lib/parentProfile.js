import parentMaleImg from '../assets/picture/parent-male.png'
import parentFemaleImg from '../assets/picture/parent-female.png'

/**
 * Mendeteksi jenis kelamin orang tua ('male' | 'female') berdasarkan:
 * 1. user.gender (jika didefinisikan)
 * 2. user.relationship (dari session/API: ayah/ibu)
 * 3. children[i].relationship (dari relasi pivot anak di database)
 * 4. Gelar / panggilan pada nama (Bpk/Pak/Ayah vs Ibu/Bu/Bunda/Mama)
 */
export function getParentGender(user, children = []) {
  // 1. Cek properti gender eksplisit
  if (user?.gender) {
    const g = String(user.gender).toLowerCase().trim()
    if (['male', 'laki-laki', 'pria', 'ayah'].includes(g)) return 'male'
    if (['female', 'perempuan', 'wanita', 'ibu'].includes(g)) return 'female'
  }

  // 2. Cek user.relationship langsung
  if (user?.relationship) {
    const r = String(user.relationship).toLowerCase().trim()
    if (['ayah', 'bapak', 'bpk', 'papa', 'father'].some((k) => r.includes(k))) return 'male'
    if (['ibu', 'mama', 'mother', 'wanita', 'perempuan', 'bunda'].some((k) => r.includes(k))) return 'female'
  }

  // 3. Cek relationship dari daftar anak milik orang tua (pivot parent_student)
  if (Array.isArray(children) && children.length > 0) {
    for (const c of children) {
      if (c?.relationship) {
        const r = String(c.relationship).toLowerCase().trim()
        if (['ayah', 'bapak', 'bpk', 'papa', 'father'].some((k) => r.includes(k))) return 'male'
        if (['ibu', 'mama', 'mother', 'wanita', 'perempuan', 'bunda'].some((k) => r.includes(k))) return 'female'
      }
    }
  }

  // 4. Deteksi dari title atau nama
  const name = String(user?.name || '').toLowerCase().trim()
  if (name.startsWith('bpk') || name.startsWith('pak ') || name.includes('ayah') || name.startsWith('bapak')) {
    return 'male'
  }
  if (name.startsWith('ibu') || name.startsWith('bu ') || name.includes('mama') || name.includes('bunda')) {
    return 'female'
  }

  return 'male'
}

/**
 * Mengembalikan gambar profil 3D orang tua sesuai desain Figma:
 * - Laki-laki -> parent-male.png (Ayah / Bpk. Santoso)
 * - Wanita -> parent-female.png (Ibu / Sandra Dewi)
 */
export function getParentAvatar(user, children = []) {
  const gender = getParentGender(user, children)
  return gender === 'female' ? parentFemaleImg : parentMaleImg
}

// Alias kompatibilitas
export const getParentAvatarSvg = getParentAvatar

/**
 * Mengembalikan sebutan peran orang tua ('Ayah' | 'Ibu')
 */
export function getParentRoleLabel(user, children = []) {
  const gender = getParentGender(user, children)
  return gender === 'female' ? 'Ibu' : 'Ayah'
}
