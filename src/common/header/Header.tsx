import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Header.module.css';
import LanguageSwitcher from '../../i18n/languageSwitcher/LanguageSwitcher';
import FullscreenNavigation from '../fullscreenNavigation/FullscreenNavigation';
import UserDropdown from './userDropdown/UserDropdown';
import HelsinkiLogo from '../helsinkiLogo/HelsinkiLogo';

type Props = {};

function Header(props: Props) {
  const { t } = useTranslation();
  return (
    <header className={styles.header}>
      <div className={styles.centeredContainer}>
        <HelsinkiLogo className={styles.logo} isLinkToFrontPage />
        <span className={styles.appName}>{t('appName')}</span>
        <section className={styles.end}>
          <FullscreenNavigation className={styles.mobileNav} />
          <div className={styles.desktopNav}>
            <LanguageSwitcher />
            <UserDropdown />
          </div>
        </section>
      </div>
    </header>
  );
}

export default Header;
