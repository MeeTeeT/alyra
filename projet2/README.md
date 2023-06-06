# alyra

## Fichier d'explication Tests Unitaires

---

Smart Contract testé : Voting.sol
Environnement : Truffle

---

Description des tests :

1 - Les tests unitaires sont regroupés dans des "describes". Ces regroupements ont été réalisés par "fonction" du smart contract en essayant de regrouper les tests qui necessitent les mêmes "beforeEach"

2 - Pour chaque fonction, vérification :

    - Des "require"
    - Des calculs & stockage des informations
    - De la bonne execution des fonctions avec la vérification des events

3 - Execution des tests unitaires en suivant les étapes d'éxecution du Workflow

    ************************************************************
    *            Publication du Smart contract                 *
    ************************************************************

    - "Describe : Smart contract initialization" =>
        ✔ check owner of the smart contract is the deployer

    ************************************************************
    *                Enregistrement des votants                *
    ************************************************************

    - "Describe : Check function addVoter()" =>
        ✔ addVoter() => check require owner
        ✔ addVoter() => check require workflowStatus
        ✔ addVoter() => check already register
        ✔ addVoter() => check addVoter registered the voter
        ✔ addVoter() => check event VoterRegistered

    ************************************************************
    *                Ouverture des propositions                *
    ************************************************************

    - "Describe : Check function startProposalsRegistering()"
        ✔ startProposalsRegistering() => check require owner
        ✔ startProposalsRegistering() => check require workflowStatus
        ✔ startProposalsRegistering() => check workflowStatus change
        ✔ startProposalsRegistering() => check event startProposalsRegistering

    ************************************************************
    *            Enregistrement des propositions               *
    ************************************************************

    - "Describe : Check function addProposal()"
        ✔ addProposal() => check require onlyVoters
        ✔ addProposal() => check require empty proposal
        ✔ addProposal() => check proposal storage
        ✔ addProposal() => check event ProposalRegistered

    ************************************************************
    *                Fermetures de propositions                *
    ************************************************************

    - "Describe : Check function ProposalsRegistrationEnded()"
        ✔ ProposalsRegistrationEnded() => check require owner
        ✔ ProposalsRegistrationEnded() => check require workflowStatus
        ✔ ProposalsRegistrationEnded() => check workflowStatus change
        ✔ ProposalsRegistrationEnded() => check event ProposalsRegistrationEnded

    ************************************************************
    *                     Ouverture des votes                  *
    ************************************************************

    - "Describe : Check function startVotingSession()"
        ✔ startVotingSession() => check require owner
        ✔ startVotingSession() => check require workflowStatus
        ✔ startVotingSession() => check workflowStatus change
        ✔ startVotingSession() => check event startVotingSession

    ************************************************************
    *         Vote des utilisateurs enregistrés (1/2)          *
    ************************************************************

    - "Describe : Check require of function setVote()"
        ✔ setVote() => check require onlyVoters
        ✔ setVote() => check require status
        ✔ setVote() => check voter has already voted

     ************************************************************
    *         Vote des utilisateurs enregistrés (2/2)          *
    ************************************************************

    - "Describe : Check function setVote()"  => Vote des utilisateurs enregistrés (2/2)
        ✔ setVote() => check input id is Ok
        ✔ setVote() => check vote storage in voters struct and in proposal array
        ✔ setVote() => check event

    ************************************************************
    *                    Fermeture des votes                   *
    ************************************************************

    - "Describe : Check function endVotingSession()"
        ✔ endVotingSession() => check require owner
        ✔ endVotingSession() => check require workflowStatus
        ✔ endVotingSession() => check workflowStatus change
        ✔ endVotingSession() => check event endVotingSession

    ************************************************************
    *                     Calcul du gagnant                    *
    ************************************************************

    - "Describe : Check function tallyVotes()"
        ✔ tallyVotes() => check require owner
        ✔ tallyVotes() => check require status
        ✔ tallyVotes() => check vote winning id
        ✔ tallyVotes() => check workflowStatus change
        ✔ tallyVotes() => check event tallyVotes
