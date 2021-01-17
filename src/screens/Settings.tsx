import React, { useState, useContext } from 'react';
import { FlatList, ImageBackground } from 'react-native';
import { Card, Icon, Divider, ListItem } from 'react-native-elements';
import NetInfo from '@react-native-community/netinfo';

import LocalizationContext from '../context/localizationContext';
import { retrieveAllMetadata } from '../services/describe';
import { forceLogout } from '../services/session';
import { Loader } from '../components';

import { APP_THEME, BACKGROUND_IMAGE_SOURCE, BACKGROUND_STYLE, BACKGROUND_IMAGE_STYLE, APP_FONTS } from '../constants';
import { logger } from '../utility/logger';
import { notifySuccess, notifyError } from '../utility/notification';
import { storeOnlineSurveys } from '../services/survey';

type Language = {
  name: string;
  code: string;
};

export default function Settings({ navigation }) {
  const [showsSpinner, setShowsSpinner] = useState(false);
  const { t, locale, setLocale } = useContext(LocalizationContext);

  const languages: Array<Language> = [
    { name: 'English', code: 'en' },
    { name: 'Nepali', code: 'ne' },
  ];

  const renderItem = ({ item }) => {
    return (
      <ListItem
        onPress={() => {
          setLocale(item.code);
          logger('FINE', 'Settings', `change locale to: ${item.code}`);
        }}
      >
        {item.code === locale && <Icon name="check" size={20} color={APP_THEME.APP_BASE_COLOR} />}
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
        <Card.Title style={{ fontFamily: APP_FONTS.FONT_BOLD }}>{t('SYSTEM')}</Card.Title>
        <ListItem
          onPress={async () => {
            if (!(await isInternetReachable())) {
              return;
            }
            setShowsSpinner(true);
            try {
              await retrieveAllMetadata();
              notifySuccess('Successfully refreshed metadata.');
            } catch (e) {
              notifyError('Unexpected error occcured while refreshing. Contact your administrator and login again.');
              await forceLogout(navigation);
            } finally {
              setShowsSpinner(false);
            }
          }}
          topDivider
        >
          <Icon name="cloud-download" color={APP_THEME.APP_LIGHT_FONT_COLOR} />
          <ListItem.Content>
            <ListItem.Title style={{ fontFamily: APP_FONTS.FONT_REGULAR }}>Reload Metadata</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem
          onPress={async () => {
            if (!(await isInternetReachable())) {
              return;
            }
            setShowsSpinner(true);
            try {
              await storeOnlineSurveys();
              notifySuccess('Successfully refreshed surveys.');
            } catch (e) {
              notifyError('Unexpected error occcured while refreshing. Contact your administrator and login again.');
              await forceLogout(navigation);
            } finally {
              setShowsSpinner(false);
            }
          }}
          topDivider
          bottomDivider
        >
          <Icon name="cloud-download" color={APP_THEME.APP_LIGHT_FONT_COLOR} />
          <ListItem.Content>
            <ListItem.Title style={{ fontFamily: APP_FONTS.FONT_REGULAR }}>Reload Online Surveys</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      </Card>
    </ImageBackground>
  );
}
