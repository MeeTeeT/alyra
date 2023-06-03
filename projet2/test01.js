const Voting = artifacts.require("./Voting.sol");
const { BN , expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract("Voting", accounts => {
  
  /*
expect(mot).to.equal(”mot”, "Les mots sont pas les memes");
await expectRevert(lesmots.StoreWord("mot1", {from: j1}), "ce joueur a déjà joué");
const result = await lesmots.getResults({from: j1});
expectEvent(result, 'finalResults', {
	lemot: “motfinal”,
	winnerAddr: j1
});

  */
 
  
  const _owner = accounts[0];
  const _voter1 = accounts[1];
  const _voter2 = accounts[2];
  const _voter3 = accounts[3];
  const _proposalDescriptionEmpty = "";
  const _proposalDescription1 = "Vitalik";
  const _proposalDescription2 = "Satoshi";
  const _proposalDescription3 = "Linux";
  //const workflowStatus
  const _decimal = new BN(18);
  

  let MyVotingInstance;

  beforeEach(async function(){
    MyVotingInstance = await Voting.new({ from: _owner });
   // console.log("l'adress du owner est ",_owner);
  });
  
  console.log("***********************************");
  console.log("Check addVoter function")
 
  it("addVoter() => check require owner", async () => {
    await expectRevert(MyVotingInstance.addVoter(_voter2, {from: _voter1}), "Ownable: caller is not the owner");
  });
  //checker le fait que la fonction ne se lance que on est dans le bon statut
  
  it("addVoter() => check require workflowStatus ", async () => {
    await MyVotingInstance.startProposalsRegistering({from: _owner}); //we set the session status to an ineligible status
    //const status = await myContractInstance.myEnumValue()
    await expectRevert(MyVotingInstance.addVoter(_voter2, {from: _owner}), "Voters registration is not open yet");
  });
  
  //check already registrer
  it("addVoter() => check already register", async () => {
    await MyVotingInstance.addVoter(_voter1, { from: _owner });
    await expectRevert(MyVotingInstance.addVoter(_voter1, {from: _owner}), "Already registered");
  });

  it("addVoter() => check addVoter registered the voter ", async () => {
    await MyVotingInstance.addVoter(_voter1, { from: _owner });
    //console.log("Le owner : ",_owner," register voter ",_voter1)
    const result = await MyVotingInstance.getVoter(_voter1, {from:_voter1}); //{from: _voter1} => seul quelqu'un de register peut lancer la fonction getVoter
    assert.isTrue(result.isRegistered);
   });
 
   //checker l'event
   it("addVoter() => check event VoterRegistered", async () => {
    const result = await MyVotingInstance.addVoter(_voter1, { from: _owner });
    expectEvent(result, 'VoterRegistered', {
      voterAddress: _voter1
    });
   });
  
   

   console.log("***********************************");
   console.log("Check startProposalsRegistering function ");
   

   it("startProposalsRegistering() => check require owner", async () => {
    await expectRevert(MyVotingInstance.startProposalsRegistering({from: _voter1}), "Ownable: caller is not the owner");
  });
  //checker le statut avant l'exec de la fonction
  it("startProposalsRegistering() => check require workflowStatus ", async () => {
    await MyVotingInstance.startProposalsRegistering({from: _owner}); 
    await MyVotingInstance.endProposalsRegistering({from: _owner}); //we set the session status to an ineligible status
    await expectRevert(MyVotingInstance.startProposalsRegistering({from: _owner}), "Registering proposals cant be started now");
  });

  //checker le changement de statut apres execution de la fonction
  it("startProposalsRegistering() => check workflowStatus change", async () => {
   
    let workflowStatutBeforeChange = await MyVotingInstance.workflowStatus();
    //console.log("before change",workflowStatutBeforeChange.words[0]);
    assert.equal(workflowStatutBeforeChange.words[0], new BN(0), 'Status should be 0');

    await MyVotingInstance.startProposalsRegistering({ from: _owner });
    
    let workflowStatusAfterChange = await MyVotingInstance.workflowStatus();
    assert.equal(workflowStatusAfterChange.words[0], new BN(1), 'Status should be 1');
    
    
  });

  //checker l'event
  it("startProposalsRegistering() => check event startProposalsRegistering", async () => {
    const result = await MyVotingInstance.startProposalsRegistering({ from: _owner });
    expectEvent(result, 'WorkflowStatusChange', {
      previousStatus: new BN(0),newStatus:new BN(1)
    });
   });
   



   console.log("***********************************");
   console.log("Check addProposal function ");

   it("addProposal() => check require onlyVoters", async () => {
    await MyVotingInstance.addVoter(_voter1, { from: _owner }); //register a voter
    const result = await MyVotingInstance.startProposalsRegistering({ from: _owner }); //start proposal sesssion
    await expectRevert(MyVotingInstance.addProposal(_proposalDescription1, {from: _voter2}), "You're not a voter"); // a proposal submit by a non registered user
  });
  it("addProposal() => check require empty proposal", async () => {
    await MyVotingInstance.addVoter(_voter1, { from: _owner }); //register a voter1
    const result = await MyVotingInstance.startProposalsRegistering({ from: _owner }); //start proposal sesssion

    await expectRevert(MyVotingInstance.addProposal(_proposalDescriptionEmpty, {from: _voter1}), "Vous ne pouvez pas ne rien proposer");
  });

  it("addProposal() => check proposal storage", async () => {
    await MyVotingInstance.addVoter(_voter1, { from: _owner }); //register a voter1
    await MyVotingInstance.startProposalsRegistering({ from: _owner }); //start proposal sesssion
    await MyVotingInstance.addProposal(_proposalDescription1, {from: _voter1});
    let storeDescription = (await MyVotingInstance.getOneProposal(1, {from: _voter1})).description;
    assert.equal(storeDescription,_proposalDescription1); //check 1 index and not the 0 index  because by default, at startProposalregistering, a "GENESIS" proposal is set.
  });
  it("addProposal() => check event ProposalRegistered", async () => {
    await MyVotingInstance.addVoter(_voter1, { from: _owner }); //register a voter1
    await MyVotingInstance.startProposalsRegistering({ from: _owner }); //start proposal sesssion
    result = await MyVotingInstance.addProposal(_proposalDescription1, {from: _voter1});
    expectEvent(result, 'ProposalRegistered', {
      proposalId: new BN(1)
    });
   });


   console.log("***********************************");
   console.log("Check ProposalsRegistrationEnded function ");
   
   it("ProposalsRegistrationEnded() => check require owner", async () => {
    await expectRevert(MyVotingInstance.startProposalsRegistering({from: _voter1}), "Ownable: caller is not the owner");
  });
  //checker le statut avant l'exec de la fonction
  it("ProposalsRegistrationEnded() => check require workflowStatus ", async () => {
    //session status is not the good one initially => We check if revert occurs
    await expectRevert(MyVotingInstance.endProposalsRegistering({from: _owner}), "Registering proposals havent started yet");
  });

  //checker le changement de statut apres execution de la fonction
  it("ProposalsRegistrationEnded() => check workflowStatus change", async () => {
   
   await MyVotingInstance.startProposalsRegistering({ from: _owner });

    let workflowStatutBeforeChange = await MyVotingInstance.workflowStatus();
    //console.log("before change",workflowStatutBeforeChange.words[0]);
    assert.equal(workflowStatutBeforeChange.words[0], new BN(1), 'Status should be 1');

    await MyVotingInstance.endProposalsRegistering({ from: _owner });
    
    let workflowStatusAfterChange = await MyVotingInstance.workflowStatus();
    assert.equal(workflowStatusAfterChange.words[0], new BN(2), 'Status should be 2');
    
    
  });

  //checker l'event
  it("ProposalsRegistrationEnded() => check event ProposalsRegistrationEnded", async () => {
    await MyVotingInstance.startProposalsRegistering({ from: _owner });
    const result = await MyVotingInstance.endProposalsRegistering({from: _owner});
    expectEvent(result, 'WorkflowStatusChange', {
      previousStatus: new BN(1),newStatus:new BN(2)
    });
   });

  console.log("***********************************");
  console.log("Check startVotingSession function ");
  


  it("startVotingSession() => check require owner", async () => {
    await expectRevert(MyVotingInstance.startVotingSession({from: _voter1}), "Ownable: caller is not the owner");
  });
  //checker le statut avant l'exec de la fonction
  it("startVotingSession() => check require workflowStatus ", async () => {
    await MyVotingInstance.startProposalsRegistering({from: _owner});  
    await expectRevert(MyVotingInstance.startVotingSession({from: _owner}), "Registering proposals phase is not finished");
  });

  //checker le changement de statut apres execution de la fonction
  it("startVotingSession() => check workflowStatus change", async () => {
    await MyVotingInstance.startProposalsRegistering({ from: _owner });
    await MyVotingInstance.endProposalsRegistering({ from: _owner });

    let workflowStatutBeforeChange = await MyVotingInstance.workflowStatus();
    //console.log("before change",workflowStatutBeforeChange.words[0]);
    assert.equal(workflowStatutBeforeChange.words[0], new BN(2), 'Status should be 2');

    await MyVotingInstance.startVotingSession({ from: _owner });
    
    let workflowStatusAfterChange = await MyVotingInstance.workflowStatus();
    assert.equal(workflowStatusAfterChange.words[0], new BN(3), 'Status should be 3');
    
    
  });

  //checker l'event
  it("startVotingSession() => check event startVotingSession", async () => {
    await MyVotingInstance.startProposalsRegistering({ from: _owner });
    await MyVotingInstance.endProposalsRegistering({ from: _owner });
    const result = await MyVotingInstance.startVotingSession({ from: _owner });
    expectEvent(result, 'WorkflowStatusChange', {
      previousStatus: new BN(2),newStatus:new BN(3)
    });
   });


 console.log("***********************************");
 console.log("Check SetVote function ");
 it("setVote() => check require onlyVoters", async () => {
  await MyVotingInstance.addVoter(_voter1, { from: _owner }); //register a voter
  //const result = await MyVotingInstance.startProposalsRegistering({ from: _owner }); //start proposal sesssion
  await expectRevert(MyVotingInstance.setVote(new BN(1), {from: _voter2}), "You're not a voter");
});
//check status
it("setVote() => check require status", async () => {
  await MyVotingInstance.addVoter(_voter1, {from: _owner}); 
  await MyVotingInstance.startProposalsRegistering({from: _owner}); 
    await MyVotingInstance.endProposalsRegistering({from: _owner});//we set the session status to an ineligible status
    await expectRevert(MyVotingInstance.setVote(new BN(0), {from: _voter1}), "Voting session havent started yet");
  
  });
//check already vote
it("setVote() => check voter has already voted", async () => {
  await MyVotingInstance.addVoter(_voter1, {from: _owner}); 
  await MyVotingInstance.startProposalsRegistering({from: _owner}); 
    await MyVotingInstance.endProposalsRegistering({from: _owner});
    await MyVotingInstance.startVotingSession({from: _owner});
    await MyVotingInstance.setVote(new BN(0), {from: _voter1});
    await expectRevert(MyVotingInstance.setVote(new BN(0), {from: _voter1}), "You have already voted");
  
});
//check input ne depasse pas le tab
it("setVote() => check input id is Ok", async () => {

});
//verif du storage
it("setVote() => check vote storage in voters struct and in proposal array", async () => {
  

  await MyVotingInstance.addVoter(_voter1, {from: _owner}); 
  await MyVotingInstance.startProposalsRegistering({from: _owner});
  await MyVotingInstance.addProposal(_proposalDescription1,{from: _voter1});
   
  await MyVotingInstance.endProposalsRegistering({from: _owner});
  await MyVotingInstance.startVotingSession({from: _owner});

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
//verif de l'event
it("setVote() => check event", async () => {
  await MyVotingInstance.addVoter(_voter1, {from: _owner}); 
  await MyVotingInstance.startProposalsRegistering({from: _owner});
  await MyVotingInstance.addProposal(_proposalDescription1,{from: _voter1});
   
  await MyVotingInstance.endProposalsRegistering({from: _owner});
  await MyVotingInstance.startVotingSession({from: _owner});
  result = await MyVotingInstance.setVote(new BN(1), {from: _voter1});

  expectEvent(result, 'Voted', {
    voter: _voter1,proposalId:new BN(1)
  });
});


 console.log("***********************************");
 console.log("Check endVotingSession function ");
 
 it("endVotingSession() => check require owner", async () => {
  await expectRevert(MyVotingInstance.endVotingSession({from: _voter1}), "Ownable: caller is not the owner");

});
//checker le statut avant l'exec de la fonction
it("endVotingSession() => check require workflowStatus ", async () => {
  await MyVotingInstance.startProposalsRegistering({ from: _owner });
  await MyVotingInstance.endProposalsRegistering({ from: _owner }); 
  await expectRevert(MyVotingInstance.endVotingSession({from: _owner}), "Voting session havent started yet");
});

//checker le changement de statut apres execution de la fonction
it("endVotingSession() => check workflowStatus change", async () => {
  await MyVotingInstance.startProposalsRegistering({ from: _owner });
  await MyVotingInstance.endProposalsRegistering({ from: _owner });

  await MyVotingInstance.startVotingSession({from: _owner})

  let workflowStatutBeforeChange = await MyVotingInstance.workflowStatus();
  //console.log("before change",workflowStatutBeforeChange.words[0]);
  assert.equal(workflowStatutBeforeChange.words[0], new BN(3), 'Status should be 3');

  await MyVotingInstance.endVotingSession({ from: _owner });
  
  let workflowStatusAfterChange = await MyVotingInstance.workflowStatus();
  assert.equal(workflowStatusAfterChange.words[0], new BN(4), 'Status should be 4');
  
  
});

//checker l'event
it("endVotingSession() => check event endVotingSession", async () => {
  await MyVotingInstance.startProposalsRegistering({ from: _owner });
  await MyVotingInstance.endProposalsRegistering({ from: _owner });
  await MyVotingInstance.startVotingSession({ from: _owner });
  const result = await MyVotingInstance.endVotingSession({ from: _owner });
  expectEvent(result, 'WorkflowStatusChange', {
    previousStatus: new BN(3),newStatus:new BN(4)
  });
 });



console.log("***********************************");
 console.log("Check tallyVotes function ");
 
 //check owner
 it("tallyVotes() => check require owner", async () => {
  await expectRevert(MyVotingInstance.tallyVotes({from: _voter1}), "Ownable: caller is not the owner");
});
 //check status
 it("tallyVotes() => check require status", async () => {
  await MyVotingInstance.startProposalsRegistering({ from: _owner });
  await MyVotingInstance.endProposalsRegistering({ from: _owner });
  await MyVotingInstance.startVotingSession({ from: _owner });
  await expectRevert(MyVotingInstance.tallyVotes({from: _owner}), "Current status is not voting session ended");
});
 //check vote count et winning id
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
  //console.log("winner : ",winnindId.words[0]);
  assert.equal(winnindId.words[0], new BN(2), 'Status should be 2');

});
 
//checker le changement de statut apres execution de la fonction
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
//checker l'event
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
