import { api } from "./requester.js";

const endPoints =
{
    getAllTeams: "http://localhost:3030/data/teams",
    getAllMembers: "http://localhost:3030/data/members?where=status%3D%22member%22",
    getTeamById: "http://localhost:3030/data/teams/",
    getTeamMembers: (teamId) => `http://localhost:3030/data/members?where=teamId%3D%22${teamId}%22&load=user%3D_ownerId%3Ausers`,
    requestToBecomeAMember: "http://localhost:3030/data/members",
    approveMembership: "http://localhost:3030/data/members/",
    removeFromOrLeaveTeam: "http://localhost:3030/data/members/"
}

async function getAllTeams()
{
    return await api.get(endPoints.getAllTeams);
}

async function getAllMembers()
{
    return await api.get(endPoints.getAllMembers);
}

async function getTeamById(id)
{
    return await api.get(endPoints.getTeamById + id);
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

export const dataService =
{
    getAllTeams,
    getAllMembers,
    getTeamById,
    getTeamMembers,
    requestToBecomeAMember,
    approveMembership,
    removeFromOrLeaveTeam
}