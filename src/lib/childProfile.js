import childMaleImg from '../assets/picture/child-male.png'
import childFemaleImg from '../assets/picture/child-female.png'
import mascotFoxBoy from '../assets/picture/mascot-fox-boy.png'
import mascotFoxGirl from '../assets/picture/mascot-fox-girl.png'

/**
 * Mendeteksi jenis kelamin anak/siswa ('male' | 'female'):
 * 1. child.gender eksplisit ('female' / 'perempuan' vs 'male' / 'laki-laki')
 * 2. Deteksi dari pola nama anak jika properti gender kosong
 */
export function getChildGender(child) {
  if (child?.gender) {
    const g = String(child.gender).toLowerCase().trim()
    if (['female', 'perempuan', 'wanita', 'f', 'p'].includes(g)) return 'female'
    if (['male', 'laki-laki', 'pria', 'm', 'l'].includes(g)) return 'male'
  }

  // Heuristik nama jika database tidak memiliki kolom gender
  const name = String(child?.name || '').toLowerCase().trim()
  const femaleKeywords = [
    'putri', 'siti', 'aisyah', 'fatimah', 'zahra', 'nayla', 'bilqis',
    'anisa', 'annisa', 'safira', 'nurul', 'dewi', 'rani', 'dinda',
    'salsa', 'salsabila', 'clarissa', 'azzahra', 'khadijah', 'maryam'
  ]
  if (femaleKeywords.some((k) => name.includes(k))) {
    return 'female'
  }

  return 'male'
}

/**
 * Mengembalikan gambar avatar 3D anak/siswa sesuai jenis kelamin:
 * - Laki-laki: child-male.png (Anak laki-laki dengan topi JACOS)
 * - Perempuan: child-female.png (Anak perempuan berhijab dengan topi JACOS)
 */
export function getChildAvatar(child) {
  const gender = getChildGender(child)
  return gender === 'female' ? childFemaleImg : childMaleImg
}

/**
 * Mengembalikan gambar maskot rubah JACOS sesuai jenis kelamin anak:
 * - Laki-laki: mascot-fox-boy.png (Rubah laki-laki seragam sekolah thumbs up)
 * - Perempuan: mascot-fox-girl.png (Rubah perempuan pita biru seragam sekolah peace sign)
 */
export function getChildMascot(child) {
  const gender = getChildGender(child)
  return gender === 'female' ? mascotFoxGirl : mascotFoxBoy
}

export { childMaleImg, childFemaleImg, mascotFoxBoy, mascotFoxGirl }

