const Voting = artifacts.require("./Voting.sol");
const { BN , expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract("Voting", accounts => {
  
  const _owner = accounts[0];
  const _voter1 = accounts[1];
  const _voter2 = accounts[2];
  const _voter3 = accounts[3];
  const _proposalDescriptionEmpty = "";
  const _proposalDescription1 = "Vitalik";
  const _proposalDescription2 = "Satoshi";
  const _proposalDescription3 = "Linux";
  
  let MyVotingInstance;

  //check the deployer of the smart contract is the owner
  describe("Smart contract initialization", function() {

    beforeEach(async function(){
      MyVotingInstance = await Voting.new({ from: _owner });
    });

    it('check owner of the smart contract is the deployer', async function() {
        let theOwner = await MyVotingInstance.owner()
        assert.equal(theOwner, _owner)
    })
})

//Check function addVoter()
describe("Check function addVoter()", function() {

  beforeEach(async function(){
    MyVotingInstance = await Voting.new({ from: _owner });
   // console.log("l'adress du owner est ",_owner);
  });
  

  //check require : Check caller is the owner
  it("addVoter() => check require owner", async () => {
    await expectRevert(MyVotingInstance.addVoter(_voter2, {from: _voter1}), "Ownable: caller is not the owner");
  });

  //check require : checker workflowStatus
  //description : we set the sessions status to a bad status and we check the addVoter() function
  it("addVoter() => check require workflowStatus ", async () => {
    await MyVotingInstance.startProposalsRegistering({from: _owner}); //we set the session status to an ineligible status
    await expectRevert(MyVotingInstance.addVoter(_voter2, {from: _owner}), "Voters registration is not open yet");
  });
  
  //check require : already registrer
  //description : we registred a voter, and we try to registered this user again
  it("addVoter() => check already register", async () => {
    await MyVotingInstance.addVoter(_voter1, { from: _owner });
    await expectRevert(MyVotingInstance.addVoter(_voter1, {from: _owner}), "Already registered");
  });

  //check storage : registered state in Voter struct
  //description : we register a user, the we call this user and check if it regstered
  it("addVoter() => check addVoter registered the voter ", async () => {
    await MyVotingInstance.addVoter(_voter1, { from: _owner });
    const result = await MyVotingInstance.getVoter(_voter1, {from:_voter1}); //{from: _voter1} => seul quelqu'un de  assert.isTrue(result.isRegistered);
   });
 
   //check well execution of addVoter
   //description : check event
   it("addVoter() => check event VoterRegistered", async () => {
    const result = await MyVotingInstance.addVoter(_voter1, { from: _owner });
    expectEvent(result, 'VoterRegistered', {
      voterAddress: _voter1
    });
   });
});
   

  // console.log("***********************************");
  // console.log("Check startProposalsRegistering function ");
   
   describe("Check function startProposalsRegistering()", function() {

    beforeEach(async function(){
      MyVotingInstance = await Voting.new({ from: _owner });
    });

    //check require : Check caller is the owner
   it("startProposalsRegistering() => check require owner", async () => {
    await expectRevert(MyVotingInstance.startProposalsRegistering({from: _voter1}), "Ownable: caller is not the owner");
  });

  //check require : checker workflowStatus
  //description : we set the sessions status to a bad status and we check the startProposalsRegistering() function
  it("startProposalsRegistering() => check require workflowStatus ", async () => {
    await MyVotingInstance.startProposalsRegistering({from: _owner}); 
    await MyVotingInstance.endProposalsRegistering({from: _owner}); //we set the session status to an ineligible status
    await expectRevert(MyVotingInstance.startProposalsRegistering({from: _owner}), "Registering proposals cant be started now");
  });

  //check status change
  //description : we get initial status, then we execute function, and we check the new status
  it("startProposalsRegistering() => check workflowStatus change", async () => {
   
    let workflowStatutBeforeChange = await MyVotingInstance.workflowStatus();
    assert.equal(workflowStatutBeforeChange.words[0], new BN(0), 'Status should be 0');

    await MyVotingInstance.startProposalsRegistering({ from: _owner });
    
    let workflowStatusAfterChange = await MyVotingInstance.workflowStatus();
    assert.equal(workflowStatusAfterChange.words[0], new BN(1), 'Status should be 1');
    
    
  });

  //check well execution of startProposalsRegistering
   //description : check event
  it("startProposalsRegistering() => check event startProposalsRegistering", async () => {
    const result = await MyVotingInstance.startProposalsRegistering({ from: _owner });
    expectEvent(result, 'WorkflowStatusChange', {
      previousStatus: new BN(0),newStatus:new BN(1)
    });
   });
   
  });


   //console.log("***********************************");
   //console.log("Check addProposal function ");

   describe("Check function addProposal()", function() {

    //for all test, we add a voter and change session status to startProposal
    beforeEach(async function(){
      MyVotingInstance = await Voting.new({ from: _owner });
      await MyVotingInstance.addVoter(_voter1, { from: _owner }); //register a voter
      await MyVotingInstance.startProposalsRegistering({ from: _owner }); //start proposal sesssion
    });

     //check require : Check caller is the owner
   it("addProposal() => check require onlyVoters", async () => {
    await expectRevert(MyVotingInstance.addProposal(_proposalDescription1, {from: _voter2}), "You're not a voter"); // a proposal submit by a non registered user
  });

  //check require : check empty proposal
  it("addProposal() => check require empty proposal", async () => {
   await expectRevert(MyVotingInstance.addProposal(_proposalDescriptionEmpty, {from: _voter1}), "Vous ne pouvez pas ne rien proposer");
  });

  //check proposal storage
  //description : we add a proposal, then we call the proposal from id 1 (id 0 is GENESIS propoasl)
  //              and we check if they are equal
  it("addProposal() => check proposal storage", async () => {
    await MyVotingInstance.addProposal(_proposalDescription1, {from: _voter1});
    let storeDescription = (await MyVotingInstance.getOneProposal(1, {from: _voter1})).description;
    assert.equal(storeDescription,_proposalDescription1); //check 1 index and not the 0 index  because by default, at startProposalregistering, a "GENESIS" proposal is set.
  });

   //check well execution of addProposal
   //description : check event
  it("addProposal() => check event ProposalRegistered", async () => {
    result = await MyVotingInstance.addProposal(_proposalDescription1, {from: _voter1});
    expectEvent(result, 'ProposalRegistered', {
      proposalId: new BN(1)
    });
   });

  });

   //console.log("***********************************");
   //console.log("Check ProposalsRegistrationEnded function ");
   
   describe("Check function ProposalsRegistrationEnded()", function() {

    beforeEach(async function(){
      MyVotingInstance = await Voting.new({ from: _owner });
    });

    //check require : Check caller is the owner
   it("ProposalsRegistrationEnded() => check require owner", async () => {
    await expectRevert(MyVotingInstance.startProposalsRegistering({from: _voter1}), "Ownable: caller is not the owner");
  });

  //check require : checker workflowStatus
  //description :  sessions status is initially not the good one 
  //               so we check the startProposalsRegistering() function
  it("ProposalsRegistrationEnded() => check require workflowStatus ", async () => {
    await expectRevert(MyVotingInstance.endProposalsRegistering({from: _owner}), "Registering proposals havent started yet");
  });

  //check status change
  //description : we get initial status, then we execute function, and we check the new status
  it("ProposalsRegistrationEnded() => check workflowStatus change", async () => {
   
   await MyVotingInstance.startProposalsRegistering({ from: _owner });

    let workflowStatutBeforeChange = await MyVotingInstance.workflowStatus();
    assert.equal(workflowStatutBeforeChange.words[0], new BN(1), 'Status should be 1');

    await MyVotingInstance.endProposalsRegistering({ from: _owner });
    
    let workflowStatusAfterChange = await MyVotingInstance.workflowStatus();
    assert.equal(workflowStatusAfterChange.words[0], new BN(2), 'Status should be 2');
    
    
  });

   //check well execution of endProposalsRegistering
   //description : check event
  it("ProposalsRegistrationEnded() => check event ProposalsRegistrationEnded", async () => {
    await MyVotingInstance.startProposalsRegistering({ from: _owner });
    const result = await MyVotingInstance.endProposalsRegistering({from: _owner});
    expectEvent(result, 'WorkflowStatusChange', {
      previousStatus: new BN(1),newStatus:new BN(2)
    });
   });
  });


  
  //console.log("***********************************");
  //console.log("Check startVotingSession function ");

  describe("Check function startVotingSession()", function() {

    beforeEach(async function(){
      MyVotingInstance = await Voting.new({ from: _owner });
     // console.log("l'adress du owner est ",_owner);
    });

     //check require : Check caller is the owner
    it("startVotingSession() => check require owner", async () => {
        await expectRevert(MyVotingInstance.startVotingSession({from: _voter1}), "Ownable: caller is not the owner");
    });
    
   //check require : checker workflowStatus
  //description :  sessions status is initially not the good one 
  //               so we check the startVotingSession() function
 it("startVotingSession() => check require workflowStatus ", async () => {
    await MyVotingInstance.startProposalsRegistering({from: _owner});  
    await expectRevert(MyVotingInstance.startVotingSession({from: _owner}), "Registering proposals phase is not finished");
  });

  //check status change
  //description : we get initial status, then we execute function, and we check the new status
  it("startVotingSession() => check workflowStatus change", async () => {
    await MyVotingInstance.startProposalsRegistering({ from: _owner });
    await MyVotingInstance.endProposalsRegistering({ from: _owner });

    let workflowStatutBeforeChange = await MyVotingInstance.workflowStatus();
    assert.equal(workflowStatutBeforeChange.words[0], new BN(2), 'Status should be 2');

    await MyVotingInstance.startVotingSession({ from: _owner });
    
    let workflowStatusAfterChange = await MyVotingInstance.workflowStatus();
    assert.equal(workflowStatusAfterChange.words[0], new BN(3), 'Status should be 3');
    
    
  });

    //check well execution of startVotingSession
   //description : check event
  it("startVotingSession() => check event startVotingSession", async () => {
    await MyVotingInstance.startProposalsRegistering({ from: _owner });
    await MyVotingInstance.endProposalsRegistering({ from: _owner });
    const result = await MyVotingInstance.startVotingSession({ from: _owner });
    expectEvent(result, 'WorkflowStatusChange', {
      previousStatus: new BN(2),newStatus:new BN(3)
    });
   });
  });


 //console.log("***********************************");
 //console.log("Check SetVote function ");

 //console.log("***********************************");
  //console.log("Check startVotingSession function ");

  describe("Check require of function setVote()", function() {

    beforeEach(async function(){
      MyVotingInstance = await Voting.new({ from: _owner });
     // console.log("l'adress du owner est ",_owner);
    });

 //check require : Check caller is the owner
 it("setVote() => check require onlyVoters", async () => {
  await MyVotingInstance.addVoter(_voter1, { from: _owner }); //register a voter
  await expectRevert(MyVotingInstance.setVote(new BN(1), {from: _voter2}), "You're not a voter");
});

 //check require : checker workflowStatus
//description :  set sessions status to a bad state
//               then try to execute the function

it("setVote() => check require status", async () => {
  await MyVotingInstance.addVoter(_voter1, {from: _owner}); 
  await MyVotingInstance.startProposalsRegistering({from: _owner}); 
    await MyVotingInstance.endProposalsRegistering({from: _owner});//we set the session status to an ineligible status
    await expectRevert(MyVotingInstance.setVote(new BN(0), {from: _voter1}), "Voting session havent started yet");
  
  });

//check require : check user has already voted
//description : set a vote, then set another vote from the same voter
it("setVote() => check voter has already voted", async () => {
  await MyVotingInstance.addVoter(_voter1, {from: _owner}); 
  await MyVotingInstance.startProposalsRegistering({from: _owner}); 
    await MyVotingInstance.endProposalsRegistering({from: _owner});
    await MyVotingInstance.startVotingSession({from: _owner});
    await MyVotingInstance.setVote(new BN(0), {from: _voter1});
    await expectRevert(MyVotingInstance.setVote(new BN(0), {from: _voter1}), "You have already voted");
  
  });
});

  describe("Check function setVote()", function() {

    //for all test, we initiate the workflow within "start voting" session status
    beforeEach(async function(){
      MyVotingInstance = await Voting.new({ from: _owner });
      await MyVotingInstance.addVoter(_voter1, {from: _owner}); 
      await MyVotingInstance.startProposalsRegistering({from: _owner});
      await MyVotingInstance.addProposal(_proposalDescription1,{from: _voter1});
      
      await MyVotingInstance.endProposalsRegistering({from: _owner});
      await MyVotingInstance.startVotingSession({from: _owner});
        // console.log("l'adress du owner est ",_owner);
    });

//check input ne depasse pas le tab
it("setVote() => check input id is Ok", async () => {

});

//check setvote storage (counter and proposalId)
//description : check proposalId and count from a voter before vote
//              then execute setVote and check proposalId and count after vote
it("setVote() => check vote storage in voters struct and in proposal array", async () => {
  
  //Check vote value in voter struct before vote
  let valueBeforeVote = (await MyVotingInstance.getVoter(_voter1,{from: _voter1})).votedProposalId;
  //console.log("value before vote",valueBeforeVote);
  assert.equal(valueBeforeVote, new BN(0), 'proposal id should be 0');

   //check count vote in proposals array before vote
   let countValueBeforeVote = (await MyVotingInstance.getOneProposal(new BN(1),{from: _voter1})).voteCount;
   //console.log("value before vote in proposal array",countValueBeforeVote);
   assert.equal(countValueBeforeVote, new BN(0), 'counter vote should be 0');
 
  await MyVotingInstance.setVote(new BN(1), {from: _voter1});

  //Check vote value in voter struct after vote
  let valueAfterVote = (await MyVotingInstance.getVoter(_voter1,{from: _voter1})).votedProposalId;
  //console.log("value after vote",valueAfterVote);
  assert.equal(valueAfterVote, new BN(1), 'proposal id should be 1');

  //check count vote in proposals array after vote
  let countValueAfterVote = (await MyVotingInstance.getOneProposal(new BN(1),{from: _voter1})).voteCount;
  //console.log("value after vote in proposal array",countValueAfterVote);
  assert.equal(countValueAfterVote, new BN(1), 'counter vote should be 1');

});

//check well execution of setVote
//description : check event
it("setVote() => check event", async () => {
 
  result = await MyVotingInstance.setVote(new BN(1), {from: _voter1});
  expectEvent(result, 'Voted', {
    voter: _voter1,proposalId:new BN(1)
  });
});

  });


 //console.log("***********************************");
 //console.log("Check endVotingSession function ");
 
 describe("Check function endVotingSession()", function() {

  beforeEach(async function(){
    MyVotingInstance = await Voting.new({ from: _owner });
   // console.log("l'adress du owner est ",_owner);
  });

 //check require : Check caller is the owner
 it("endVotingSession() => check require owner", async () => {
  await expectRevert(MyVotingInstance.endVotingSession({from: _voter1}), "Ownable: caller is not the owner");

});

 //check require : checker workflowStatus
//description :  set sessions status to a bad state
//               then try to execute function
it("endVotingSession() => check require workflowStatus ", async () => {
  await MyVotingInstance.startProposalsRegistering({ from: _owner });
  await MyVotingInstance.endProposalsRegistering({ from: _owner }); 
  await expectRevert(MyVotingInstance.endVotingSession({from: _owner}), "Voting session havent started yet");
});

//check endVotingSession change workflow statut
it("endVotingSession() => check workflowStatus change", async () => {
  await MyVotingInstance.startProposalsRegistering({ from: _owner });
  await MyVotingInstance.endProposalsRegistering({ from: _owner });

  await MyVotingInstance.startVotingSession({from: _owner})

  let workflowStatutBeforeChange = await MyVotingInstance.workflowStatus();
  assert.equal(workflowStatutBeforeChange.words[0], new BN(3), 'Status should be 3');

  await MyVotingInstance.endVotingSession({ from: _owner });
  
  let workflowStatusAfterChange = await MyVotingInstance.workflowStatus();
  assert.equal(workflowStatusAfterChange.words[0], new BN(4), 'Status should be 4');
  
  
});

//check well execution of endVotingSession
//description : check event
it("endVotingSession() => check event endVotingSession", async () => {
  await MyVotingInstance.startProposalsRegistering({ from: _owner });
  await MyVotingInstance.endProposalsRegistering({ from: _owner });
  await MyVotingInstance.startVotingSession({ from: _owner });
  const result = await MyVotingInstance.endVotingSession({ from: _owner });
  expectEvent(result, 'WorkflowStatusChange', {
    previousStatus: new BN(3),newStatus:new BN(4)
  });
 });
 });


//console.log("***********************************");
// console.log("Check tallyVotes function ");
 

describe("Check function tallyVotes()", function() {

  beforeEach(async function(){
    MyVotingInstance = await Voting.new({ from: _owner });
   // console.log("l'adress du owner est ",_owner);
  });


 //check require owner
 it("tallyVotes() => check require owner", async () => {
  await expectRevert(MyVotingInstance.tallyVotes({from: _voter1}), "Ownable: caller is not the owner");
});

//check require : checker workflowStatus
//description :  set sessions status to a bad state
//               then try to execute function
 it("tallyVotes() => check require status", async () => {
  await MyVotingInstance.startProposalsRegistering({ from: _owner });
  await MyVotingInstance.endProposalsRegistering({ from: _owner });
  await MyVotingInstance.startVotingSession({ from: _owner });
  await expectRevert(MyVotingInstance.tallyVotes({from: _owner}), "Current status is not voting session ended");
});

 //check vote count et winning id
 //description : add voters => voters make proposal =>voters vote for proposal => calculate winner
 //              expected winner id => 2
 it("tallyVotes() => check vote winning id", async () => {
  await MyVotingInstance.addVoter(_voter1, {from: _owner}); 
  await MyVotingInstance.addVoter(_voter2, {from: _owner});
  await MyVotingInstance.addVoter(_voter3, {from: _owner}); 
  await MyVotingInstance.startProposalsRegistering({from: _owner});
  await MyVotingInstance.addProposal(_proposalDescription1,{from: _voter1});
  await MyVotingInstance.addProposal(_proposalDescription2,{from: _voter2});
  await MyVotingInstance.addProposal(_proposalDescription3,{from: _voter3});
  await MyVotingInstance.endProposalsRegistering({from: _owner});
  await MyVotingInstance.startVotingSession({from: _owner});
  await MyVotingInstance.setVote(new BN(1), {from: _voter1});
  await MyVotingInstance.setVote(new BN(2), {from: _voter2});
  await MyVotingInstance.setVote(new BN(2), {from: _voter3});
  await MyVotingInstance.endVotingSession({from: _owner});
  //Winner should be proposal 2 

  await MyVotingInstance.tallyVotes({from: _owner});

  const winnindId = await MyVotingInstance.winningProposalID();
  assert.equal(winnindId.words[0], new BN(2), 'Status should be 2');

});
 
//checker status change after execution of function
it("tallyVotes() => check workflowStatus change", async () => {
  await MyVotingInstance.startProposalsRegistering({ from: _owner });
  await MyVotingInstance.endProposalsRegistering({ from: _owner });
  await MyVotingInstance.startVotingSession({from: _owner})
  await MyVotingInstance.endVotingSession({from: _owner});

  let workflowStatutBeforeChange = await MyVotingInstance.workflowStatus();
  //console.log("before change",workflowStatutBeforeChange.words[0]);
  assert.equal(workflowStatutBeforeChange.words[0], new BN(4), 'Status should be 4');

  await MyVotingInstance.tallyVotes({ from: _owner });
  
  let workflowStatusAfterChange = await MyVotingInstance.workflowStatus();
  assert.equal(workflowStatusAfterChange.words[0], new BN(5), 'Status should be 5');
  
  
});

//check well execution of tallyVotes
//description : check event
it("tallyVotes() => check event tallyVotes", async () => {
  await MyVotingInstance.startProposalsRegistering({ from: _owner });
  await MyVotingInstance.endProposalsRegistering({ from: _owner });
  await MyVotingInstance.startVotingSession({ from: _owner });
  await MyVotingInstance.endVotingSession({ from: _owner });
  const result = await MyVotingInstance.tallyVotes({from: _owner});
  expectEvent(result, 'WorkflowStatusChange', {
    previousStatus: new BN(4),newStatus:new BN(5)
  });
 });
});

});
