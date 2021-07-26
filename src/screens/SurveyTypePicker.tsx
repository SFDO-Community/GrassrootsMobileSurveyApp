import React, { useState, useEffect, useContext } from 'react';
import { View, FlatList, ImageBackground } from 'react-native';
import { Divider } from 'react-native-elements';
import { StackNavigationProp } from '@react-navigation/stack';

import { getAllRecordsWithCallback } from '../services/database/database';
import { ListItem } from '../components';

import LocalizationContext from '../context/localizationContext';
import {
  APP_THEME,
  BACKGROUND_IMAGE_SOURCE,
  BACKGROUND_STYLE,
  BACKGROUND_IMAGE_STYLE,
  L10N_PREFIX,
  DB_TABLE,
} from '../constants';
import { logger } from '../utility/logger';

import { StackParamList } from '../Router';

import { SQLiteRecordType } from '../types/sqlite';

type SurveyTypePickerNavigationProp = StackNavigationProp<StackParamList, 'SurveyTypePicker'>;

type Props = {
  navigation: SurveyTypePickerNavigationProp;
};

export default function SurveyTypePicker({ navigation }: Props) {
  const [recordTypes, setRecordTypes] = useState<Array<SQLiteRecordType>>([]);
  const { t } = useContext(LocalizationContext);

  useEffect(() => {
    const fetch = async () => {
      await getAllRecordsWithCallback(DB_TABLE.RECORD_TYPE, setRecordTypes);
    };
    fetch();
  }, []);

  return (
    <ImageBackground source={BACKGROUND_IMAGE_SOURCE} style={BACKGROUND_STYLE} imageStyle={BACKGROUND_IMAGE_STYLE}>
      <View>
        <FlatList
          keyExtractor={(item, index) => {
            return index.toString();
          }}
          data={recordTypes}
          renderItem={({ item }) => (
            <ListItem
              title={t(`${L10N_PREFIX.RecordType}${item.developerName}`)}
              onPress={() => {
                logger('DEBUG', 'SurveyTypePicker', item.recordTypeId);
                navigation.navigate('SurveyEditor', {
                  selectedLayoutId: item.layoutId,
                  selectedRecordTypeId: item.recordTypeId,
                });
              }}
            />
          )}
          ItemSeparatorComponent={() => <Divider style={{ backgroundColor: APP_THEME.APP_BORDER_COLOR }} />}
        />
      </View>
    </ImageBackground>
  );
}
