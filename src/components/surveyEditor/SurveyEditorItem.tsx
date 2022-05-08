import React, { memo, useContext } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { TextInput, CheckboxButton, DatePicker, Picklist, Lookup } from '.';
import { StackNavigationProp } from '@react-navigation/stack';

import { useSelector, useDispatch } from '../../state/surveyEditorState';
import LocalizationContext from '../../context/localizationContext';
import { StackParamList } from '../../Router';
import { APP_THEME, APP_FONTS, L10N_PREFIX, SYNC_STATUS_SYNCED } from '../../constants';

type SurveyEditorNavigationProp = StackNavigationProp<StackParamList, 'SurveyEditor'>;

type SurveyItemProps = {
  navigation: SurveyEditorNavigationProp;
  title: string;
  name: string;
  type: string;
  required: boolean;
};

function SurveyEditorItem({ navigation, title, name, type, required }: SurveyItemProps) {
  const value = useSelector(state => state.survey[name]);
  const _syncStatus = useSelector(state => state.survey._syncStatus);
  const disabled = _syncStatus === SYNC_STATUS_SYNCED;
  const dispatchSurvey = useDispatch();
  const { t } = useContext(LocalizationContext);

  const onValueChange = value => {
    dispatchSurvey({ type: 'UPDATE', field: { name: name, value } });
  };

  const fieldLabel = () => {
    return (
      <View style={styles.labelContainer}>
        {required && <Text style={{ color: APP_THEME.APP_ERROR_COLOR }}>*</Text>}
        <Text style={styles.labelStyle}>{t(`${L10N_PREFIX.PageLayoutItem}${name}`)}</Text>
      </View>
    );
  };

  const renderItem = () => {
    switch (type) {
      case 'string':
        return <TextInput title={fieldLabel()} onValueChange={onValueChange} value={value} disabled={disabled} />;
      case 'email':
        return (
          <TextInput
            title={fieldLabel()}
            onValueChange={onValueChange}
            value={value}
            disabled={disabled}
            keyboardType="email-address"
          />
        );
      case 'textarea':
        return (
          <TextInput title={fieldLabel()} onValueChange={onValueChange} value={value} multiline disabled={disabled} />
        );
      case 'double':
        return (
          <TextInput
            title={fieldLabel()}
            onValueChange={onValueChange}
            value={value?.toString()}
            keyboardType="numeric"
            disabled={disabled}
          />
        );
      case 'currency':
        return (
          <TextInput
            title={fieldLabel()}
            onValueChange={onValueChange}
            value={value?.toString()}
            keyboardType="numeric"
            disabled={disabled}
          />
        );
      case 'boolean':
        return (
          <CheckboxButton
            title={fieldLabel()}
            onPress={() => dispatchSurvey({ type: 'UPDATE', field: { name: name, value: !value } })}
            selected={value}
            disabled={disabled}
          />
        );
      case 'date':
        return (
          <DatePicker
            mode="date"
            title={title}
            fieldLabel={fieldLabel()}
            onValueChange={onValueChange}
            value={value}
            disabled={disabled}
          />
        );
      case 'time':
        return (
          <DatePicker
            mode="time"
            title={title}
            fieldLabel={fieldLabel()}
            onValueChange={onValueChange}
            value={value}
            disabled={disabled}
          />
        );
      case 'picklist':
        return (
          <Picklist
            onValueChange={onValueChange}
            value={value}
            fieldName={name}
            fieldLabel={fieldLabel()}
            disabled={disabled}
          />
        );
      case 'phone':
        return <TextInput title={fieldLabel()} onValueChange={onValueChange} value={value} keyboardType="phone-pad" />;
      case 'reference':
        return (
          <Lookup
            title={title}
            fieldName={name}
            fieldLabel={fieldLabel()}
            navigation={navigation}
            value={value}
            disabled={disabled}
          />
        );
      default:
        return (
          <Text>
            {title} ({type})
          </Text>
        );
    }
  };

  return (
    <View
      style={{
        // flex: 1,
        alignItems: 'flex-start',
        backgroundColor: APP_THEME.APP_WHITE,
      }}
    >
      {renderItem()}
    </View>
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    paddingBottom: 5,
  },
  labelStyle: {
    fontSize: 14,
    paddingLeft: 5,
    color: APP_THEME.APP_LIGHT_FONT_COLOR,
    fontFamily: APP_FONTS.FONT_BOLD,
  },
});

export default memo(SurveyEditorItem);
