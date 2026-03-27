const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');
const privateLeaguesService = require('./privateLeagues.service');

const listMyLeagues = catchAsync(async (req, res) => {
  const leagues = await privateLeaguesService.listMyLeagues(req.user.id, {
    leagueSeasonId: req.query.leagueSeasonId || null,
  });
  sendSuccess(res, 200, 'Private leagues fetched', leagues);
});

const createPrivateLeague = catchAsync(async (req, res) => {
  const league = await privateLeaguesService.createPrivateLeague({
    userId: req.user.id,
    leagueSeasonId: req.body.leagueSeasonId,
    name: req.body.name,
  });
  sendSuccess(res, 201, 'Private league created successfully', league);
});

const joinPrivateLeague = catchAsync(async (req, res) => {
  const league = await privateLeaguesService.joinPrivateLeague({
    userId: req.user.id,
    inviteCode: req.body.inviteCode,
  });
  sendSuccess(res, 200, 'Joined private league successfully', league);
});

const getPrivateLeagueDetail = catchAsync(async (req, res) => {
  const league = await privateLeaguesService.getLeagueDetail(req.params.leagueId, req.user.id);
  sendSuccess(res, 200, 'Private league fetched successfully', league);
});

const leavePrivateLeague = catchAsync(async (req, res) => {
  const result = await privateLeaguesService.leavePrivateLeague({
    userId: req.user.id,
    leagueId: req.params.leagueId,
  });
  sendSuccess(res, 200, 'Left private league successfully', result);
});

const removeMember = catchAsync(async (req, res) => {
  const league = await privateLeaguesService.removeMember({
    actorUserId: req.user.id,
    leagueId: req.params.leagueId,
    targetUserId: req.params.userId,
  });
  sendSuccess(res, 200, 'Member removed successfully', league);
});

module.exports = {
  listMyLeagues,
  createPrivateLeague,
  joinPrivateLeague,
  getPrivateLeagueDetail,
  leavePrivateLeague,
  removeMember,
};