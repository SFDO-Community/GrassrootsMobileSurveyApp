beforeEach(() => {
  Object.keys(global.mockedNavigation).forEach(key => {
    global.mockedNavigation[key].mockClear();
  });
});
