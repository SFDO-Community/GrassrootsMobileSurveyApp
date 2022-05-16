import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { useLocalizationContext } from './context/localizationContext';
import { AuthContextValue, useAuthContext } from './context/authContext';

// screens
import Login from './screens/Login';
import LoginSettings from './screens/LoginSettings';
import SurveyList from './screens/SurveyList';
import SurveyTypePicker from './screens/SurveyTypePicker';
import SurveyEditor from './screens/SurveyEditor';
import Settings from './screens/Settings';
import LookupSearch from './screens/LookupSearch';

// components
import { LogoutButton } from './components/surveyList/SurveyListHeaderButtons';
import { LoginSettingsButton } from './components/LoginSettingsButton';

// styles
import { ASYNC_STORAGE_KEYS, APP_FONTS, APP_THEME } from './constants';

export type StackParamList = {
  Login: undefined;
  LoginSettings: undefined;
  SurveyList: undefined;
  SurveyTypePicker: undefined;
  SurveyEditor: {
    selectedRecordTypeId?: string;
    selectedLayoutId?: string;
    _localId?: string;
  };
  Settings: undefined;
  Lookup: {
    fieldName: string;
    title: string;
  };
};

const MainStack = createStackNavigator();
const RootStack = createStackNavigator();
const LoginStack = createStackNavigator();

function LoginStackScreen() {
  const { t } = useLocalizationContext();
  return (
    <LoginStack.Navigator>
      <MainStack.Screen
        name="Login"
        component={Login}
        options={({ navigation }) => ({
          title: t('LOGIN'),
          headerRight: () => LoginSettingsButton({ navigation }),
          ...headerStyle,
          animationEnabled: false,
        })}
      />
      <MainStack.Screen
        name="LoginSettings"
        component={LoginSettings}
        options={{
          title: t('LOGIN_SETTINGS'),
          ...headerStyle,
        }}
      />
    </LoginStack.Navigator>
  );
}

function MainStackScreen() {
  const { t } = useLocalizationContext();
  const authContext = useAuthContext();
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="SurveyList"
        component={SurveyList}
        options={() => ({
          title: t('SURVEYS'),
          headerLeft: () => LogoutButton(t, authContext),
          ...headerStyle,
          gestureEnabled: false,
          animationEnabled: false,
        })}
      />
      <MainStack.Screen
        name="SurveyTypePicker"
        component={SurveyTypePicker}
        options={{
          title: t('CHOOSE_SURVEY'),
          headerBackTitle: 'Back',
          ...headerStyle,
        }}
      />
      <MainStack.Screen
        name="SurveyEditor"
        component={SurveyEditor}
        options={{
          title: t('NEW_SURVEY'),
          headerBackTitle: 'Back',
          ...headerStyle,
        }}
      />
      <MainStack.Screen
        name="Settings"
        component={Settings}
        options={{
          title: t('SETTINGS'),
          headerBackTitle: 'Back',
          ...headerStyle,
        }}
      />
    </MainStack.Navigator>
  );
}

export default function Router() {
  const authContext: AuthContextValue = useAuthContext();
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        const fieldWorkerContactId = await storage.load({ key: ASYNC_STORAGE_KEYS.FIELD_WORKER_CONTACT_ID });
        if (fieldWorkerContactId) {
          authContext.login();
        }
      } catch {
        // storage.load fails when no data
      } finally {
        setLoaded(true);
      }
    };
    prepare();
  }, []);

  return loaded ? (
    <NavigationContainer>
      <RootStack.Navigator mode="modal" headerMode="none">
        {authContext.isLoggedIn ? (
          <RootStack.Screen name="Main" component={MainStackScreen} />
        ) : (
          <RootStack.Screen name="Unauthed" component={LoginStackScreen} />
        )}
        <RootStack.Screen name="Lookup" component={LookupSearch} />
      </RootStack.Navigator>
    </NavigationContainer>
  ) : null;
}

const headerStyle = {
  headerStyle: {
    backgroundColor: APP_THEME.NAVIGATION_BACKGROUND,
  },
  headerTintColor: APP_THEME.APP_BASE_FONT_COLOR,
  headerTitleStyle: {
    fontSize: 16,
    fontWeight: '600' as '600',
    fontFamily: APP_FONTS.FONT_BOLD,
  },
};
