import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';
import { Button } from 'hds-react';
import { useSelector } from 'react-redux';

import {
  ApproverEmail,
  UpdateMyYouthProfile as UpdateMyYouthProfileData,
  UpdateMyYouthProfileVariables,
} from '../../../graphql/generatedTypes';
import { profileApiTokenSelector } from '../../auth/redux';
import LinkButton from '../../../common/components/linkButton/LinkButton';
import Text from '../../../common/components/text/Text';
import NotificationComponent from '../../../common/components/notification/NotificationComponent';
import styles from './sentYouthProfile.module.css';

const APPROVER_EMAIL = loader('../graphql/ApproverEmail.graphql');
const RESEND_EMAIL = loader('../graphql/UpdateMyYouthProfile.graphql');

type Props = {};

function ViewYouthProfile(props: Props) {
  const [showNotification, setShowNotification] = useState(false);
  const [emailReSent, setEmailReSent] = useState(false);
  const { data } = useQuery<ApproverEmail>(APPROVER_EMAIL, {
    onError: () => {
      setShowNotification(true);
    },
  });
  const { t } = useTranslation();
  const profileApiToken = useSelector(profileApiTokenSelector);

  const [resendConfirmationEmail] = useMutation<
    UpdateMyYouthProfileData,
    UpdateMyYouthProfileVariables
  >(RESEND_EMAIL);

  const handleEmailResent = () => {
    const variables: UpdateMyYouthProfileVariables = {
      input: {
        youthProfile: {
          resendRequestNotification: true,
        },
        profileApiToken,
      },
    };
    resendConfirmationEmail({ variables })
      .then(result => {
        if (result.data) {
          setEmailReSent(true);
        }
      })
      .catch((error: Error) => {
        Sentry.captureException(error);
        setShowNotification(true);
      });
  };

  return (
    <div className={styles.hostingBox}>
      <Text variant="h1">{t('confirmSendingProfile.title')}</Text>

      <p className={styles.helpText}>
        {emailReSent
          ? t('confirmSendingProfile.sendAgainHelpText')
          : t('confirmSendingProfile.helpText')}{' '}
        {data?.myYouthProfile?.approverEmail}.
      </p>
      <Button
        className={styles.button}
        onClick={handleEmailResent}
        disabled={emailReSent}
      >
        {t('confirmSendingProfile.buttonText')}
      </Button>
      <br />
      <LinkButton
        className={styles.button}
        path="/membership-details"
        component="Link"
        buttonText={t('confirmSendingProfile.linkToShowSentData')}
        variant="secondary"
      />

      <NotificationComponent
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}

export default ViewYouthProfile;
