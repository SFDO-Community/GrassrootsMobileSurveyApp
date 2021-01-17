export const validateEmail = email => {
  const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (email.match(emailFormat)) {
    return true;
  }
  return false;
};

/* this should be removed for grass roots app */
export const getSurveyTitleOnList = (recordTypes, contacts, survey) => {
  const rt = recordTypes.find(r => r.recordTypeId === survey.RecordTypeId);
  try {
    if (!rt) {
      return survey.Name || survey.localId;
    }
    switch (rt.name) {
      case 'Ante_Natal_Visit':
        return contacts.find(c => c.id === survey.Mother__c).name;
      case 'Mother_Child_Visit':
        return contacts.find(c => c.id === survey.Mother__c).name;
      case 'New_Beneficiary':
        return `${survey.Beneficiary_First_Name__c} ${survey.Beneficiary_Last_Name__c}`;
      case 'New_Child':
        return `${survey.Child_First_Name__c} ${survey.Child_Last_Name__c}`;
      case 'New_Mother':
        return `${survey.Mother_First_Name__c} ${survey.Mother_Last_Name__c}`;
      default:
        return `Survey #${survey.localId}`;
    }
  } catch {
    return `Survey #${survey.localId}`;
  }
};
