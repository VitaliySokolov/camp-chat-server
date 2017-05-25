import * as api from './api';

describe('getAllUsersRhcloud', () => {
  it('should response with users', () => {
    const users = [
      {'username': 'foo'},
      {'username': 'bar'}
    ];
    fetch.mockResponse(JSON.stringify(users));
    api.getAllUsersRhcloud().then(res =>
      expect(res).toEqual(users)
    );
  });
});
