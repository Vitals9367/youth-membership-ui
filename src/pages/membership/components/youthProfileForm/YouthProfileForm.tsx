import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Checkbox, RadioButton, IconPlusCircle } from 'hds-react';
import {
  Field,
  FieldArray,
  FieldArrayRenderProps,
  Form,
  Formik,
  FormikProps,
} from 'formik';
import { Link } from 'react-router-dom';
import { differenceInYears, format } from 'date-fns';
import * as Yup from 'yup';
import countries from 'i18n-iso-countries';
import {
  postcodeValidator,
  postcodeValidatorExistsForCountry,
} from 'postcode-validator';

import getLanguageCode from '../../../../common/helpers/getLanguageCode';
import Select from '../../../../common/select/Select';
import TextInput from './FormikTextInput';
import ageConstants from '../../constants/ageConstants';
import {
  AddressType,
  Language,
  MembershipDetails_youthProfile_profile_addresses_edges_node as EditAddress,
  MembershipDetails_youthProfile_profile_primaryAddress as EditPrimaryAddress,
  PrefillRegistartion_myProfile_addresses_edges_node as CreateAddress,
  PrefillRegistartion_myProfile_primaryAddress as CreatePrimaryAddress,
  YouthLanguage,
} from '../../../../graphql/generatedTypes';
import styles from './YouthProfileForm.module.css';

const isConsentRequired = (birthDate: string, schema: Yup.StringSchema) => {
  const userAge = differenceInYears(new Date(), new Date(birthDate));
  return userAge < ageConstants.ADULT
    ? schema.required('validation.required')
    : schema;
};

const schema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'validation.tooShort')
    .max(255, 'validation.tooLong')
    .required('validation.required'),
  lastName: Yup.string()
    .min(2, 'validation.tooShort')
    .max(255, 'validation.tooLong')
    .required('validation.required'),
  primaryAddress: Yup.object().shape({
    address: Yup.string()
      .min(2, 'validation.tooShort')
      .max(255, 'validation.tooLong')
      .required('validation.required'),
    postalCode: Yup.mixed()
      .required('validation.required')
      .test('isValidPostalCode', 'validation.invalidValue', function() {
        if (postcodeValidatorExistsForCountry(this.parent.countryCode)) {
          return postcodeValidator(
            this.parent.postalCode,
            this.parent.countryCode
          );
        }
        return this.parent?.postalCode?.length < 32;
      }),
    city: Yup.string()
      .min(2, 'validation.tooShort')
      .max(255, 'validation.tooLong')
      .required('validation.required'),
  }),
  addresses: Yup.array().of(
    Yup.object().shape({
      address: Yup.string()
        .min(2, 'validation.tooShort')
        .max(255, 'validation.tooLong'),
      postalCode: Yup.mixed().test(
        'isValidPostalCode',
        'validation.invalidValue',
        function() {
          if (postcodeValidatorExistsForCountry(this.parent.countryCode)) {
            return postcodeValidator(
              this.parent.postalCode,
              this.parent.countryCode
            );
          }
          return this.parent?.postalCode?.length < 32;
        }
      ),
      city: Yup.string()
        .min(2, 'validation.tooShort')
        .max(255, 'validation.tooLong'),
    })
  ),
  phone: Yup.string()
    .min(6, 'validation.phoneMin')
    .required('validation.required'),
  schoolName: Yup.string().max(128, 'validation.tooLong'),
  schoolClass: Yup.string().max(10, 'validation.tooLong'),
  approverFirstName: Yup.string()
    .min(2, 'validation.tooShort')
    .max(255, 'validation.tooLong')
    .when(['birthDate'], (birthDate: string, schema: Yup.StringSchema) =>
      isConsentRequired(birthDate, schema)
    ),
  approverLastName: Yup.string()
    .min(2, 'validation.tooShort')
    .max(255, 'validation.tooLong')
    .when(['birthDate'], (birthDate: string, schema: Yup.StringSchema) =>
      isConsentRequired(birthDate, schema)
    ),
  approverPhone: Yup.string()
    .min(6, 'validation.phoneMin')
    .when(['birthDate'], (birthDate: string, schema: Yup.StringSchema) =>
      isConsentRequired(birthDate, schema)
    ),
  approverEmail: Yup.string()
    .email('validation.email')
    .when(['birthDate'], (birthDate: string, schema: Yup.StringSchema) =>
      isConsentRequired(birthDate, schema)
    ),
  photoUsageApproved: Yup.string().required('validation.required'),
  terms: Yup.boolean().oneOf([true], 'validation.required'),
});

export type Values = {
  firstName: string;
  lastName: string;
  primaryAddress: CreatePrimaryAddress | EditPrimaryAddress;
  addresses: (CreateAddress | EditAddress)[];
  email: string;
  phone: string;
  birthDate: string;
  schoolName: string;
  schoolClass: string;
  approverFirstName: string;
  approverLastName: string;
  approverPhone: string;
  approverEmail: string;
  profileLanguage: Language;
  languageAtHome: YouthLanguage;
  photoUsageApproved: string;
};

type FormValues = Values & {
  terms: boolean;
};

type Props = {
  profile: Values;
  onValues: (values: Values) => void;
  isSubmitting: boolean;
  isEditing?: boolean;
};

function YouthProfileForm(componentProps: Props) {
  const { t, i18n } = useTranslation();
  const languages = ['FINNISH', 'SWEDISH', 'ENGLISH'];

  const userAge = differenceInYears(
    new Date(),
    new Date(componentProps.profile.birthDate)
  );

  // For now when using .when() in validation we can't use
  // schema.describe().fields[name].tests to determine if field is required or not.
  // Validation rules returned from .when() won't be added there.
  // For this reason determining asterisk usage must
  // be done with this function
  const approverLabelText = (name: string) => {
    if (userAge < ageConstants.ADULT) return t(`registration.${name}`) + ' *';
    return t(`registration.${name}`);
  };

  const applicationLanguageCode = getLanguageCode(i18n.languages[0]);
  const countryList = countries.getNames(applicationLanguageCode);
  const countryOptions = Object.keys(countryList).map(key => {
    return {
      value: key,
      label: countryList[key],
    };
  });

  return (
    <Formik
      validateOnBlur={true}
      initialValues={{
        ...componentProps.profile,
        terms: !!componentProps.isEditing,
        primaryAddress: {
          ...componentProps.profile.primaryAddress,
          address: componentProps.profile.primaryAddress.address || '',
          postalCode: componentProps.profile.primaryAddress.postalCode || '',
          city: componentProps.profile.primaryAddress.city || '',
          countryCode:
            componentProps.profile.primaryAddress.countryCode || 'FI',
          primary: componentProps.profile.primaryAddress.primary || true,
          addressType:
            componentProps.profile.primaryAddress.addressType ||
            AddressType.OTHER,
          __typename:
            componentProps.profile.primaryAddress.__typename || 'AddressNode',
        },
      }}
      onSubmit={async (values: FormValues) => {
        componentProps.onValues({
          ...values,
          addresses: [...values.addresses, { ...values.primaryAddress }],
        });
      }}
      validationSchema={schema}
    >
      {(props: FormikProps<FormValues>) => (
        <div className={styles.formWrapper}>
          <div className={styles.formTitleText}>
            <h1>{t('registration.title')}</h1>
            <p>{t('registration.membershipInfoText')}</p>
          </div>
          <h3>{t('registration.basicInfo')}</h3>
          <Form>
            <div className={styles.formRow}>
              <TextInput
                className={styles.formInput}
                id="firstName"
                name="firstName"
                labelText={t('registration.firstName') + ' *'}
              />
              <TextInput
                className={styles.formInput}
                id="lastName"
                name="lastName"
                labelText={t('registration.lastName') + ' *'}
              />
            </div>
            <div className={styles.formRow}>
              <Field
                as={Select}
                setFieldValue={props.setFieldValue}
                id="primaryAddress.countryCode"
                name="primaryAddress.countryCode"
                type="select"
                options={countryOptions}
                className={styles.formInput}
                labelText={t('registration.country')}
              />
            </div>
            <div className={styles.formRow}>
              <TextInput
                className={styles.formInput}
                id="primaryAddress.address"
                name="primaryAddress.address"
                labelText={t('registration.address') + ' *'}
              />
              <div className={styles.formInputRow}>
                <TextInput
                  className={styles.formInputPostal}
                  id="primaryAddress.postalCode"
                  name="primaryAddress.postalCode"
                  inputMode={
                    props.values?.primaryAddress?.countryCode === 'FI'
                      ? 'numeric'
                      : 'text'
                  }
                  labelText={t('registration.postalCode') + ' *'}
                />
                <TextInput
                  className={styles.formInputCity}
                  id="primaryAddress.city"
                  name="primaryAddress.city"
                  labelText={t('registration.city') + ' *'}
                />
              </div>
            </div>
            <FieldArray
              name="addresses"
              render={(arrayHelpers: FieldArrayRenderProps) => (
                <React.Fragment>
                  {props.values.addresses.map((address, index: number) => (
                    <React.Fragment key={index}>
                      <div className={styles.formRow}>
                        <Field
                          as={Select}
                          setFieldValue={props.setFieldValue}
                          id={`addresses.${index}.countryCode`}
                          name={`addresses.${index}.countryCode`}
                          type="select"
                          options={countryOptions}
                          className={styles.formInput}
                          labelText={t('registration.country')}
                        />
                      </div>
                      <div className={styles.formRow}>
                        <TextInput
                          className={styles.formInput}
                          id={`addresses.${index}.address`}
                          name={`addresses.${index}.address`}
                          labelText={t('registration.address')}
                        />

                        <div className={styles.formInputRow}>
                          <TextInput
                            className={styles.formInputPostal}
                            id={`addresses.${index}.postalCode`}
                            name={`addresses.${index}.postalCode`}
                            inputMode={
                              props.values?.primaryAddress?.countryCode === 'FI'
                                ? 'numeric'
                                : 'text'
                            }
                            labelText={t('registration.postalCode')}
                          />
                          <TextInput
                            className={styles.formInputCity}
                            id={`addresses.${index}.city`}
                            name={`addresses.${index}.city`}
                            labelText={t('registration.city')}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.additionalActionButton}
                        onClick={() => arrayHelpers.remove(index)}
                      >
                        {t('registration.remove')}
                      </button>
                    </React.Fragment>
                  ))}
                  <br />
                  <Button
                    type="button"
                    iconLeft={<IconPlusCircle />}
                    className={styles.addAdditional}
                    variant="supplementary"
                    onClick={() =>
                      arrayHelpers.push({
                        address: '',
                        postalCode: '',
                        countryCode: 'FI',
                        city: '',
                        primary: false,
                        addressType: AddressType.OTHER,
                        __typeName: 'AddressNode',
                      })
                    }
                  >
                    {t('registration.addAddress')}
                  </Button>
                </React.Fragment>
              )}
            />
            <div className={styles.formRow}>
              <Field
                as={TextInput}
                id="birthDate"
                name="birthDate"
                readOnly
                value={
                  componentProps.profile.birthDate &&
                  format(
                    new Date(componentProps.profile.birthDate),
                    'dd.MM.yyyy'
                  )
                }
                labelText={t('registration.childBirthDay')}
                className={styles.formInput}
              />
              <Field
                as={Select}
                setFieldValue={props.setFieldValue}
                id="profileLanguage"
                name="profileLanguage"
                type="select"
                options={[
                  { value: 'FINNISH', label: t('LANGUAGE_OPTIONS.FINNISH') },
                  { value: 'ENGLISH', label: t('LANGUAGE_OPTIONS.ENGLISH') },
                  { value: 'SWEDISH', label: t('LANGUAGE_OPTIONS.SWEDISH') },
                ]}
                className={styles.formInput}
                labelText={t('registration.profileLanguage')}
              />
            </div>
            <div className={styles.formRow}>
              <Field
                as={TextInput}
                id="email"
                name="email"
                type="text"
                labelText={t('registration.email')}
                className={styles.formInput}
                readOnly
              />
              <TextInput
                className={styles.formInput}
                id="phone"
                name="phone"
                type="tel"
                labelText={t('registration.phoneNumber') + ' *'}
              />
            </div>

            <h3>{t('registration.addInfo')}</h3>
            <div className={styles.formRow}>
              <TextInput
                className={styles.formInput}
                id="schoolName"
                name="schoolName"
                labelText={t('registration.schoolName')}
              />
              <TextInput
                className={styles.formInput}
                id="schoolClass"
                name="schoolClass"
                labelText={t('registration.schoolClass')}
              />
            </div>
            <p className={styles.radioLabel}>
              {t('registration.languageAtHome')}
            </p>
            <ul className={styles.list}>
              {languages.map(language => (
                <li className={styles.languageRadioBtnRow} key={language}>
                  <Field
                    as={RadioButton}
                    name="languageAtHome"
                    id={language}
                    type="radio"
                    value={language}
                    labelText={t(`LANGUAGE_OPTIONS.${language}`)}
                  />
                </li>
              ))}
            </ul>
            <div
              className={
                userAge < ageConstants.PHOTO_PERMISSION_MIN
                  ? styles.hidePhotoUsageApproved
                  : styles.formInputColumn
              }
            >
              <p className={styles.radioLabel}>
                {t('registration.photoUsageApproved')}
              </p>
              <p>{t('registration.photoUsageApprovedText')}</p>
              <div className={styles.resRow}>
                <ul className={styles.list}>
                  <li className={styles.radioButtonRow}>
                    <Field
                      as={RadioButton}
                      id="photoUsageApprovedYes"
                      name="photoUsageApproved"
                      type="radio"
                      value={'true'}
                      labelText={t('registration.photoUsageApprovedYes')}
                    />
                  </li>
                  <li className={styles.radioButtonRow}>
                    <Field
                      as={RadioButton}
                      id="photoUsageApprovedNo"
                      name="photoUsageApproved"
                      type="radio"
                      value={'false'}
                      labelText={t('registration.photoUsageApprovedNo')}
                    />
                  </li>
                </ul>
              </div>
            </div>
            <h3>{t('registration.approver')}</h3>

            <p
              data-testid="approverInfoText"
              className={styles.approverInfoText}
            >
              {userAge < ageConstants.ADULT
                ? t('registration.approverInfoText')
                : t('registration.approverInfoOver18Text')}
            </p>

            <div className={styles.formRow}>
              <TextInput
                className={styles.formInput}
                id="approverFirstName"
                name="approverFirstName"
                labelText={approverLabelText('firstName')}
              />
              <TextInput
                className={styles.formInput}
                id="approverLastName"
                name="approverLastName"
                labelText={approverLabelText('lastName')}
              />
            </div>
            <div className={styles.formRow}>
              <TextInput
                className={styles.formInput}
                id="approverEmail"
                name="approverEmail"
                type="email"
                labelText={approverLabelText('email')}
              />
              <TextInput
                className={styles.formInput}
                id="approverPhone"
                name="approverPhone"
                type="tel"
                labelText={approverLabelText('phoneNumber')}
              />
            </div>
            {!componentProps.isEditing && (
              <React.Fragment>
                <h3>{t('registration.confirmSend')}</h3>
                {userAge < ageConstants.ADULT && (
                  <p>{t('registration.processInfoText')}</p>
                )}
                <ul className={styles.terms}>
                  <Field
                    as={Checkbox}
                    name="terms"
                    type="checkbox"
                    labelText={
                      <Trans
                        i18nKey="registration.approveTerms"
                        components={[
                          // These components receive content  in the
                          // translation definition.
                          // eslint-disable-next-line jsx-a11y/anchor-has-content
                          <a
                            href={t('registry.descriptionLink')}
                            target="_blank"
                            rel="noopener noreferrer"
                          />,
                          // eslint-disable-next-line jsx-a11y/anchor-has-content
                          <a
                            href={t('privacyPolicy.descriptionLink')}
                            target="_blank"
                            rel="noopener noreferrer"
                          />,
                        ]}
                      />
                    }
                  />
                </ul>
              </React.Fragment>
            )}

            <div className={componentProps.isEditing ? styles.buttonAlign : ''}>
              <Button
                type="submit"
                disabled={
                  !componentProps.isEditing
                    ? Boolean(!props.values.terms)
                    : false
                }
                className={styles.button}
              >
                {componentProps.isEditing
                  ? t('registration.save')
                  : t('registration.sendButton')}
              </Button>

              {componentProps.isEditing && (
                <Link to="/membership-details">
                  <Button variant="secondary" className={styles.button}>
                    {t('registration.cancel')}
                  </Button>
                </Link>
              )}
            </div>
          </Form>
        </div>
      )}
    </Formik>
  );
}

export default YouthProfileForm;
