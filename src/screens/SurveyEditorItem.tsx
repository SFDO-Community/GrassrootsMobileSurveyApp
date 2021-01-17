import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { TextInput, CheckboxButton, DatePicker, Picklist, Lookup } from '../components/surveyEditor';

import { useSelector, useDispatch } from '../state/surveyEditorState';

type SurveyItemProps = {
  navigation: any;
  title: string;
  name: string;
  type: string;
};

function SurveyEditorItem({ navigation, title, name, type }: SurveyItemProps) {
  const value = useSelector(state => state.survey[name]);
  const syncStatus = useSelector(state => state.survey.syncStatus);
  const disabled = syncStatus === 'Synced';
  const dispatchSurvey = useDispatch();

  const onValueChange = value => {
    dispatchSurvey({ type: 'UPDATE', field: { name: name, value } });
  };

  const renderItem = () => {
    switch (type) {
      case 'string':
        return <TextInput title={title} onValueChange={onValueChange} value={value} disabled={disabled} />;
      case 'textarea':
        return <TextInput title={title} onValueChange={onValueChange} value={value} multiline={disabled} />;
      case 'double':
        return (
          <TextInput
            title={title}
            onValueChange={onValueChange}
            value={value}
            keyboardType="numeric"
            disabled={disabled}
          />
        );
      case 'boolean':
        return (
          <CheckboxButton
            title={title}
            onPress={() => dispatchSurvey({ type: 'UPDATE', field: { name: name, value: !value } })}
            selected={value}
            disabled={disabled}
          />
        );
      case 'date':
        return <DatePicker title={title} onValueChange={onValueChange} value={value} disabled={disabled} />;
      case 'picklist':
        return <Picklist onValueChange={onValueChange} value={value} fieldName={name} disabled={disabled} />;
      case 'phone':
        return <TextInput title={title} onValueChange={onValueChange} value={value} keyboardType="phone-pad" />;
      case 'reference':
        return <Lookup title={title} fieldName={name} navigation={navigation} value={value} disabled={disabled} />;
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
        backgroundColor: 'white',
      }}
    >
      {renderItem()}
    </View>
  );
}

export default memo(SurveyEditorItem);
