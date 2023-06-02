/************************** */
/** EN COURS DE REALISATION */
/************************** */

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
  /*
  it("check require workflowStatus ", async () => {
    await expectRevert(MyVotingInstance.addVoter(_voter2, {from: _owner}), "Voters registration is not open yet");
  });
  */
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

  //checker le changement de statut apres execution de la fonction
  /*
  it("startProposalsRegistering() => check workflowStatus change", async () => {
    const result = await MyVotingInstance.startProposalsRegistering({ from: _owner });
    let statut = await MyVotingInstance.workflowStatus();

    assert.equal(statut, MyVotingInstance.WorkflowStatus.ProposalsRegistrationStarted, 'Status should be ProposalsRegistrationStarted');
 
    
  });
*/
  //checker l'event

 /*
  it("startProposalsRegistering() => check event startProposalsRegistering", async () => {
    const result = await MyVotingInstance.startProposalsRegistering({ from: _owner });
    expectEvent(result, 'WorkflowStatusChange', {
      previousStatus: _voter1,newStatus:
    });
   });
   */

   //faire le test de toutes les fonctions de status

   console.log("***********************************");
   console.log("Check addProposal function ");

   it("addProposal() => check require onlyVoters", async () => {
    await MyVotingInstance.addVoter(_voter1, { from: _owner }); //register a voter
    const result = await MyVotingInstance.startProposalsRegistering({ from: _owner }); //start proposal sesssion

    await expectRevert(MyVotingInstance.addProposal(_proposalDescription1, {from: _voter2}), "You're not a voter");
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
   

   it("endProposalsRegistering() => check require owner", async () => {
    await expectRevert(MyVotingInstance.endProposalsRegistering({from: _voter1}), "Ownable: caller is not the owner");
  });

  console.log("***********************************");
  console.log("Check startVotingSession function ");
  

  it("startVotingSession() => check require owner", async () => {
   await expectRevert(MyVotingInstance.startVotingSession({from: _voter1}), "Ownable: caller is not the owner");
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
  //await expectRevert(MyVotingInstance.tallyVotes({from: _voter1}), "Ownable: caller is not the owner");
});
//check already vote
it("setVote() => check voter has already voted", async () => {
  //await expectRevert(MyVotingInstance.tallyVotes({from: _voter1}), "Ownable: caller is not the owner");
});
//check input ne depasse pas le tab
it("setVote() => check input id is Ok", async () => {
  //await expectRevert(MyVotingInstance.tallyVotes({from: _voter1}), "Ownable: caller is not the owner");
});
//verif du storage
it("setVote() => check vote storage", async () => {
  //await expectRevert(MyVotingInstance.tallyVotes({from: _voter1}), "Ownable: caller is not the owner");
});
//verif de l'event
it("setVote() => check event", async () => {
  //await expectRevert(MyVotingInstance.tallyVotes({from: _voter1}), "Ownable: caller is not the owner");
});


 console.log("***********************************");
 console.log("Check endVotingSession function ");
 

 it("endVotingSession() => check require owner", async () => {
  await expectRevert(MyVotingInstance.endVotingSession({from: _voter1}), "Ownable: caller is not the owner");
});

console.log("***********************************");
 console.log("Check tallyVotes function ");
 
 //check owner
 it("tallyVotes() => check require owner", async () => {
  await expectRevert(MyVotingInstance.tallyVotes({from: _voter1}), "Ownable: caller is not the owner");
});
 //check status
 it("tallyVotes() => check require status", async () => {
  //await expectRevert(MyVotingInstance.tallyVotes({from: _voter1}), "Ownable: caller is not the owner");
});
 //check vote count et winning id
 it("tallyVotes() => check vote count and winning id status", async () => {
  });
 //check changement de statut
 it("tallyVotes() => check session status changed", async () => {
});
 //check event
 it("tallyVotes() => check event", async () => {
});








/*
  it("has a name", async () => {
    expect(await MyTokenInstance.name()).to.equal(_name);
  });

  it("has a symbol", async () => {
    expect(await MyTokenInstance.symbol()).to.equal(_symbol);
  });

  it("has a decimal", async () => {
    expect(await MyTokenInstance.decimals()).to.be.bignumber.equal(_decimal);
  });

  it("check first balance", async () => {
    expect(await MyTokenInstance.balanceOf(_owner)).to.be.bignumber.equal(_initialSupply);
  });

  it("check balance after transfer", async () => {
    let amount = new BN(100);
    let balanceOwnerBeforeTransfer = await MyTokenInstance.balanceOf(_owner);
    let balanceRecipientBeforeTransfer = await MyTokenInstance.balanceOf(_recipient)

    expect(balanceRecipientBeforeTransfer).to.be.bignumber.equal(new BN(0));
    
    await MyTokenInstance.transfer(_recipient, new BN(100), {from: _owner});

    let balanceOwnerAfterTransfer = await MyTokenInstance.balanceOf(_owner);
    let balanceRecipientAfterTransfer = await MyTokenInstance.balanceOf(_recipient)

    expect(balanceOwnerAfterTransfer).to.be.bignumber.equal(balanceOwnerBeforeTransfer.sub(amount));
    expect(balanceRecipientAfterTransfer).to.be.bignumber.equal(balanceRecipientBeforeTransfer.add(amount));
  });

  
  it("check if approval done", async () => {
    let amount = new BN(100);
    let AllowanceBeforeApproval = await MyTokenInstance.allowance(_owner, _recipient);
    expect(AllowanceBeforeApproval).to.be.bignumber.equal(new BN(0));

    await MyTokenInstance.approve(_recipient, amount);
    
    let AllowanceAfterApproval = await MyTokenInstance.allowance(_owner, _recipient);
    expect(AllowanceAfterApproval).to.be.bignumber.equal(amount);
  });

    
  it("check if transferFrom done", async () => {
    let amount = new BN(100);
    
    await MyTokenInstance.approve(_recipient, amount);

    let balanceOwnerBeforeTransfer = await MyTokenInstance.balanceOf(_owner);
    let balanceRecipientBeforeTransfer = await MyTokenInstance.balanceOf(_recipient)
    expect(balanceOwnerBeforeTransfer).to.be.bignumber.equal(_initialSupply);
    expect(balanceRecipientBeforeTransfer).to.be.bignumber.equal(new BN(0));

    await MyTokenInstance.transferFrom(_owner, _recipient, amount, { from: _recipient})

    let balanceOwnerAfterTransfer = await MyTokenInstance.balanceOf(_owner);
    let balanceRecipientAfterTransfer = await MyTokenInstance.balanceOf(_recipient)

    expect(balanceOwnerAfterTransfer).to.be.bignumber.equal(balanceOwnerBeforeTransfer.sub(amount));
    expect(balanceRecipientAfterTransfer).to.be.bignumber.equal(balanceRecipientBeforeTransfer.add(amount));
  });
  */
});
