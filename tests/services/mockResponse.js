/* eslint-disable @typescript-eslint/camelcase */

const mockAuthSuccessResponse = {
  ok: true,
  status: 200,
  json: () =>
    Promise.resolve({
      access_token:
        '00D0k0000009BZv!AQsAQBsfvqj2WsGla54T27iiyhWgR4uFbf1C273NRdBaB74bYGtgo6YAui9Qz74ANk5YZwryd.0b0UQg27bB4dwJ2DB69lYi',
      instance_url: 'https://example.my.salesforce.com',
    }),
};

const mockAuthFailureResponse = {
  ok: false,
  status: 401,
  json: () =>
    Promise.resolve({
      error: 'invalid_grant',
      error_description: 'Wrong email or password.',
    }),
};

const mockLoginResponse = {
  success: true,
  access_token:
    '00D0k0000009BZv!AQsAQBsfvqj2WsGla54T27iiyhWgR4uFbf1C273NRdBaB74bYGtgo6YAui9Qz74ANk5YZwryd.0b0UQg27bB4dwJ2DB69lYi',
  instance_url: 'https://example.my.salesforce.com',
};

const mockQuerySuccessResponse = {
  ok: true,
  status: 200,
  json: () => Promise.resolve(mockResolvedQueryResult),
};

const mockResolvedQueryResult = {
  totalSize: 1,
  done: true,
  records: [
    {
      attributes: {
        type: 'Account',
        url: '/services/data/v50.0/sobjects/Account/0010k00000vJjNzAAK',
      },
      Id: '0010k00000vJjNzAAK',
    },
  ],
};

const mockQueryFailureResponse = {
  ok: false,
  status: 401,
  json: () =>
    Promise.resolve([
      {
        message: 'Session expired or invalid',
        errorCode: 'INVALID_SESSION_ID',
      },
    ]),
};

export {
  mockAuthSuccessResponse,
  mockAuthFailureResponse,
  mockLoginResponse,
  mockQuerySuccessResponse,
  mockQueryFailureResponse,
  mockResolvedQueryResult,
};
