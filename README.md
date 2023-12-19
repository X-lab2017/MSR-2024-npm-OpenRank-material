# MSR 2024 NPM OpenRank material

This repo contains the supplementary material for NPM ecology dataset.

## Data Set

The original data set is at [Zenodo](https://zenodo.org/records/10317762), which contains the collaboration network, dependency network and social network for open source repositories in NPM ecology.

The data processes are:

![](images/data_process.png)

## OpenRank Algorithm

- File [openrank_convergence_proof.pdf](openrank_convergence_proof.pdf) contains the convergence proof of OpenRank algorithm.

## Source Code

[src/openrank.ts](src/openrank.ts) contains the source code to calculate the OpenRank value of each repository according to the data set and the parameters from questionaire.

### Environment

The data set and code relies on the following environment:

- Neo4j graph database community edition 3.4.10.
- Neo4j GDS libraries 1.7.3.
- OpenRank GDS plugin 1.7.3.
- Node.js 14.3.0.

### Commands

For proper Neo4j database, uses `tsc && src/openrank.js` to run the source code.
