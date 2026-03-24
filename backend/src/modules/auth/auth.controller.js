const authService = require('./auth.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  sendSuccess(res, 201, 'User registered successfully', result);
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, 200, 'Login successful', result);
});

const me = catchAsync(async (req, res) => {
  const result = await authService.me(req.user.id);
  sendSuccess(res, 200, 'Profile fetched', result);
});

module.exports = {
  register,
  login,
  me,
};
