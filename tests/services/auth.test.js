import { authenticate } from '../../src/services/auth';
import { mockAuthSuccessResponse, mockAuthFailureResponse } from './mockResponse';

describe('auth', () => {
  it('authenticate (success)', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(mockAuthSuccessResponse);
    global.storage = { save: jest.fn() };

    const response = await authenticate('example@example.com', 'password');
    expect(response.success).toBe(true);
    expect(response.access_token).toBeTruthy();
    expect(response.instance_url).toBeTruthy();
  });

  it('authenticate (failure)', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(mockAuthFailureResponse);

    const response = await authenticate('example@example.com', 'wrong_password');
    expect(response.success).toBe(false);
    expect(response.error).toBeTruthy();
    expect(response.error_description).toBeTruthy();
  });
});
