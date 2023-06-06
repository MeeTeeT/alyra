# alyra

Explication des tests unitaires :

1 - Les tests unitaires sont regroupés dans des "describes". Ces regroupements ont été réalisés par "fonction" du smart contract en essayant de regrouper les tests qui necessitent les mêmes "beforeEach"

2 - Pour chaque fonction, vérification : - Des "require" - Des calculs & stockage des informations - De la bonne execution des fonctions avec la vérification des events

2 - Execution des tests unitaires en suivant les étapes d'éxecution du Workflow

    - "Describe : Smart contract initialization" => Publication du Smart contract
        ✔ check owner of the smart contract is the deployer

    - "Describe : Check function addVoter()" => Enregistrement des votants
        ✔ addVoter() => check require owner
        ✔ addVoter() => check require workflowStatus
        ✔ addVoter() => check already register
        ✔ addVoter() => check addVoter registered the voter
        ✔ addVoter() => check event VoterRegistered

    - "Describe : Check function startProposalsRegistering()" => Ouverture des propositions
        ✔ startProposalsRegistering() => check require owner
        ✔ startProposalsRegistering() => check require workflowStatus
        ✔ startProposalsRegistering() => check workflowStatus change
        ✔ startProposalsRegistering() => check event startProposalsRegistering

    - "Describe : Check function addProposal()" => Enregistrement des propositions par les utilisateurs enregistrés
        ✔ addProposal() => check require onlyVoters
        ✔ addProposal() => check require empty proposal
        ✔ addProposal() => check proposal storage
        ✔ addProposal() => check event ProposalRegistered

    - "Describe : Check function ProposalsRegistrationEnded()" => Fermetures de propositions
        ✔ ProposalsRegistrationEnded() => check require owner
        ✔ ProposalsRegistrationEnded() => check require workflowStatus
        ✔ ProposalsRegistrationEnded() => check workflowStatus change
        ✔ ProposalsRegistrationEnded() => check event ProposalsRegistrationEnded

    - "Describe : Check function startVotingSession()" => Ouverture des votes
        ✔ startVotingSession() => check require owner
        ✔ startVotingSession() => check require workflowStatus
        ✔ startVotingSession() => check workflowStatus change
        ✔ startVotingSession() => check event startVotingSession

    - "Describe : Check require of function setVote()" => Vote des utilisateurs enregistrés (1/2)
        ✔ setVote() => check require onlyVoters
        ✔ setVote() => check require status
        ✔ setVote() => check voter has already voted

    - "Describe : Check function setVote()"  => Vote des utilisateurs enregistrés (2/2)
        ✔ setVote() => check input id is Ok
        ✔ setVote() => check vote storage in voters struct and in proposal array
        ✔ setVote() => check event

    - "Describe : Check function endVotingSession()" => Fermeture des votes
        ✔ endVotingSession() => check require owner
        ✔ endVotingSession() => check require workflowStatus
        ✔ endVotingSession() => check workflowStatus change
        ✔ endVotingSession() => check event endVotingSession

    - "Describe : Check function tallyVotes()" => Calcul du gagnant
        ✔ tallyVotes() => check require owner
        ✔ tallyVotes() => check require status
        ✔ tallyVotes() => check vote winning id
        ✔ tallyVotes() => check workflowStatus change
        ✔ tallyVotes() => check event tallyVotes
