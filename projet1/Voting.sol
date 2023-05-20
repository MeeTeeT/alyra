// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.20;

/**
 * @title Voting
 * @dev Voting system with whitelisted participants and participants proposition
 */

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

contract Storage is Ownable {
    constructor() Ownable() {
        voteStatus = WorkflowStatus.RegisteringVoters; //Vote status is defined as registering voter at smart contract deployment.
    }

    event VoterRegistered(address voterAddress); // event when a voter is whitelisted
    event WorkflowStatusChange(
        WorkflowStatus previousStatus,
        WorkflowStatus newStatus
    ); // event when vote status change
    event ProposalRegistered(uint proposalId); // event when a new proposal is registered
    event Voted(address voter, uint proposalId); //event when a new vote

    struct Voter {
        bool isRegistered; //if true, voter is whitelisted
        bool hasVoted; //if true, voter has already voted
        uint votedProposalId; //id in proposal array of the proposal voted
    }

    struct Proposal {
        string description; //proposal'a name
        uint voteCount; // vote count for the proposal
    }

    enum WorkflowStatus {
        RegisteringVoters, //whitelisting users
        ProposalsRegistrationStarted, //Proposals start
        ProposalsRegistrationEnded, //Proposal end
        VotingSessionStarted, // Voting session start
        VotingSessionEnded, // Voting session end
        VotesTallied // Calculate winner
    }

    WorkflowStatus voteStatus;

    uint winningProposalId; //Winning proposal Id
    Proposal winningProposal; // Winning proposal details

    mapping(address => bool) whitelist; // Mapping address -> whitelisted userVo
    mapping(address => Voter) voters; // Mapping address -> Array vote user
    Proposal[] proposals; // Array of proposition

    modifier checkWhitelisted() {
        //modifier to check whitelisted user
        require(whitelist[msg.sender] == true, "You are not whitelisted");
        _;
    }

    modifier checkNumberProposals() {
        //modifier to check input address
        require(proposals.length > 0, "There is no proposal to vote for");
        _;
    }

    modifier checkAddress0(address _address) {
        //modifier to check if there are proposals > 0
        require(_address != address(0), "input address is invalid");
        _;
    }

    /**
     * @dev Set vote status to Registering Voters
     */
    function setVoteStatusRegisteringVoters() public onlyOwner {
        require(voteStatus == WorkflowStatus.RegisteringVoters);
        WorkflowStatus voteStatusTemp = voteStatus; //keep temporary previous vote status
        voteStatus = WorkflowStatus.RegisteringVoters; //save new voting status
        emit WorkflowStatusChange(voteStatusTemp, voteStatus); //send event
    }

    /**
     * @dev Set vote status to Proposal Registration start
     */
    function setVoteStatusProposalsRegistrationStarted() public onlyOwner {
        require(voteStatus == WorkflowStatus.RegisteringVoters);
        WorkflowStatus voteStatusTemp = voteStatus; //keep temporary previous vote status
        voteStatus = WorkflowStatus.ProposalsRegistrationStarted; //save new voting status
        emit WorkflowStatusChange(voteStatusTemp, voteStatus); //send event
    }

    /**
     * @dev Set vote status to Proposal Registration end
     */
    function setVoteStatusProposalsRegistrationEnded()
        public
        checkNumberProposals
        onlyOwner
    {
        //check if there is at least on proposal
        require(voteStatus == WorkflowStatus.ProposalsRegistrationStarted);
        WorkflowStatus voteStatusTemp = voteStatus; //keep temporary previous vote status
        voteStatus = WorkflowStatus.ProposalsRegistrationEnded; //save new voting status
        emit WorkflowStatusChange(voteStatusTemp, voteStatus); //send event
    }

    /**
     * @dev Set vote status to Voting Session Start
     */
    function setVoteStatusVotingSessionStarted() public onlyOwner {
        require(voteStatus == WorkflowStatus.ProposalsRegistrationEnded);
        WorkflowStatus voteStatusTemp = voteStatus; //keep temporary previous vote status
        voteStatus = WorkflowStatus.VotingSessionStarted; //save new voting status
        emit WorkflowStatusChange(voteStatusTemp, voteStatus); //send event
    }

    /**
     * @dev Set vote status to Voting Session Ended
     */
    function setVoteStatusVotingSessionEnded() public onlyOwner {
        //verifier qu'il y a eu au moins 1 vote
        require(voteStatus == WorkflowStatus.VotingSessionStarted);
        WorkflowStatus voteStatusTemp = voteStatus; //keep temporary previous vote status
        voteStatus = WorkflowStatus.VotingSessionEnded; //save new voting status
        emit WorkflowStatusChange(voteStatusTemp, voteStatus); //send event
    }

    /**
     * @dev Set vote status to Votes Tallied
     */
    function setVoteStatusVotesTallied() private onlyOwner {
        require(voteStatus == WorkflowStatus.VotingSessionEnded);
        WorkflowStatus voteStatusTemp = voteStatus; //keep temporary previous vote status
        voteStatus = WorkflowStatus.VotesTallied; //save new voting status
        emit WorkflowStatusChange(voteStatusTemp, voteStatus); //send event
    }

    /**
     * @dev get actual vote status
     * @return voteStatus
     */
    function getVoteStatus() public view returns (WorkflowStatus) {
        return voteStatus;
    }

    /**
     * @dev whitelist address
     * @param _address to whitelist
     */
    function authorize(
        address _address
    ) public checkAddress0(_address) onlyOwner {
        require(
            voteStatus == WorkflowStatus.RegisteringVoters,
            "Registration Phase is not set"
        ); //check the Voting status phase
        require(!whitelist[_address], "User already whitelisted"); //check already whitelisted user
        //verifier que l'addresse n'est pas l'address 0
        whitelist[_address] = true; //whitelist user
        voters[_address].isRegistered = true; //"whitelist" user in Voter struct
        emit VoterRegistered(_address); // Send event
    }

    /**
     * @dev add new proposal
     * @param _description of the proposal
     */
    function proposal(string memory _description) public checkWhitelisted {
        //tester si la proposaition (_description) existe deja
        require(
            voteStatus == WorkflowStatus.ProposalsRegistrationStarted,
            "Proposals are not allowed during this step"
        ); //check the Voting status phase
        proposals.push(Proposal(_description, 0)); //add proposal to the list of proposals
        emit ProposalRegistered(proposals.length - 1); //send event
    }

    /**
     * @dev vote for a proposal
     * @param proposalId of the proposal
     */
    function vote(
        uint proposalId
    ) public checkNumberProposals checkWhitelisted {
        require(
            voteStatus == WorkflowStatus.VotingSessionStarted,
            "Vote phase is not launch"
        ); //check the Voting status phase
        require(!voters[msg.sender].hasVoted, "You have already voted"); //check is user has already voted
        require(
            proposalId < proposals.length,
            "No proposal for this proposal id"
        ); // check if proposal Id exists

        proposals[proposalId].voteCount++; //Increment counter for this proposal

        voters[msg.sender].hasVoted = true; //set the voter has voted
        voters[msg.sender].votedProposalId = proposalId; //set the proposal id of the voter

        emit Voted(msg.sender, proposalId); //sent event
    }

    /**
     * @dev calculate the winner of the vote
     *  save winner proposal id and winner proposal
     */
    function calculateWinner() public onlyOwner {
        require(
            voteStatus == WorkflowStatus.VotingSessionEnded,
            "Voted session has not ended"
        ); //check the Voting status phase
        //verifier qu'il y a eu des votes

        if (proposals.length == 1) {
            //if only one proposal, return this proposal
            winningProposalId = 0;
            winningProposal = proposals[0];
        } else {
            //else, calculate winner, if draw, we take first proposal in proposal array
            uint BiggestVoteTmp;
            uint ProposalWinnerIdTmp;

            for (uint i; i < proposals.length; i++) {
                if (proposals[i].voteCount > BiggestVoteTmp) {
                    BiggestVoteTmp = proposals[i].voteCount;
                    ProposalWinnerIdTmp = i;
                }
            }
            winningProposalId = ProposalWinnerIdTmp; //save winning proposal id
            winningProposal = proposals[ProposalWinnerIdTmp]; //save winner proposal details
        }

        setVoteStatusVotesTallied(); //set voting session status to tallied
    }

    /**
     * @dev get vote from a participant (_address)
     * @param _address to get vote from
     * @return proposal detail from user
     */
    function getVoteFromParticipant(
        address _address
    )
        public
        view
        checkAddress0(_address)
        checkWhitelisted
        returns (Proposal memory)
    {
        require(
            voteStatus == WorkflowStatus.VotesTallied,
            "You cas see votes from voters only when vote phase is closed"
        );
        require(voters[_address].hasVoted, "User picked hasn't vote"); //check user picked has already voted
        return proposals[voters[_address].votedProposalId];
    }

    /**
     * @dev get winner details
     * @return save winner proposal id and winner proposal
     */
    function getWinnerDetail() public view returns (Proposal memory) {
        require(
            voteStatus == WorkflowStatus.VotesTallied,
            "Winner is not already set"
        ); //check the Voting status phase
        return winningProposal;
    }

    /**
     * @dev get winner name
     * @return winner name
     */
    function getWinner() public view returns (string memory) {
        require(
            voteStatus == WorkflowStatus.VotesTallied,
            "Winner is not already set"
        ); //check the Voting status phase
        return winningProposal.description; //return winning description proposal
    }
}
