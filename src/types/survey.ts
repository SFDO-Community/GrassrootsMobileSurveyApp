/**
 * Fields used for survey list item.
 */
export interface SurveyListItem {
  title: string;
  subtitle: string;
  showCaret: boolean;
  _syncStatus: 'Unsynced' | 'Synced';
}

/**
 * Object for survey layout definition used in 'SectionList' component on survey editor screen.
 */
export interface SurveyLayout {
  sections?: Array<{
    id: string;
    title: string;
    data: Array<{
      name: string;
      label: string;
      type: string;
    }>;
  }>;
}

export interface CompositeObjectCreateResultItem {
  referenceId: string;
  id: string;
}

export interface CompositeObjectResponse {
  compositeResponse: Array<CompositeObjectFieldsResult>;
}

export interface CompositeObjectFieldsResult {
  body: CompositeCompactLayoutResultSuccessItem;
  httpStatusCode: number;
  referenceId: string;
}

export interface CompositeCompactLayoutResultSuccessItem {
  Id: string;
  attributes: {
    type: string;
    url: string;
  };
}

export interface CompositeGenericErrorResponse {
  compositeResponse: Array<{
    body: Array<SalesforceErrorResponseItem>;
    httpStatusCode: number;
    referenceId: string;
  }>;
}
export interface SalesforceErrorResponseItem {
  message: string;
  errorCode: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function implementsCompositeGenericErrorResponse(arg: any): arg is CompositeGenericErrorResponse {
  return arg.compositeResponse.some(r => r.httpStatusCode !== 200);
}
