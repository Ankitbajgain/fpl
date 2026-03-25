const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');
const adminService = require('./admin.service');
const gameplayService = require('../gameplay/gameplay.service');

const getLeagueFranchises = catchAsync(async (req, res) => {
  const { leagueSeasonId } = req.params;
  const data = await adminService.listLeagueFranchises(leagueSeasonId);
  sendSuccess(res, 200, 'League franchises fetched', data);
});

const getLeagueFixtures = catchAsync(async (req, res) => {
  const { leagueSeasonId } = req.params;
  const data = await adminService.listLeagueFixturesAdmin(leagueSeasonId);
  sendSuccess(res, 200, 'Admin fixtures fetched', data);
});

const createLeagueFixture = catchAsync(async (req, res) => {
  const { leagueSeasonId } = req.params;
  const data = await adminService.createFixture({
    leagueSeasonId,
    ...req.body,
  });
  sendSuccess(res, 201, 'Fixture created', data);
});

const updateLeagueFixture = catchAsync(async (req, res) => {
  const { leagueSeasonId, fixtureId } = req.params;
  const data = await adminService.updateFixture({
    leagueSeasonId,
    fixtureId,
    ...req.body,
  });
  sendSuccess(res, 200, 'Fixture updated', data);
});

const deleteLeagueFixture = catchAsync(async (req, res) => {
  const { leagueSeasonId, fixtureId } = req.params;
  await adminService.deleteFixture({ leagueSeasonId, fixtureId });
  sendSuccess(res, 200, 'Fixture deleted', { fixtureId: Number(fixtureId) });
});

const syncLeagueFixtures = catchAsync(async (req, res) => {
  const { leagueSeasonId } = req.params;
  const data = await adminService.syncFixtures({
    leagueSeasonId,
    source: req.body.source,
    fixtures: req.body.fixtures,
    apiUrl: req.body.apiUrl,
  });
  sendSuccess(res, 200, 'Fixtures synced', data);
});

const getLeagueTransferPolicy = catchAsync(async (req, res) => {
  const { leagueSeasonId } = req.params;
  const data = await gameplayService.getLeagueTransferPolicy(leagueSeasonId);
  sendSuccess(res, 200, 'League transfer policy fetched', data);
});

const updateLeagueTransferPolicy = catchAsync(async (req, res) => {
  const { leagueSeasonId } = req.params;
  const data = await gameplayService.upsertLeagueTransferPolicy({
    leagueSeasonId,
    leagueStageMatchCount: req.body.leagueStageMatchCount,
    leagueStageTransferCap: req.body.leagueStageTransferCap,
    playoffTransferCap: req.body.playoffTransferCap,
    qualifier1MatchNumber: req.body.qualifier1MatchNumber,
    unlimitedPreMatch1: req.body.unlimitedPreMatch1,
    unlimitedBetweenLeagueAndQ1: req.body.unlimitedBetweenLeagueAndQ1,
    adminUserId: req.user?.id,
  });
  sendSuccess(res, 200, 'League transfer policy updated', data);
});

module.exports = {
  getLeagueFranchises,
  getLeagueFixtures,
  createLeagueFixture,
  updateLeagueFixture,
  deleteLeagueFixture,
  syncLeagueFixtures,
  getLeagueTransferPolicy,
  updateLeagueTransferPolicy,
};
