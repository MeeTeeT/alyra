// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.20;

/**
 * @title Voting
 * @dev Voting system with whitelisted participants and participants proposition
 */

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

error Voting__ProposalAlreadyExists();

contract Voting is Ownable {
    //constructor() Ownable() {}

    uint winningProposalId; //Winning proposal Id
    Proposal winningProposal; // Winning proposal details

    WorkflowStatus voteStatus; // Actual status of voting stage

    mapping(address => bool) whitelist; // Mapping address -> whitelisted users
    mapping(address => Voter) voters; // Mapping address ->  voter struct
    Proposal[] proposals; // Array of proposal

    event VoterRegistered(address voterAddress); // event when a voter is whitelisted
    event WorkflowStatusChange(
        WorkflowStatus previousStatus,
        WorkflowStatus newStatus
    ); // event when vote stage change
    event ProposalRegistered(uint proposalId); // event when a new proposal is registered
    event Voted(address voter, uint proposalId); //event when a new vote

    struct Voter {
        bool isRegistered; //if true, voter is whitelisted
        bool hasVoted; //if true, voter has already voted
        uint votedProposalId; //id in proposal array of the proposals[]
    }

    struct Proposal {
        string description; //proposal'a description
        uint voteCount; // vote count for the proposal
    }

    enum WorkflowStatus {
        RegisteringVoters, //whitelisting users
        ProposalsRegistrationStarted, //Proposal start
        ProposalsRegistrationEnded, //Proposal end
        VotingSessionStarted, // Voting session start
        VotingSessionEnded, // Voting session end
        VotesTallied // Calculate winner
    }

    modifier checkWhitelisted() {
        //modifier to check whitelisted user
        require(whitelist[msg.sender] == true, "You are not whitelisted");
        _;
    }

    modifier checkNumberProposals() {
        //modifier to check if there are proposals to vote for
        require(proposals.length > 0, "There is no proposal to vote for");
        _;
    }

    modifier checkAddress0(address _address) {
        //modifier to check input address
        require(_address != address(0), "input address is invalid");
        _;
    }

    modifier checkWinnerIsCalculated() {
        //modifier to if check winner has been calculated
        require(
            voteStatus == WorkflowStatus.VotesTallied,
            "Winner is not already set"
        ); //check the Voting status phase
        _;
    }

    /**
     * @dev Set vote status to RegisteringVoters
     */
    function setVoteStatusRegisteringVoters() external onlyOwner {
        require(voteStatus == WorkflowStatus.RegisteringVoters);
        WorkflowStatus voteStatusTemp = voteStatus; //keep temporary previous vote status
        voteStatus = WorkflowStatus.RegisteringVoters; //save new voting status
        emit WorkflowStatusChange(voteStatusTemp, voteStatus); //send event
    }

    /**
     * @dev Set vote status to ProposalRegistrationstart
     */
    function setVoteStatusProposalsRegistrationStarted() external onlyOwner {
        require(voteStatus == WorkflowStatus.RegisteringVoters);
        WorkflowStatus voteStatusTemp = voteStatus; //keep temporary previous vote status
        voteStatus = WorkflowStatus.ProposalsRegistrationStarted; //save new voting status
        emit WorkflowStatusChange(voteStatusTemp, voteStatus); //send event
    }

    /**
     * @dev Set vote status to ProposalRegistrationEnd
     */
    function setVoteStatusProposalsRegistrationEnded() external onlyOwner {
        //check if there is at least on proposal
        require(voteStatus == WorkflowStatus.ProposalsRegistrationStarted);
        WorkflowStatus voteStatusTemp = voteStatus; //keep temporary previous vote status
        voteStatus = WorkflowStatus.ProposalsRegistrationEnded; //save new voting status
        emit WorkflowStatusChange(voteStatusTemp, voteStatus); //send event
    }

    /**
     * @dev Set vote status to VotingSessionStart
     */
    function setVoteStatusVotingSessionStarted()
        external
        checkNumberProposals
        onlyOwner
    {
        require(voteStatus == WorkflowStatus.ProposalsRegistrationEnded);
        WorkflowStatus voteStatusTemp = voteStatus; //keep temporary previous vote status
        voteStatus = WorkflowStatus.VotingSessionStarted; //save new voting status
        emit WorkflowStatusChange(voteStatusTemp, voteStatus); //send event
    }

    /**
     * @dev Set vote status to VotingSessionEnded
     */
    function setVoteStatusVotingSessionEnded() external onlyOwner {
        require(voteStatus == WorkflowStatus.VotingSessionStarted);
        WorkflowStatus voteStatusTemp = voteStatus; //keep temporary previous vote status
        voteStatus = WorkflowStatus.VotingSessionEnded; //save new voting status
        emit WorkflowStatusChange(voteStatusTemp, voteStatus); //send event
    }

    /**
     * @dev Set vote status to VotesTallied
     */
    function setVoteStatusVotesTallied() private onlyOwner {
        require(voteStatus == WorkflowStatus.VotingSessionEnded);
        WorkflowStatus voteStatusTemp = voteStatus; //keep temporary previous vote status
        voteStatus = WorkflowStatus.VotesTallied; //save new voting status
        emit WorkflowStatusChange(voteStatusTemp, voteStatus); //send event
    }

    /**
     * @dev get actual vote status
     * return voteStatus
     */
    function getVoteStatus() external view onlyOwner returns (WorkflowStatus) {
        return voteStatus;
    }

    /**
     * @dev whitelist address
     * @param _address to whitelist
     */
    function authorize(
        address _address
    ) external checkAddress0(_address) onlyOwner {
        require(
            voteStatus == WorkflowStatus.RegisteringVoters,
            "Registration Phase is not set"
        ); //check the Voting status phase
        require(!whitelist[_address], "User already whitelisted"); //check already whitelisted user
        whitelist[_address] = true; //whitelist user
        voters[_address].isRegistered = true; //"whitelist" user in Voter struct
        emit VoterRegistered(_address); // Send event
    }

    /**
     * @dev add new proposal
     * @param _description of the proposal
     */
    function proposal(string memory _description) external checkWhitelisted {
        require(
            voteStatus == WorkflowStatus.ProposalsRegistrationStarted,
            "Proposals are not allowed during this step"
        ); //check the Voting status phase

        bool proposalExist;
        for (uint i = 0; i < proposals.length; i++) {
            //check if proposal description already exists
            if (
                keccak256(abi.encodePacked(proposals[i].description)) ==
                keccak256(abi.encodePacked(_description))
            ) {
                proposalExist = true;
            }
        }

        if (!proposalExist) {
            proposals.push(Proposal(_description, 0)); //add the proposal to the list of proposals
            emit ProposalRegistered(proposals.length - 1); //send event
        } else {
            revert Voting__ProposalAlreadyExists();
        }
    }

    /**
     * @dev vote for a proposal
     * @param proposalId of the proposal
     */
    function vote(
        uint proposalId
    ) external checkNumberProposals checkWhitelisted {
        require(
            voteStatus == WorkflowStatus.VotingSessionStarted,
            "Vote phase is not launch"
        ); //check the Voting status phase
        require(!voters[msg.sender].hasVoted, "You have already voted"); //check is user has already voted
        require(
            proposalId < proposals.length && proposalId >= 0,
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
    function calculateWinner() external onlyOwner {
        require(
            voteStatus == WorkflowStatus.VotingSessionEnded,
            "Voted session has not ended"
        ); //check the Voting status phase

        if (proposals.length == 1) {
            //if only one proposal, return this proposal => Optimisation of gaz cost computation ?
            winningProposalId = 0;
            winningProposal = proposals[0];
        } else {
            //else, calculate winner, if draw, we take first proposal in proposal array order
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
     * return proposal detail from user
     */
    function getVoteFromParticipant(
        address _address
    )
        external
        view
        checkAddress0(_address)
        checkWhitelisted
        returns (Proposal memory)
    {
        require(
            voteStatus == WorkflowStatus.VotesTallied,
            "You can see votes from voters only when vote phase is closed"
        );
        require(voters[_address].hasVoted, "User picked hasn't vote"); //check user picked has voted
        return proposals[voters[_address].votedProposalId];
    }

    /**
     * @dev get winner details
     * return  winner proposal id and winner proposal
     */
    function getWinnerDetail()
        public
        view
        checkWinnerIsCalculated
        returns (Proposal memory)
    {
        return winningProposal; //return winning proposal
    }

    /**
     * @dev get winner name
     * return winner name
     */
    function getWinner()
        external
        view
        checkWinnerIsCalculated
        returns (string memory)
    {
        return getWinnerDetail().description;
    }
}
