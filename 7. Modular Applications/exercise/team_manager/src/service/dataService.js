import { api } from "./requester.js";

const endPoints =
{
    getAllTeams: "http://localhost:3030/data/teams",
    getAllMembers: "http://localhost:3030/data/members?where=status%3D%22member%22",
    getTeamById: "http://localhost:3030/data/teams/",
    getTeamMembers: (teamId) => `http://localhost:3030/data/members?where=teamId%3D%22${teamId}%22&load=user%3D_ownerId%3Ausers`,
    requestToBecomeAMember: "http://localhost:3030/data/members",
    approveMembership: "http://localhost:3030/data/members/",
    removeFromOrLeaveTeam: "http://localhost:3030/data/members/",
    getTeamsWhereUserIsAMember: (userId) => `http://localhost:3030/data/members?where=_ownerId%3D%22${userId}%22%20AND%20status%3D%22member%22&load=team%3DteamId%3Ateams`
}

async function getAllTeams()
{
    return await api.get(endPoints.getAllTeams);
}

async function createTeam(data)
{
    return await api.post(endPoints.getAllTeams, data);
}

async function getAllMembers()
{
    return await api.get(endPoints.getAllMembers);
}

async function getTeamById(id)
{
    return await api.get(endPoints.getTeamById + id);
}

async function updateTeam(teamId, data)
{
    return await api.update(endPoints.getTeamById + teamId, data);
}

async function getTeamMembers(teamId)
{
    return await api.get(endPoints.getTeamMembers(teamId));
}

async function requestToBecomeAMember(data)
{
    return await api.post(endPoints.requestToBecomeAMember, data);
}

async function approveMembership(memberId)
{
    return await api.update(endPoints.approveMembership + memberId, { status: "member" });
}

async function removeFromOrLeaveTeam(membershipRecordId)
{
    return await api.del(endPoints.removeFromOrLeaveTeam + membershipRecordId);
}

async function getTeamsWhereUserIsAMember(userId)
{
    return await api.get(endPoints.getTeamsWhereUserIsAMember(userId));
}

export const dataService =
{
    getAllTeams,
    createTeam,
    getAllMembers,
    getTeamById,
    updateTeam,
    getTeamMembers,
    requestToBecomeAMember,
    approveMembership,
    removeFromOrLeaveTeam,
    getTeamsWhereUserIsAMember
}