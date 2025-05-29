module.exports = {
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: new (global.Headers || function(h) { return h || {}; })(init?.headers || {}),
    })),
  },
}; 