import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'hds-react';

import styles from './RegistrationForm.module.css';

type Props = {};

function RegistrationForm(props: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('registration.title')}</h1>
      <p>
        Tähän lisätietoja mitä jäsenyydellä saa, mitä jäsenyydellä saa ja mihin
        käytetään.
      </p>
      <h2>Perustiedot</h2>
      <form>
        <div className={styles.formRow}>
          <TextInput
            className={styles.formInput}
            id="firstName"
            labelText={t('registration.firstName')}
            value=""
          />
          <TextInput
            className={styles.formInput}
            id="lastName"
            labelText={t('registration.lastName')}
            value=""
          />
        </div>
        <div className={styles.formRow}>
          <TextInput
            className={styles.formInput}
            id="street"
            labelText={t('registration.street')}
            value=""
          />
          <TextInput
            className={styles.formInput}
            id="postcode"
            labelText={t('registration.postcode')}
            value=""
          />
          <TextInput
            className={styles.formInput}
            id="city"
            labelText={t('registration.city')}
            value=""
          />
        </div>
        <div className={styles.formRow}>
          <TextInput
            className={styles.formInput}
            id="birthDay"
            labelText={t('registration.childBirthDay')}
            value=""
          />
          <TextInput
            className={styles.childBirthDayInput}
            id="birthMonth"
            hideLabel={true}
            labelText={t('registration.childBirthMonth')}
            value=""
          />
          <TextInput
            className={styles.childBirthDayInput}
            id="birthYear"
            hideLabel={true}
            labelText={t('registration.childBirthYear')}
            value=""
          />
        </div>
        <div className={styles.formRow}>
          <span className={styles.email}>
            <label className={styles.emailTitle}>
              {t('registration.email')}
            </label>
            <span>maija.meikalainen@gmail.com</span>
          </span>
          <TextInput
            className={styles.formInput}
            id="phoneNumber"
            labelText={t('registration.phoneNumber')}
            value=""
          />
        </div>
        <h2>Lisätiedot</h2>
        <div className={styles.formRow}>
          <TextInput
            className={styles.formInput}
            id="school"
            labelText={t('registration.school')}
            value=""
          />
          <TextInput
            className={styles.formInput}
            id="class"
            labelText={t('registration.class')}
            value=""
          />
        </div>
        <h3>Kotona puhutut kielet</h3>
        <h2>Huoltajan tiedot</h2>
        <p></p>
      </form>
    </div>
  );
}

export default RegistrationForm;
