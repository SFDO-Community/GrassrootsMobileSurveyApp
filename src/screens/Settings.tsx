import React, { useEffect, useState } from 'react';
import { FlatList, ImageBackground } from 'react-native';
import { Card, Icon, Divider, ListItem, Text } from '@rneui/themed';
import NetInfo from '@react-native-community/netinfo';
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';

import { useLocalizationContext } from '../context/localizationContext';
import { retrieveAllMetadata } from '../services/describe';
import { forceLogout } from '../services/session';
import { Loader } from '../components';

import {
  APP_THEME,
  BACKGROUND_IMAGE_SOURCE,
  BACKGROUND_STYLE,
  BACKGROUND_IMAGE_STYLE,
  APP_FONTS,
  SECURE_STORE_KEYS,
  ASYNC_STORAGE_KEYS,
  DEFAULT_SF_LANGUAGE,
} from '../constants';
import { logger } from '../utility/logger';
import { toShortLocale } from '../utility';
import { notifySuccess, notifyError } from '../utility/notification';
import { storeOnlineSurveys } from '../services/salesforce/survey';
import { buildDictionary } from '../services/dictionary';
import { hasUnsyncedSurveys } from '../services/database/localSurvey';
import { storeContacts } from '../services/salesforce/contact';
import { useAuthContext } from '../context/authContext';
import { Language } from '../types/metadata';

export default function Settings() {
  const [email, setEmail] = useState('');
  const [showsSpinner, setShowsSpinner] = useState(false);
  const { t, locale, setLocale } = useLocalizationContext();
  const authContext = useAuthContext();

  const [languages, setLanguages] = useState<Array<Language>>([DEFAULT_SF_LANGUAGE]);

  useEffect(() => {
    const prepare = async () => {
      const email = await SecureStore.getItemAsync(SECURE_STORE_KEYS.EMAIL);
      const languages = await storage.load({ key: ASYNC_STORAGE_KEYS.LANGUAGES });
      setLanguages(languages);
      if (email) {
        setEmail(email);
      }
    };
    prepare();
  }, []);

  const renderItem = ({ item }) => {
    return (
      <ListItem
        onPress={() => {
          setLocale(toShortLocale(item.code));
          logger('FINE', 'Settings', `change locale to: ${item.code}`);
        }}
      >
        {toShortLocale(item.code) === locale && <Icon name="check" size={20} color={APP_THEME.APP_BASE_COLOR} />}
        <ListItem.Content>
          <ListItem.Title style={{ fontFamily: APP_FONTS.FONT_REGULAR }}>{item.name}</ListItem.Title>
        </ListItem.Content>
      </ListItem>
    );
  };

  const isInternetReachable = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isInternetReachable) {
      notifyError('No network connection. Confirm your network connectivity and try again.');
      return false;
    }
    return true;
  };

  return (
    <ImageBackground source={BACKGROUND_IMAGE_SOURCE} style={BACKGROUND_STYLE} imageStyle={BACKGROUND_IMAGE_STYLE}>
      <Loader loading={showsSpinner} />
      <Card>
        <Card.Title style={{ fontFamily: APP_FONTS.FONT_BOLD }}>{t('LANGUAGE')}</Card.Title>
        <FlatList
          data={languages}
          renderItem={renderItem}
          keyExtractor={(item, index) => {
            return index.toString();
          }}
          ItemSeparatorComponent={() => {
            return <Divider style={{ backgroundColor: APP_THEME.APP_BORDER_COLOR }} />;
          }}
        />
      </Card>
      <Card>
        <Card.Title style={{ fontFamily: APP_FONTS.FONT_BOLD }}>{t('INFORMATION')}</Card.Title>
        <Divider style={{ backgroundColor: APP_THEME.APP_BORDER_COLOR }} />
        <Text style={{ textAlign: 'center', paddingTop: 15, paddingBottom: 15 }}>
          {t('VERSION')} {Application.nativeApplicationVersion}
        </Text>
        <Divider style={{ backgroundColor: APP_THEME.APP_BORDER_COLOR }} />
        <Text style={{ textAlign: 'center', paddingTop: 15 }}>
          {t('LOGGING_IN_AS')} {email}
        </Text>
      </Card>
      <Card>
        <Card.Title style={{ fontFamily: APP_FONTS.FONT_BOLD }}>{t('MAINTENANCE')}</Card.Title>
        <ListItem
          onPress={async () => {
            if (!(await isInternetReachable())) {
              return;
            }
            if (await hasUnsyncedSurveys()) {
              notifyError('You cannot reload metadata and surveys until all the surveys are synced.');
              return;
            }
            setShowsSpinner(true);
            try {
              await storeContacts();
              await retrieveAllMetadata();
              await storeOnlineSurveys();
              await buildDictionary();
              notifySuccess('Successfully refreshed metadata.');
            } catch (e) {
              notifyError('Unexpected error occcured while refreshing. Contact your administrator and login again.');
              await forceLogout(authContext);
            } finally {
              setShowsSpinner(false);
            }
          }}
          topDivider
        >
          <Icon name="cloud-download" color={APP_THEME.APP_LIGHT_FONT_COLOR} />
          <ListItem.Content>
            <ListItem.Title style={{ fontFamily: APP_FONTS.FONT_REGULAR }}>Reload Metadata and Survey</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      </Card>
    </ImageBackground>
  );
}
