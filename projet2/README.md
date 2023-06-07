# alyra

## Fichier d'explication Tests Unitaires

---

Smart Contract testé : Voting.sol

Environnement : Truffle

Cas testé : 39 tests unitaires

---

Description des tests :

1 - Execution des tests unitaires en suivant les étapes chronologiques d'éxecution du Workflow de voting

2 - Les tests unitaires sont regroupés dans des "describe", un par fonction.
Pour les fonctions de "traitements" (= toutes les fonctions à l'exclusion des fonctions de changement de statut), les "describe" sont eux mêmes découpés en "context" (require / function / event)

Difficultés rencontrées au niveau de la factorisation du code :
J'ai essayé de factoriser le plus possible de code dans des "beforeEach", qui se trouvent soit au niveau des "subscribe", soit au niveau des "context".
Ma difficulté réside dans le fait que dans mes fonctions, j'ai un test sur le statut du workflow que je fais en fixant exprès un mauvais statut pour vérifier qu'un revert se fait bien. Mais cette fixation de statut m'empeche de factoriser du code au niveau plus haut dans les "forEach".

3 - Pour chaque fonction, vérification :

    - Des "require"
    - Des calculs & stockage des informations
    - De la bonne execution des fonctions avec la vérification des events

4 - Coverage :
J'ai utilisé truffle et je n'ai pas accès au calcul du coverage. Je ne peux pas le vérifier.
(manque de temps pour me refaire une config hardhat avec modif du code associé)

    ************************************************************
    *            Publication du Smart contract                 *
    ************************************************************

    - "Describe : Smart contract initialization" =>
        ✔ check owner of the smart contract is the deployer

    ************************************************************
    *                Enregistrement des votants                *
    ************************************************************

    - "Describe : Check function addVoter()"
      addVoter() => Check require
        ✓ addVoter() => check require owner
        ✓ addVoter() => check require workflowStatus  (94840 gas)
        ✓ addVoter() => check already register (50220 gas)
      addVoter() => Check function
        ✓ addVoter() => check addVoter storage isRegistered
        ✓ addVoter() => check addVoter storage hasVoted
        ✓ addVoter() => check addVoter storage voteProposalId
      addVoter() => Check event
        ✓ addVoter() => check event VoterRegistered

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
      addProposal() => Check require
        ✓ addProposal() => check require onlyVoters
        ✓ addProposal() => check require empty proposal
      addProposal() => Check function
        ✓ addProposal() => check proposal storage (59052 gas)
      addProposal() => Check event
        ✓ addProposal() => check event ProposalRegistered

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
    *         Vote des utilisateurs enregistrés                *
    ************************************************************

    - "Describe : Check require of function setVote()"
      setVote() => Check require
        ✓ setVote() => check require onlyVoters (50220 gas)
        ✓ setVote() => check require status (175659 gas)
        ✓ setVote() => check voter has already voted (264314 gas)
      setVote() => Check function
        ✓ setVote() => check input id is Ok
        ✓ setVote() => check vote storage in voters struct and in proposal array (78013 gas)
      setVote() => Check event
        ✓ setVote() => check event

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
      tallyVotes() => Check require
        ✓ tallyVotes() => check require owner
        ✓ tallyVotes() => check require status (155993 gas)
      tallyVotes() => Check function
        ✓ tallyVotes() => check vote winning id (797734 gas)
        ✓ tallyVotes() => check workflowStatus change (224375 gas)
      tallyVotes() => Check event
        ✓ tallyVotes() => check event tallyVotes
