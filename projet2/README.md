# alyra

## Fichier d'explication Tests Unitaires

---

Smart Contract testé : Voting.sol

Environnement : Truffle

Cas testé : 40 tests unitaires

---

**Description des tests :**

**1 - Execution des tests unitaires en suivant les étapes chronologiques d'éxecution du Workflow de voting**

**2 - Les tests unitaires sont regroupés dans des "describe", un par fonction.**

Pour les fonctions de "traitements" (= toutes les fonctions à l'exclusion des fonctions de changement de statut), les "describe" sont eux mêmes découpés en "context" (1 context pour les require, 1 contexte pour la computation des functions et un contexte pour la gestion des event)

**Difficultés rencontrées au niveau de la factorisation du code** :

J'ai essayé de factoriser le plus possible de code dans des "beforeEach", qui se trouvent soit au niveau des "subscribe", soit au niveau des "context".  
Ma difficulté réside dans le fait que dans de nombreuses fonctions, j'ai un test sur le statut du workflow que je fais en fixant exprès un mauvais statut pour vérifier qu'un revert se fait bien. Mais cette fixation de statut m'empeche de factoriser du code plus haut dans les 'foreach' en allant jusqu'au statut approprié du wkf.

**3 - Pour chaque fonction, vérification :**

    - Des "require"
    - Des calculs & stockage des informations
    - De la bonne execution des fonctions avec la vérification des events

**4 - Coverage :**

J'ai utilisé truffle et j'ai transféré sur hardhat pour calculer le coverage :
(Malheureusement, je n'ai pas le temps pour améliorer mes tests pour couvrir un 100% de coverage) :

```
-------------|----------|----------|----------|----------|----------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------|----------|----------|----------|----------|----------------|
 contracts/  |      100 |    91.67 |      100 |      100 |                |
  Voting.sol |      100 |    91.67 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|
All files    |      100 |    91.67 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|
```

**5 - Les tests unitaires sont documentés à l'interieur du script de test unitaire en lui même**

```
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
        ✓ addVoter() => check require workflowStatus
        ✓ addVoter() => check already register
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
        ✓ addProposal() => check proposal storage
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
        ✓ setVote() => check require onlyVoters
        ✓ setVote() => check require status
        ✓ setVote() => check voter has already voted
      setVote() => Check function
        ✓ setVote() => check input id is Ok
        ✓ setVote() => check vote storage in voters struct and in proposal array
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
        ✓ tallyVotes() => check require status
      tallyVotes() => Check function
        ✓ tallyVotes() => check vote winning id
        ✓ tallyVotes() => check workflowStatus change
      tallyVotes() => Check event
        ✓ tallyVotes() => check event tallyVotes
```
