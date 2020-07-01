import React, { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import LoadingContent from '../loading/LoadingContent';
import styles from './pageContent.module.css';

interface Props {
  children: ReactNode;
  title?: string;
  isReady?: boolean;
}

function PageContent({ children, title = 'appName', isReady = true }: Props) {
  const { t } = useTranslation();
  const { trackPageView } = useMatomo();

  const pageTitle =
    title !== 'appName' ? `${t(title)} - ${t('appName')}` : t('appName');

  useEffect(() => {
    trackPageView({
      documentTitle: pageTitle,
      href: window.location.href,
    });
  }, [pageTitle, trackPageView]);

  useEffect(() => {
    if (window && window.scrollTo) {
      // On each new page open, scroll to top of the app.
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <LoadingContent isLoading={!isReady}>
      <div className={styles.wrapper}>{children}</div>
    </LoadingContent>
  );
}

export default PageContent;
