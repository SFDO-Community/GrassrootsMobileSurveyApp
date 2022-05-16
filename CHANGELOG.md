# 0.7.0 - May 16th, 2022
* Accept email address including '+' character such as `hello+123@example.com` on login screen
* Disable sync button when there are no unsynced surveys
* Keep login session
* Disable unexpected gesture back to login screen from survey list screen
* Some under-the-hood code maintenance
* Show version on settings screen

# 0.6.1 - May 7th, 2022
**Before using this version, make sure to install base Salesforce package v0.12.0**
* Fix picklist field crashing the app in iOS
  * Upgrade Expo SDK version to 44.0 and update dependencies
* Fix typo in Login Setting screen
* Migrate expo build to EAS build
* Update for the latest matadata

# 0.6.0 - May 4th, 2022
* Trim spaces when saving Heroku app name

# 0.5.0 - April 2022
* Refer picklist instead of record type for contact type

# 0.4.0 - August 2nd, 2021
* Skip record type selection screen if there's only one record type in the org (including Master record type)
* Under-the-hood code maintenance
  * Upgrade Expo SDK version to 42.0
  * Small refactoring

# 0.3.1 - July 25th, 2021
* Load email automatically in login screen after the second time

# 0.3.0 - June 10th, 2021
* Use new fancy logo!
* Add error handling for invalid contact lookup value
* Add swipe menu to sync a survey
* Add Heroku URL setting screen and remove .env settings

# 0.2.0 - May 15th, 2021
* Display surveys in descending order
* Fix unhandled promise rejection error after reload [(#25)](https://github.com/SFDO-Community-Sprints/GrassRootsMobileSurveyApp/issues/25)
* Update label of back buttons

# 0.1.1 - April 12th, 2021
* Show clear error message for invalid Heroku url setting, instead of unkind JSON.parse error

# 0.1.0
* Initial release