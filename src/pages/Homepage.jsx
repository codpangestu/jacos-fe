import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import buildingIllustration from '../assets/picture/building-illustration.png'
import heroStudentsGroup from '../assets/picture/hero-students-group.png'
import admissionBoyPhone from '../assets/picture/admission-boy-phone.png'
import logo from '../assets/guide/logo.png'

export default function Homepage() {
  const { t } = useTranslation()

  return (
    <div className="bg-[#daeeff]">
      {/* Sticky Navbar */}
      <Navbar />

      <div className="mx-auto flex max-w-360 flex-col gap-12 px-5 pb-16 max-[860px]:px-4 max-[860px]:pb-12">
        {/* Hero */}
        <div className="relative box-border h-screen pt-[78px] pb-[0px] max-[860px]:pt-[52px]">
          <section className="relative flex h-[calc(100%-80px)] flex-col justify-end rounded-3xl bg-[#33a6f2] px-12 pt-[62px] text-white max-[860px]:h-[calc(100%-64px)] max-[860px]:px-6">
            {/* Main content row */}
            <div className="grid flex-1 grid-cols-[55fr_45fr] items-end gap-0 max-[860px]:grid-cols-1">
              {/* Left: headline + description */}
              <div className="flex flex-col gap-6 pb-11 max-[860px]:pb-6">
                <h1 className="m-0 font-heading text-[clamp(48px,6.8vw,84px)] leading-[1.06] font-extrabold tracking-[-0.025em] text-white max-[860px]:text-[clamp(36px,9vw,56px)]">
                  {t('homepage.heroTitleLine1')}
                  <br />
                  {t('homepage.heroTitleLine2')}
                </h1>
                <p className="inline-block max-w-[440px] rounded-[14px] border border-white/28 bg-white/18 px-5 py-4 text-[13.5px] leading-[1.72] text-white/97 backdrop-blur-[8px] max-[860px]:max-w-none">
                  {t('homepage.heroDescription')}
                </p>
              </div>

              {/* Right: building + students (students bleed upward) */}
              <div className="relative h-[440px] w-full self-end max-[860px]:h-[260px]">
                <img
                  className="absolute right-0 bottom-0 w-[68%] object-contain object-right-bottom"
                  src={buildingIllustration}
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="absolute right-0 bottom-0 h-[calc(100%+56px)] max-w-[105%] w-auto object-contain object-right-bottom max-[860px]:h-[calc(100%+40px)]"
                  src={heroStudentsGroup}
                  alt="Siswa Jakarta Cosmopolite Islamic School"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Admission */}
        <section
          id="admission"
          className="flex flex-wrap items-center gap-8 max-[860px]:flex-col max-[860px]:text-center"
        >
          <div className="aspect-[309/443] w-[200px] shrink-0 overflow-hidden rounded-3xl border-[3px] border-primary-300">
            <img
              className="h-full w-full object-cover"
              src={admissionBoyPhone}
              alt="Siswa Jakarta Cosmopolite Islamic School"
            />
          </div>
          <div>
            <h2 className="mb-1.5 text-[clamp(24px,3vw,32px)] font-extrabold text-primary-300">
              {t('homepage.admissionTitle')}
            </h2>
            <p className="text-lg text-text-secondary">{t('homepage.admissionSubtitle')}</p>
          </div>
        </section>

        {/* Footer */}
        <footer
          id="contact"
          className="grid grid-cols-[1.3fr_1fr_1.2fr] gap-8 rounded-[28px] bg-primary-900 p-10 text-white max-[860px]:grid-cols-1 max-[860px]:text-center"
        >
          <div>
            <img src={logo} alt="Jakarta Cosmopolite Islamic School" className="mb-3.5 h-[34px]" />
            <p className="max-w-[320px] text-[13px] leading-[1.65] text-white/70 max-[860px]:mx-auto max-[860px]:max-w-none">
              {t('homepage.footerDescription')}
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-[15px] font-bold">{t('homepage.quickLinks')}</h3>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm text-white/82">
              <li>{t('homepage.linkHome')}</li>
              <li>{t('homepage.linkAdmission')}</li>
              <li>{t('homepage.linkKindergarten')}</li>
              <li>{t('homepage.linkPrimary')}</li>
              <li>{t('homepage.linkEnquiry')}</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-[15px] font-bold">{t('homepage.getInTouch')}</h3>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[13px] leading-[1.5] text-white/82">
              <li>0821-4000-0477</li>
              <li>admission@jacos.sch.id</li>
              <li>{t('homepage.address')}</li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  )
}
