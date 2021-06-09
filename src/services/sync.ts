import { CompositeObjectCreateResultItem } from '../types/survey';
import { logger } from '../utility/logger';
import { notifySuccess, notifyError } from '../utility/notification';
import { getRecords } from './database/database';
import { updateSurveyStatusSynced } from './database/localSurvey';
import { fetchSurveysWithTitleFields, uploadSurveyListToSalesforce } from './salesforce/survey';
import { DB_TABLE } from '../constants';

export const syncLocalSurvey = async (localId: string) => {
  const survey = await getRecords(DB_TABLE.SURVEY, `WHERE _localId = '${localId}'`);
  syncLocalSurveys(survey);
};

/**
 * @description Upload local surveys, handle respnose from Salesforce,
 * and then show toast message.
 */
export const syncLocalSurveys = async (localSurveys: Array<any>) => {
  try {
    const response = await uploadSurveyListToSalesforce(localSurveys);
    logger('DEBUG', 'upload result', response);
    if (
      response.hasErrors === false &&
      response.results &&
      response.results.length > 0 &&
      response.results.length === localSurveys.length
    ) {
      const references: Array<CompositeObjectCreateResultItem> = response.results;
      const localIdToSurveyIdMap: Map<string, string> = new Map(references.map(r => [r.referenceId, r.id]));
      const surveyIdToRefreshedSurveysMap = await fetchSurveysWithTitleFields(references.map(r => r.id));
      const refreshedSurveys = [];
      localIdToSurveyIdMap.forEach((surveyId, _localId) => {
        refreshedSurveys.push({ _localId, ...surveyIdToRefreshedSurveysMap.get(surveyId) });
      });
      await updateSurveyStatusSynced(refreshedSurveys);
      notifySuccess(`${response.results.length === 1 ? 'Survey is' : 'Surveys are'} successfully uploaded!`);
      return;
    } else {
      throw new Error('Unexpected error occued while uploading. Contact your adminsitrator.');
    }
  } catch (e) {
    notifyError(e.message);
  }
};
