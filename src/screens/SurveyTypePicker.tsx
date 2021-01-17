import React, { useState, useEffect, useContext } from 'react';
import { View, FlatList, ImageBackground } from 'react-native';
import { Divider } from 'react-native-elements';
import { StackNavigationProp } from '@react-navigation/stack';

import { getAllRecordTypes } from '../services/describe';
import { ListItem } from '../components';

import LocalizationContext from '../context/localizationContext';
import { APP_THEME, BACKGROUND_IMAGE_SOURCE, BACKGROUND_STYLE, BACKGROUND_IMAGE_STYLE } from '../constants';
import { logger } from '../utility/logger';

import { StackParamList } from '../router';
type SurveyTypePickerNavigationProp = StackNavigationProp<StackParamList, 'SurveyTypePicker'>;

type Props = {
  navigation: SurveyTypePickerNavigationProp;
};

export default function SurveyTypePicker({ navigation }: Props) {
  const [recordTypes, setRecordTypes] = useState([]);
  const { t } = useContext(LocalizationContext);

  useEffect(() => {
    const fetch = async () => {
      const result = await getAllRecordTypes();
      setRecordTypes(result);
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
              title={t(`RECORD_TYPE_${item.name}`)}
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
