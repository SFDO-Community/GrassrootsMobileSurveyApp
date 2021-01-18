import React, { useState, useContext } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Icon, ButtonGroup } from 'react-native-elements';

import { APP_FONTS, APP_THEME } from '../constants';
import LocalizationContext from '../context/localizationContext';
import { SurveyFilterAction } from '../reducers/surveyFilterReducer';

type FilterButtonGroupProps = {
  dispatch: React.Dispatch<SurveyFilterAction>;
  surveys: Array<any>;
};

export default function FilterButtonGroup(props: FilterButtonGroupProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { t } = useContext(LocalizationContext);

  const UnsyncedButton = () => {
    return (
      <View style={styles.singleButtonStyle}>
        <Text style={selectedFontStyle(0)}>{t('UNSYNCED')}</Text>
        <Icon name="cloud-off-outline" type="material-community" color={color(0)} />
        <Text style={selectedFontStyle(0)}>{props.surveys.filter(s => s.syncStatus === 'Unsynced').length}</Text>
      </View>
    );
  };

  const SyncedButton = () => {
    return (
      <View style={styles.singleButtonStyle}>
        <Text style={selectedFontStyle(1)}>{t('SYNCED')}</Text>
        <Icon name="cloud-check" type="material-community" color={color(1)} />
        <Text style={selectedFontStyle(1)}>{props.surveys.filter(s => s.syncStatus === 'Synced').length}</Text>
      </View>
    );
  };

  const AllButton = () => {
    return (
      <View style={styles.singleButtonStyle}>
        <Text style={selectedFontStyle(2)}>{t('ALL')}</Text>
        <Icon name="cloud-outline" type="material-community" color={color(2)} />
        <Text style={selectedFontStyle(2)}>{props.surveys.length}</Text>
      </View>
    );
  };

  const color = index => {
    return selectedIndex === index ? '#FFF' : APP_THEME.APP_DARK_FONT_COLOR;
  };

  const selectedFontStyle = index => {
    return { fontFamily: APP_FONTS.FONT_REGULAR, color: color(index) };
  };

  const buttons = [{ element: UnsyncedButton }, { element: SyncedButton }, { element: AllButton }];

  return (
    <ButtonGroup
      onPress={index => {
        setSelectedIndex(index);
        if (index === 0) {
          props.dispatch({ type: 'SHOW_UNSYNCED' });
        } else if (index === 1) {
          props.dispatch({ type: 'SHOW_SYNCED' });
        } else {
          props.dispatch({ type: 'SHOW_ALL' });
        }
      }}
      selectedIndex={selectedIndex}
      buttons={buttons}
      selectedButtonStyle={styles.selectedFilterButtonStyle}
      containerStyle={{ height: 70 }}
    />
  );
}

const styles = StyleSheet.create({
  singleButtonStyle: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedFilterButtonStyle: {
    backgroundColor: APP_THEME.APP_BASE_COLOR,
  },
});
